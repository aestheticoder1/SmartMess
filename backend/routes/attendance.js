const express = require("express");
const mongoose = require("mongoose");
const { userAuth, isAdmin } = require('../middlewares/auth');
const User = require("../models/User");
const Attendance = require("../models/Attendance");
const Rebate = require("../models/Rebate");

const router = express.Router();
const DAILY_MEAL_PRICE = 105

// 1. MARK ATTENDANCE (Admin Only)
// Marks a student as present or absent for a given date.

router.post("/mark", userAuth, isAdmin, async (req, res) => {
    const { studentId, date, status } = req.body;

    try {
        const attendance = await Attendance.findOneAndUpdate(
            { studentId: new mongoose.Types.ObjectId(studentId), date },
            { status },
            { upsert: true, new: true }
        );

        res.status(201).json({ message: "Attendance marked", attendance });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// 2. MARK ALL STUDENTS PRESENT (Admin Only)
// Marks all students as present for a given date.


router.post("/mark-all", userAuth, isAdmin, async (req, res) => {
    try {
        const { date } = req.body;
        if (!date) return res.status(400).json({ message: "Date is required" });

        const targetDate = new Date(date);
        targetDate.setUTCHours(0, 0, 0, 0); // Normalize to UTC start of day

        //  Get all student IDs
        const students = await User.find({ role: "student" }).select("_id");

        // Students on approved rebate for this date
        const rebates = await Rebate.find({
            status: "Approved",
            startDate: { $lte: targetDate },
            endDate: { $gte: targetDate }
        }).select("studentId");

        const rebateSet = new Set(rebates.map(r => r.studentId.toString()));

        // Create attendance ops
        const bulkOps = students.map(({ _id }) => ({
            updateOne: {
                filter: { studentId: _id, date: targetDate },
                update: { $set: { status: rebateSet.has(_id.toString()) ? "absent" : "present" } },
                upsert: true
            }
        }));

        await Attendance.bulkWrite(bulkOps);

        res.json({ message: "Attendance marked successfully." });
    } catch (err) {
        console.error("Mark-all error:", err);
        res.status(500).json({ message: "Server error" });
    }
});


/**
2. GET BILL (Unpaid Present Days × Meal Price)
Returns the total amount due for a student.
*/
router.get("/bill", userAuth, async (req, res) => {
    const { studentId } = req.query;
    const requestingUser = req.user; // Decoded from JWT

    try {
        // Only allow access if user is the student themselves OR an admin
        if (requestingUser.role !== "admin" && requestingUser._id.toString() !== studentId) {
            return res.status(403).json({ message: "Access denied" });
        }

        const totalDaysPresent = await Attendance.countDocuments({
            studentId: new mongoose.Types.ObjectId(studentId),
            status: "present",
            is_billed: false
        });

        const amountDue = totalDaysPresent * DAILY_MEAL_PRICE;

        res.json({ studentId, totalDaysPresent, amountDue });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. PAY BILL (Updates Attendance Records) 
// Marks all unpaid present days as billed.
router.post("/pay-bill", userAuth, async (req, res) => {
    const { studentId } = req.body;
    const requestingUser = req.user;
    // console.log(studentId, requestingUser._id);

    try {
        // Only the student themselves can pay their bill
        if (requestingUser._id.toString() !== studentId) {
            return res.status(403).json({ message: "Only the student can pay their bill." });
        }
        const result = await Attendance.updateMany(
            {
                studentId: new mongoose.Types.ObjectId(studentId),
                status: "present",
                is_billed: false
            },
            { $set: { is_billed: true } }
        );

        // console.log(result)

        if (result.modifiedCount === 0) {
            return res.status(400).json({ message: "No pending payments" });
        }

        res.json({ message: "Bill paid, attendance marked as billed", daysBilled: result.modifiedCount });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;