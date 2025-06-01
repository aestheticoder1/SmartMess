const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { userAuth, isAdmin } = require('../middlewares/auth');
const Complaint = require('../models/Complaint');
const Notice = require('../models/Notice');
const router = express.Router();


// 1.) User Registration
// @route POST /api/user/register
// @desc Register a new user
// @access Public
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, studentRollNo, role } = req.body;

        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: 'User already exists' });

        user = new User({ name, email, password, studentRollNo, role });
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
        res.status(500).json({ message: "Server Error: " + error.message });
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
        let user = await User.findOne({ email: emailId });
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


router.post('/logout', (req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        sameSite: 'Strict',
    });
    res.status(200).json({ message: 'Logout successful' });
});


// User Profile
router.get("/profile", userAuth, async (req, res) => {
    const user = await User.findById(req.user.id).select("-password");

    res.json({ user }); // THIS must exist
});

router.get("/stats", userAuth, isAdmin, async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: "student" });
    const pendingComplaints = await Complaint.countDocuments({ status: "Pending" });
    const totalNotices = await Notice.countDocuments();
    // console.log("Total Students:", totalStudents);
    // console.log("Pending Complaints:", pendingComplaints);

    res.status(200).json({
      totalStudents,
      pendingComplaints,
      totalNotices,
    });
  } catch (err) {
    console.error("Error fetching admin stats:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});


module.exports = router;