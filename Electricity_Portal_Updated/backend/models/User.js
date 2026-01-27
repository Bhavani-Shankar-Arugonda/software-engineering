const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true, sparse: true },
    password: { type: String, required: true },
    role: {
        type: String,
        enum: ['admin', 'employee', 'consumer'],
        required: true
    },
    employeeId: { type: String, unique: true, sparse: true },

    serviceNumber: { type: String, unique: true, sparse: true },
    address: String,
    phone: String,
    consumerType: {
        type: String,
        enum: ['household', 'commercial', 'industrial'],
        default: 'household'
    },
    meterReading: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);