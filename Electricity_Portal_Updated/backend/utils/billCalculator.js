function calculateBillAmount(units, consumerType) {
    let bill = 0;
    units = Number(units);

    if (consumerType === 'household') {
        if(units==0)
        {
            return 25;
        }
        if (units <= 50) {
            bill = units * 1.5;
        } else if (units <= 100) {
            bill = (50 * 1.5) + ((units - 50) * 2.5);
        } else if(units<=150) {
            bill = (50 * 1.5) + (50 * 2.5) + ((units - 100) * 3.5);
        }else if(units>150)
        {
            bill = (50 * 1.5) + (50 * 2.5) + (50 * 3.5) + ((units-150) * 4.5);
        }
    } else if (consumerType === 'commercial') {
        if(units==0)
        {
            return 25;
        }
        if (units <= 50) {
            bill = units * 2.5;
        } else if (units <= 100) {
            bill = (50 * 2.5) + ((units - 50) * 3.5);
        } else if(units<=150) {
            bill = (50 * 2.5) + (50 * 3.5) + ((units - 100) * 4.5);
        }else if(units>150)
        {
            bill = (50 * 2.5) + (50 * 3.5) + (50 * 4.5) + ((units-150) * 5.5);
        }
    } else if (consumerType === 'industrial') {
        if(units==0)
        {
            return 25;
        }
        if (units <= 50) {
            bill = units * 3.5;
        } else if (units <= 100) {
            bill = (50 * 3.5) + ((units - 50) * 4.5);
        } else if(units<=150) {
            bill = (50 * 3.5) + (50 * 4.5) + ((units - 100) * 5.5);
        }else if(units>150)
        {
            bill = (50 * 3.5) + (50 * 4.5) + (50 * 5.5) + ((units-150) * 6.5);
        }
    }

    return bill;
}

function calculateFine(dueDate, paymentDate) {
    const due = new Date(dueDate);
    const pay = new Date(paymentDate);

    if (pay > due) {
        return 150;
    }
    return 0;
}

module.exports = { calculateBillAmount, calculateFine };
