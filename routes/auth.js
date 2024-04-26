const express = require('express');
const router = express.Router();
const User = require('../models/users'); // Assuming the model is named User
const bcrypt = require('bcrypt');

// Route de signup
router.post('/signup', async (req, res) => {
  try {
    // Extract user data
    const { FullName, email, password, confirmPassword, CarId } = req.body;

    // Validate required fields
    if (!FullName || !email || !password || !confirmPassword || !CarId) {
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

    // Create new user instance with proper casing for 'FullName'
    const newUser = new User({
      FullName,
      email,
      password: hashedPassword,
      CarId,
    });

    // Save the new user
    await newUser.save();

    // Send successful registration response
    res.status(201).send({ message: 'Successful registration' });
  } catch (error) {
    // Handle database validation errors (optional)
    if (error.name === 'ValidationError') {
      const validationErrors = Object.keys(error.errors).map(key => ({
        field: key,
        message: error.errors[key].message,
      }));
      return res.status(400).send({ message: 'Failed validation', errors: validationErrors });
    }

    // Handle other errors
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
    const existingUser = await user.findOne({ email });
    if (!existingUser) {
      return res.status(401).send({ message: 'Invalid email or password' });
    }

    // Compare password using bcrypt (assuming User model has comparePassword)
    const isMatch = await bcrypt.compare(password , existingUser.password);
    if (!isMatch) {
      return res.status(401).send({ message: 'Invalid email or password' });
    }

    // Login successful, generate JWT token
    const userId = existingUser._id; // Assuming User model has an ID field
    const secret = 'your_secret_key'; // Replace with a strong secret key
    const expiresIn = 60 * 60; // Token expires in 1 hour

    const token = jwt.sign({ userId }, secret, { expiresIn });

    // Send response with token
    res.status(200).send({ message: 'Login successful', token });


  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Login error' });
  }
});

module.exports = router;
