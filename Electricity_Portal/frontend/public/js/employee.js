const API_URL = 'http://localhost:3000/api';

document.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(localStorage.getItem('user'));

    if (!user || user.role !== 'employee') {
        alert('Unauthorized');
        window.location.href = 'index.html';
        return;
    }

    document.getElementById('logout-btn').addEventListener('click', () => {
        localStorage.clear();
        window.location.href = 'index.html';
    });

    const form = document.getElementById('bill-form');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const serviceNumber = document.getElementById('bill-serviceNumber').value;
        const currentReading = document.getElementById('bill-currentReading').value;

        try {
            const res = await fetch(`${API_URL}/bills/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    serviceNumber,
                    currentReading,
                    employeeId: user._id
                })
            });

            const data = await res.json();
            const resultDiv = document.getElementById('bill-result');

            if (res.ok) {
                const b = data.bill;
                const date = new Date(b.billingDate).toLocaleDateString();
                const due = new Date(b.dueDate).toLocaleDateString();

                resultDiv.innerHTML = `
                <div class="bill-box">
                    <div class="bill-header">
                        <h2>Electricity Bill</h2>
                        <p>TGSPDCL</p>
                    </div>
                    <div class="bill-row"><span>Service Number:</span> <strong>${b.serviceNumber}</strong></div>
                    <div class="bill-row"><span>Name:</span> <strong>${b.consumerId?.name || 'N/A'}</strong></div>
                    <div class="bill-row"><span>Address:</span> <strong>${b.consumerId?.address || 'N/A'}</strong></div>
                    <div class="bill-row"><span>Phone:</span> <strong>${b.consumerId?.phone || 'N/A'}</strong></div>
                    <hr style="margin: 10px 0; border: 0; border-top: 1px dashed #ccc;">
                    <div class="bill-row"><span>Billing Date:</span> <strong>${date}</strong></div>
                    <div class="bill-row"><span>Due Date:</span> <strong>${due}</strong></div>
                    <div class="bill-row"><span>Units Consumed:</span> <strong>${b.unitsConsumed}</strong></div>
                    <div class="bill-row"><span>Current Charges:</span> <strong>₹${b.amount}</strong></div>
                    <div class="bill-row"><span>Previous Dues:</span> <strong>₹${b.previousDues}</strong></div>
                    <div class="bill-row" ${b.fineAmount > 0 ? 'style="color:red"' : ''}>
                        <span>Fine (Late):</span> <strong>₹${b.fineAmount || 0}</strong>
                    </div>
                    <div class="bill-total">
                        <span>Total Payable:</span> <span>₹${b.totalAmount}</span>
                    </div>
                    <div class="bill-status status-pending">GENERATED</div>
                </div>`;
                form.reset();
            } else {
                resultDiv.innerHTML = `<p style="color:red;">Error: ${data.error}</p>`;
            }
        } catch (err) {
            document.getElementById('bill-result').innerHTML = `<p style="color:red;">Request Failed</p>`;
        }
    });
});
