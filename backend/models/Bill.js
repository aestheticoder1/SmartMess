const mongoose = require("mongoose");

const billSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    amount: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ["Unpaid", "Paid"],
        default: "Unpaid"
    },
    dueDate: {
        type: Date,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model("Bill", billSchema);
