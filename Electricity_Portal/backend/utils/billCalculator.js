function calculateBillAmount(units, consumerType) {
    let bill = 0;
    units = Number(units);

    if (consumerType === 'household') {
        if (units <= 100) {
            bill = units * 3;
        } else if (units <= 500) {
            bill = (100 * 3) + ((units - 100) * 5);
        } else {
            bill = (100 * 3) + (400 * 5) + ((units - 500) * 8);
        }
    } else if (consumerType === 'commercial') {
        bill = units * 10;
    } else if (consumerType === 'industrial') {
        bill = units * 15;
    } else {
        return units * 5;
    }

    return bill;
}

function calculateFine(dueDate, paymentDate, totalAmount) {
    const due = new Date(dueDate);
    const pay = new Date(paymentDate);

    if (pay > due) {
        return Math.round(totalAmount * 0.05);
    }
    return 0;
}

module.exports = { calculateBillAmount, calculateFine };
