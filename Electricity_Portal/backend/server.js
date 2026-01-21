const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');

const User = require('./models/User');
const Bill = require('./models/Bill');

const { calculateBillAmount, calculateFine } = require('./utils/billCalculator');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../frontend/public')));

mongoose.connect('mongodb://localhost:27017/advancedElectricityDB')
    .then(async () => {
        console.log('Connected to MongoDB: advancedElectricityDB');
        const adminExists = await User.findOne({ role: 'admin' });
        if (!adminExists) {
            const admin = new User({
                name: 'System Admin',
                email: 'admin',
                password: 'admin',
                role: 'admin',
                employeeId: 'ADM001'
            });
            await admin.save();
            console.log('Admin seeded: User: admin, Pass: admin');
        }
    })
    .catch(err => console.error('Could not connect to MongoDB:', err));

app.post('/api/login', async (req, res) => {
    const { identifier, password, role } = req.body;
    try {
        let query = { password, role };

        if (role === 'consumer') {
            query.$or = [
                { serviceNumber: identifier },
                { email: identifier }
            ];
        } else {
            query.email = identifier;
        }

        const user = await User.findOne(query);
        if (!user) return res.status(401).json({ error: 'Invalid credentials' });

        res.json({ message: 'Login successful', user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/register', async (req, res) => {
    try {
        const { email, serviceNumber, employeeId } = req.body;

        // Explicitly check for duplicates to provide clear errors
        if (email) {
            const exists = await User.findOne({ email });
            if (exists) return res.status(400).json({ error: 'Email already registered' });
        }
        if (serviceNumber) {
            const exists = await User.findOne({ serviceNumber });
            if (exists) return res.status(400).json({ error: 'Service Number already registered' });
        }
        if (employeeId) {
            const exists = await User.findOne({ employeeId });
            if (exists) return res.status(400).json({ error: 'Employee ID already registered' });
        }

        const newUser = new User(req.body);
        await newUser.save();
        res.status(201).json({ message: 'User registered successfully', user: newUser });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.get('/api/users', async (req, res) => {
    try {
        const users = await User.find({});
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/bills/generate', async (req, res) => {
    const { serviceNumber, currentReading, employeeId } = req.body;
    try {
        const consumer = await User.findOne({ serviceNumber, role: 'consumer' });
        if (!consumer) return res.status(404).json({ error: 'Consumer not found' });

        const unitsConsumed = currentReading - consumer.meterReading;
        if (unitsConsumed < 0) return res.status(400).json({ error: 'New reading cannot be less than previous reading' });

        const amount = calculateBillAmount(unitsConsumed, consumer.consumerType);

        const unpaidBills = await Bill.find({ consumerId: consumer._id, status: 'pending' });

        let previousDues = 0;
        const now = new Date();

        for (let bill of unpaidBills) {
            let extraFine = 0;
            if (now > bill.dueDate) {
                extraFine = calculateFine(bill.dueDate, now, bill.totalAmount);
            }

            previousDues += (bill.totalAmount + extraFine);

            bill.status = 'superseded';
            bill.fineAmount = extraFine;
            await bill.save();
        }

        const totalAmount = amount + previousDues;

        const billingDate = new Date();
        const dueDate = new Date();
        dueDate.setDate(billingDate.getDate() + 15);

        const newBill = new Bill({
            consumerId: consumer._id,
            serviceNumber,
            previousReading: consumer.meterReading,
            currentReading,
            unitsConsumed,
            amount,
            previousDues,
            totalAmount,
            billingDate,
            dueDate,
            status: 'pending',
            generatedBy: employeeId
        });

        consumer.meterReading = currentReading;
        await consumer.save();

        await newBill.save();

        await newBill.populate('consumerId', 'name address phone');

        res.status(201).json({ message: 'Bill generated successfully', bill: newBill });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/bills/:serviceNumber', async (req, res) => {
    try {
        const bills = await Bill.find({
            serviceNumber: req.params.serviceNumber
        })
            .sort({ billingDate: -1 })
            .populate('consumerId', 'name address phone');

        res.json(bills);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/bills/pay/:billId', async (req, res) => {
    try {
        const { amount } = req.body;
        const payment = Number(amount);

        const bill = await Bill.findById(req.params.billId);
        if (!bill) return res.status(404).json({ error: 'Bill not found' });
        if (bill.status === 'paid') return res.status(400).json({ error: 'Bill already fully paid' });
        if (!payment || payment <= 0) return res.status(400).json({ error: 'Invalid payment amount' });

        const now = new Date();
        if (now > bill.dueDate && bill.fineAmount === 0) {
            const fine = calculateFine(bill.dueDate, now, bill.totalAmount);
            if (fine > 0) {
                bill.fineAmount = fine;
                bill.totalAmount += fine;
            }
        }

        if (payment > bill.totalAmount) {
            return res.status(400).json({ error: `Payment exceeds due amount of ${bill.totalAmount}` });
        }

        bill.paidAmount += payment;
        bill.totalAmount -= payment;

        if (bill.totalAmount <= 0) {
            bill.status = 'paid';
            bill.paidAt = now;
            bill.totalAmount = 0;
        } else {
            bill.status = 'pending';
        }

        await bill.save();

        res.json({ message: 'Payment successful', bill });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/public/index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
