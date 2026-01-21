const API_URL = 'http://localhost:3000/api';

document.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(localStorage.getItem('user'));

    if (!user || user.role !== 'consumer') {
        alert('Unauthorized');
        window.location.href = 'index.html';
        return;
    }

    document.getElementById('logout-btn').addEventListener('click', () => {
        localStorage.clear();
        window.location.href = 'index.html';
    });

    document.getElementById('user-info').innerText = `Welcome, ${user.name} (${user.serviceNumber}) - Type: ${user.consumerType.toUpperCase()}`;

    const container = document.getElementById('bills-container');

    async function fetchBills() {
        try {
            const res = await fetch(`${API_URL}/bills/${user.serviceNumber}?t=${Date.now()}`);
            const bills = await res.json();

            if (bills.length === 0) {
                container.innerHTML = '<p>No bills found.</p>';
                return;
            }

            let html = '';
            bills.forEach(bill => {
                const isPaid = bill.status === 'paid';
                const isSuperseded = bill.status === 'superseded';
                const dueDate = new Date(bill.dueDate).toLocaleDateString();
                const billingDate = new Date(bill.billingDate).toLocaleDateString();

                let statusClass = 'status-pending';
                if (isPaid) statusClass = 'status-paid';
                if (isSuperseded) statusClass = 'status-superseded';

                html += `
                <div class="bill-box ${isSuperseded ? 'superseded-bill' : ''}">
                    <div class="bill-header">
                        <h2>Electricity ${isSuperseded ? 'Old Bill' : 'Bill'}</h2>
                        <p>TGSPDCL</p>
                    </div>
                    
                    <div class="bill-row"><span>Service Number:</span> <strong>${bill.serviceNumber}</strong></div>
                    <div class="bill-row"><span>Name:</span> <strong>${bill.consumerId?.name || 'N/A'}</strong></div>
                    <div class="bill-row"><span>Address:</span> <strong>${bill.consumerId?.address || 'N/A'}</strong></div>
                    <div class="bill-row"><span>Phone:</span> <strong>${bill.consumerId?.phone || 'N/A'}</strong></div>
                    <hr style="margin: 10px 0; border: 0; border-top: 1px dashed #ccc;">

                    <div class="bill-row"><span>Bill Date:</span> <strong>${billingDate}</strong></div>
                    <div class="bill-row"><span>Due Date:</span> <strong>${dueDate}</strong></div>
                    <div class="bill-row"><span>Units:</span> <strong>${bill.unitsConsumed}</strong></div>
                    
                    <div class="bill-row"><span>Current Charges:</span> <strong>₹${bill.amount}</strong></div>
                    <div class="bill-row"><span>Previous Dues:</span> <strong>₹${bill.previousDues}</strong></div>
                    <div class="bill-row" ${bill.fineAmount > 0 ? 'style="color:red"' : ''}>
                        <span>Fine (Late):</span> <strong>₹${bill.fineAmount || 0}</strong>
                    </div>
                    
                    ${bill.paidAmount > 0 ? `<div class="bill-row" style="color:green"><span>Paid So Far:</span> <strong>- ₹${bill.paidAmount}</strong></div>` : ''}

                    <div class="bill-total">
                        <span>Outstanding:</span> <span>₹${bill.totalAmount}</span>
                    </div>

                    <div class="bill-status ${statusClass}">
                        ${bill.status.toUpperCase()}
                    </div>
                    
                    ${!isPaid && !isSuperseded ? `
                        <div style="margin-top:10px; display:flex; gap:5px;">
                            <input type="number" id="pay-amount-${bill._id}" value="${bill.totalAmount}" min="1" max="${bill.totalAmount}" placeholder="Amount">
                            <button style="width:auto;" onclick="payBill('${bill._id}')">Pay</button>
                        </div>
                    ` : ''}
                    ${isSuperseded ? `<p style="text-align:center; font-size:0.8rem; color:#888;">(Merged into later bill)</p>` : ''}
                </div>
                `;
            });
            container.innerHTML = html;
        } catch (err) {
            console.error('Failed to fetch bills', err);
            container.innerHTML = '<p>Error loading bills.</p>';
        }
    }

    window.payBill = async (billId) => {
        const amountInput = document.getElementById(`pay-amount-${billId}`);
        const amount = amountInput.value;

        if (!amount || amount <= 0) {
            alert('Please enter a valid amount');
            return;
        }

        if (!confirm(`Confirm payment of ₹${amount}?`)) return;

        try {
            const res = await fetch(`${API_URL}/bills/pay/${billId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount })
            });
            const data = await res.json();

            if (res.ok) {
                alert(`Payment Successful! Remaining: ${data.bill.totalAmount}`);
                fetchBills();
            } else {
                alert('Payment Failed: ' + data.error);
            }
        } catch (err) {
            alert('Error processing payment');
        }
    };

    document.getElementById('refresh-bills').addEventListener('click', fetchBills);

    fetchBills();
});
