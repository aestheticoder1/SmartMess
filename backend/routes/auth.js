const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();


// 1.) User Registration
// @route POST /api/user/register
// @desc Register a new user
// @access Public
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, studentId, role } = req.body;

        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: 'User already exists' });

        user = new User({ name, email, password, studentId, role });
        await user.save();

        const savedUser = await user.save();
        const token = await savedUser.getJWT();

        res.cookie("token", token, { expires: new Date(Date.now() + 8 * 3600000) });

        res.json({
            message: "User registered successfully!",
            data: savedUser,
            token: token
        });
    } catch (error) {
        console.log(error);
        res.status(500).send("Server Error: ", error.message);
    }
});


// 2.) User Login
// @route POST /api/user/login
// @desc Authenticate user
// @access Public
router.post('/login', async (req, res) => {
    try {
        const { emailId, password } = req.body;
        // console.log(emailId);
        let user = await User.findOne({ email:emailId });
        if (!user) {
            throw new Error("No such user found");
        }

        const isPasswordValid = await user.matchPassword(password);
        if (isPasswordValid) {

            // CREATE A JWT token
            const token = await user.getJWT();
            // console.log(token)
            // PASS THE TOKEN IN THE COOKIE THEN TO THE RESPONSE
            res.cookie("token", token, { expires: new Date(Date.now() + 8 * 3600000) }); //EXPIRES IN 8 HOURS

            res.json({
                message: "User logged in sucessfully!",
                data: user,
                token: token
            });
        }
        else {
            throw new Error("Invalid credentials");
        }
    }
    catch (err) {
        res.status(400).send("Error : " + err.message);
    }
});

module.exports = router;