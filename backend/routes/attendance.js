const express = require("express");
const { userAuth, isAdmin } = require("../middlewares/auth");
const Attendance = require("../models/Attendance");
const Bill = require("../models/Bill");
const User = require("../models/User");

const router = express.Router();
const MEAL_COST = 105; // Fixed meal price per day

//  Mark attendance (Admin only) and update bill
router.post("/mark/:status", userAuth, isAdmin, async (req, res) => {
    try {
        const { studentId, date } = req.body;
        const status = req.params.status.toLowerCase();

        if (!["present", "absent"].includes(status)) {
            return res.status(400).json({ message: "Invalid status! Use 'present' or 'absent'." });
        }

        // Check if student exists
        const student = await User.findById(studentId);
        if (!student) {
            return res.status(404).json({ message: "Student not found!" });
        }

        let attendance = await Attendance.findOne({ studentId, date });

        // Create new attendance record if it doesn't exist
        if (!attendance) {
            attendance = new Attendance({ studentId, date, status });
            await attendance.save();

            if (status === "present") {
                let bill = await Bill.findOne({ studentId });

                if (!bill) {
                    bill = new Bill({ studentId, amount: 0, dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) });
                }

                bill.amount += MEAL_COST;
                await bill.save();
            }

            return res.status(201).json({ message: `Attendance marked as ${status}!` });
        }

        // Update existing attendance record
        const previousStatus = attendance.status;
        attendance.status = status;
        await attendance.save();

        let bill = await Bill.findOne({ studentId });

        if (!bill) {
            bill = new Bill({ studentId, amount: 0, dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) });
        }

        // Adjust bill based on attendance change
        if (previousStatus === "absent" && status === "present") {
            bill.amount += MEAL_COST;
        } else if (previousStatus === "present" && status === "absent") {
            bill.amount -= MEAL_COST;
        }

        // If bill reaches zero, delete it
        if (bill.amount <= 0) {
            await Bill.findByIdAndDelete(bill._id);
        } else {
            await bill.save();
        }

        res.status(200).json({ message: `Attendance updated to ${status}!` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

//  Fetch attendance for a particular student
router.get("/student/:studentId", userAuth, isAdmin, async (req, res) => {
    try {
        const { studentId } = req.params;

        // Check if student exists
        const student = await User.findById(studentId);
        if (!student) {
            return res.status(404).json({ message: "Student not found!" });
        }

        // Fetch all attendance records for the student
        const attendanceRecords = await Attendance.find({ studentId });

        res.status(200).json({
            studentId,
            name: student.name,
            attendance: attendanceRecords,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

//  Bulk Mark Attendance (Admin only)
router.post("/mark-all/:status", userAuth, isAdmin, async (req, res) => {
    try {
        const { date } = req.body;
        const status = req.params.status.toLowerCase();

        if (!["present", "absent"].includes(status)) {
            return res.status(400).json({ message: "Invalid status! Use 'present' or 'absent'." });
        }

        // Fetch all students except admins
        const students = await User.find({ role: "student" });

        if (!students.length) {
            return res.status(404).json({ message: "No students found!" });
        }

        // Process attendance marking
        for (const student of students) {
            let attendance = await Attendance.findOne({ studentId: student._id, date });

            if (!attendance) {
                // Create new attendance record
                attendance = new Attendance({ studentId: student._id, date, status });
                await attendance.save();

                // If marking present, update bill
                if (status === "present") {
                    let bill = await Bill.findOne({ studentId: student._id });

                    if (!bill) {
                        bill = new Bill({ studentId: student._id, amount: 0, dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) });
                    }

                    bill.amount += MEAL_COST;
                    await bill.save();
                }
            } else {
                // Update existing attendance
                const previousStatus = attendance.status;
                attendance.status = status;
                await attendance.save();

                let bill = await Bill.findOne({ studentId: student._id });

                if (!bill) {
                    bill = new Bill({ studentId: student._id, amount: 0, dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) });
                }

                // Adjust bill based on change
                if (previousStatus === "absent" && status === "present") {
                    bill.amount += MEAL_COST;
                } else if (previousStatus === "present" && status === "absent") {
                    bill.amount -= MEAL_COST;
                }

                // Delete bill if amount reaches zero
                if (bill.amount <= 0) {
                    await Bill.findByIdAndDelete(bill._id);
                } else {
                    await bill.save();
                }
            }
        }

        res.status(200).json({ message: `All students marked as ${status} for ${date}!` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

//  Delete an attendance record (Admin only)
router.delete("/delete/:attendanceId", userAuth, isAdmin, async (req, res) => {
    try {
        const { attendanceId } = req.params;

        // Find the attendance record
        const attendance = await Attendance.findById(attendanceId);
        if (!attendance) {
            return res.status(404).json({ message: "Attendance record not found!" });
        }

        // Delete attendance record
        await Attendance.findByIdAndDelete(attendanceId);

        // Adjust bill if attendance was marked "Present"
        if (attendance.status === "present") {
            const bill = await Bill.findOne({ studentId: attendance.studentId });

            if (bill) {
                bill.amount -= MEAL_COST; // Deduct meal cost

                // If bill reaches zero, delete it
                if (bill.amount <= 0) {
                    await Bill.findByIdAndDelete(bill._id);
                } else {
                    await bill.save();
                }
            }
        }

        res.status(200).json({ message: "Attendance record deleted successfully!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
