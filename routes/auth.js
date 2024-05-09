const express = require('express');
const router = express.Router();
const User = require('../models/users');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');

// Route de signup
router.post('/signup', async (req, res) => {
  try {
    // Extract user data
    const { FullName, email, password, confirmPassword } = req.body;

    // Validate required fields
    if (!FullName || !email || !password || !confirmPassword) {
      return res.status(400).send({ message: 'Missing required fields' });
    }

    // Validate password length
    if (password.length < 8) {
      return res.status(400).send({ message: 'Password must be at least 8 characters long' });
    }

    // Validate password match
    if (password !== confirmPassword) {
      return res.status(400).send({ message: 'Passwords do not match' });
    }

    // Check for existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).send({ message: 'An account with this email address already exists' });
    }

    // Validate password complexity (optional)
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).send({ message: 'The password must contain at least one uppercase letter, one lowercase letter, and one number' });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Generate email confirmation token
    const emailConfirmationToken = crypto.randomBytes(20).toString('hex');

    // Create new user instance with proper casing for 'FullName'
    const newUser = new User({
      FullName,
      email,
      password: hashedPassword,
      emailConfirmationToken,
      emailConfirmed: false,
    });

    // Save the new user
    await newUser.save();

    // Send email confirmation
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'amrdounia2004@gmail.com',
        pass: 'qwgr rawi nvtw dfgs',
      }
    });

    const mailOptions = {
      from: 'TrackifyMe Team <amrdounia2004@gmail.com>',
      to: newUser.email,
      subject: 'Email Confirmation',
      text: `Click the following link to confirm your email: http://yourdomain.com/confirm-email/${emailConfirmationToken}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
      } else {
        console.log('Email sent:', info.response);
      }
    });

    // Send successful registration response
    res.status(201).send({ message: 'Successful registration. Please check your email for confirmation' });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Sign-up failed' });
  }
});

// Route de login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for missing fields
    if (!email || !password) {
      return res.status(400).send({ message: 'Missing required fields' });
    }

    // Find user by email
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res.status(401).send({ message: 'Invalid email or password' });
    }

    // Compare password using bcrypt (assuming User model has comparePassword)
    const isMatch = await bcrypt.compare(password, existingUser.password);
    if (!isMatch) {
      return res.status(401).send({ message: 'Invalid email or password' });
    }

    // Check if email is confirmed
    if (!existingUser.emailConfirmed) {
      return res.status(401).send({ message: 'Email not confirmed. Please check your email for confirmation' });
    }

    // Login successful, generate JWT token
    const userId = existingUser._id;
    const secret = 'qwgr rawi nvtw dfgs';
    const expiresIn = 60 * 60;

    const token = jwt.sign({ userId }, secret, { expiresIn });

    // Send response with token
    res.status(200).send({ message: 'Login successful', token });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Login error' });
  }
});

// Route de confirmation d'email
router.get('/confirm-email/:token', async (req, res) => {
  try {
    const token = req.params.token;

    // Find user by email confirmation token
    const user = await User.findOne({ emailConfirmationToken: token });

    if (!user) {
      return res.status(404).send('Invalid confirmation token');
    }

    // Set emailConfirmed to true and remove emailConfirmationToken
    user.emailConfirmed = true;
    user.emailConfirmationToken = undefined;

    // Save the updated user
    await user.save();

    res.status(200).send('Email confirmed successfully');
  } catch (error) {
    console.error('Error confirming email:', error);
    res.status(500).send('Error confirming email');
  }
});


// Route pour envoyer un email de réinitialisation de mot de passe
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    // Vérifie que l'email est fourni
    if (!email) {
      return res.status(400).send({ message: 'Email is required' });
    }

    // Trouve l'utilisateur par email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).send({ message: 'No user found with this email' });
    }

    // Génère un token pour la réinitialisation du mot de passe
    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

    // Enregistre l'utilisateur avec le token de réinitialisation
    await user.save();

    // Envoie l'email de réinitialisation de mot de passe
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'amrdounia2004@gmail.com',
        pass: 'qwgr rawi nvtw dfgs',
      }
    });

    const mailOptions = {
      from: 'TrackifyMe Team <amrdounia2004@gmail.com>',
      to: user.email,
      subject: 'Password Reset',
      text: `You are receiving this email because you (or someone else) have requested the reset of the password for your account.\n\n
      Please click on the following link, or paste this into your browser to complete the process:\n\n
      http://${req.headers.host}/reset-password/${resetToken}\n\n
      If you did not request this, please ignore this email and your password will remain unchanged.\n`
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
        return res.status(500).send({ message: 'Error sending email for password reset' });
      } else {
        console.log('Email sent:', info.response);
        return res.status(200).send({ message: 'Password reset email sent successfully' });
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Forgot password error' });
  }
});

// Route de réinitialisation du mot de passe
router.post('/reset-password/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword, confirmNewPassword } = req.body;

    // Vérifie que les nouveaux mots de passe correspondent
    if (newPassword !== confirmNewPassword) {
      return res.status(400).send({ message: 'Passwords do not match' });
    }

    // Trouve l'utilisateur par token de réinitialisation
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).send({ message: 'Invalid or expired token' });
    }

    // Hash le nouveau mot de passe et enregistre l'utilisateur
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).send({ message: 'Password reset successful' });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Reset password error' });
  }
});

module.exports = router;