const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
    studentId: { type: String, required: true },
    complaintText: { type: String, required: true },
    status: { type: String, enum: ['Pending', 'Resolved'], default: 'Pending' }
}, { timestamps: true });

module.exports = mongoose.model('Complaint', complaintSchema);
