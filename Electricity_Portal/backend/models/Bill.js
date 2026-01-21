const mongoose = require('mongoose');

const billSchema = new mongoose.Schema({
    consumerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    serviceNumber: { type: String, required: true },

    previousReading: { type: Number, required: true },
    currentReading: { type: Number, required: true },
    unitsConsumed: { type: Number, required: true },

    amount: { type: Number, required: true },
    previousDues: { type: Number, default: 0 },
    fineAmount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    paidAmount: { type: Number, default: 0 },

    billingDate: { type: Date, default: Date.now },
    dueDate: { type: Date, required: true },

    status: { type: String, enum: ['paid', 'pending', 'superseded'], default: 'pending' },
    generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Bill', billSchema);
