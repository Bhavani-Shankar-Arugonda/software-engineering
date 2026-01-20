const express = require('express');
const bodyparser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');


const port = 8000;

const app = express();
app.use(express.static(__dirname));

app.use(bodyparser.json());

app.use(express.static(path.join(__dirname, '../frontend')));

mongoose.connect("mongodb://localhost:27017/electricityDB")
    .then(() => console.log("mongodb connected"))
    .catch(err => console.log(err));

const userSchema = new mongoose.Schema({
    name: String,
    phone: String,
    address: String,
    serviceNumber: { type: String, unique: true },
    billingDate: { type: Date, default: Date.now },
    meterReading: { type: Number, default: 0 }  
});

const user = new mongoose.model("user", userSchema);

app.post("/register", async (req, res) => {
    try {
        const newUser = new user(req.body);
        await newUser.save();
        res.status(201).json({ message: "User registered successfully" });
    } catch (err) {
        console.error(err);
        res.status(400).json({ error: err.message });
    }
});

function calculatebill(units) {
    let bill = 0;
    if (units <= 50) {
        bill = units * 50;
    }
    else if (units <= 100) {
        bill = (50 * 50) + (units - 50) * 100;
    }
    else {
        bill = (50 * 50) + (50 * 100) + (units - 100) * 150;
    }
    return bill;
}

app.post('/bill', async (req, res) => {
    const { serviceNumber, newReading } = req.body;
    const consumer = await user.findOne({ serviceNumber });
    if (!consumer) {
            return res.status(404).json({ error: "Service Number not found in database!" });
        }
    const unitsUsed = newReading - consumer.meterReading;
    const billAmount = calculatebill(unitsUsed);
    const date = consumer.billingDate;
    consumer.meterReading = newReading;
    consumer.billingDate = Date.now();
    await consumer.save();
    res.status(200).json({ name: consumer.name, unitsUsed, billAmount, date,serviceNumber });
});


app.listen(port, () => { console.log(`server is running on http://localhost:${port}/page.html`) });
