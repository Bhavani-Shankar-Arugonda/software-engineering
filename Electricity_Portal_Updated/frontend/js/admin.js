const API_URL = 'http://localhost:3000/api';

document.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(localStorage.getItem('user'));

    if (!user || user.role !== 'admin') {
        alert('Unauthorized');
        window.location.href = 'index.html';
        return;
    }

    document.getElementById('logout-btn').addEventListener('click', () => {
        localStorage.clear();
        window.location.href = 'index.html';
    });

    const regForm = document.getElementById('register-form');
    const roleSelect = document.getElementById('reg-role');
    const fields = {
        employee: ['reg-employeeId'],
        consumer: ['reg-serviceNumber', 'reg-consumerType', 'reg-address', 'reg-phone']
    };

    roleSelect.addEventListener('change', () => {
        const role = roleSelect.value;

        [...fields.employee, ...fields.consumer].forEach(id => {
            document.getElementById(id).style.display = 'none';
        });

        if (fields[role]) {
            fields[role].forEach(id => {
                document.getElementById(id).style.display = 'block';
            });
        }
    });

    roleSelect.dispatchEvent(new Event('change'));

    regForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const role = roleSelect.value;
        const name = document.getElementById('reg-name').value;
        const email = document.getElementById('reg-email').value;
        const password = document.getElementById('reg-password').value;
        const serviceNumber=document.getElementById('reg-serviceNumber').value;

        if (password.length < 4) {
            alert('Password must be at least 4 characters');
            return;
        }

        const nameRegex = /^[A-Za-z]+$/;
        if (!nameRegex.test(name)) {
            alert('Full Name cannot contain numbers and special characters');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert('Invalid Email Format');
            return;
        }

        const serviceNumberRegex=/^[0-9]$/;
        if(!serviceNumberRegex.test(serviceNumber))
        {
            alert('service number can only be numbers');
            return;
        }

        const payload = { role, name, email, password };

        if (role === 'employee') {
            const empId = document.getElementById('reg-employeeId').value;
            if (!empId) { alert('Employee ID is required'); return; }
            payload.employeeId = empId;
        } else if (role === 'consumer') {
            payload.serviceNumber = document.getElementById('reg-serviceNumber').value;
            if (!payload.serviceNumber) { alert('Service Number is required'); return; }

            payload.consumerType = document.getElementById('reg-consumerType').value;
            payload.address = document.getElementById('reg-address').value;

            const phone = document.getElementById('reg-phone').value;
            if (phone.length < 10) { alert('Phone number must be at least 10 digits'); return; }
            payload.phone = phone;
        }

        try {
            const res = await fetch(`${API_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (res.ok) {
                alert('User registered successfully');
                regForm.reset();
                roleSelect.dispatchEvent(new Event('change'));
                fetchUsers();
            } else {
                alert('Error: ' + data.error);
            }
        } catch (err) {
            alert('Registration Failed');
        }
    });

    async function fetchUsers() {
        try {
            const res = await fetch(`${API_URL}/users`);
            const users = await res.json();

            const container = document.getElementById('users-table-container');
            if (users.length === 0) {
                container.innerHTML = '<p>No users found.</p>';
                return;
            }

            let html = '<table border="1" cellpadding="5"><tr><th>Name</th><th>Role</th><th>Identifier</th><th>Type</th></tr>';
            users.forEach(u => {
                let identifier = u.role === 'consumer' ? u.serviceNumber : (u.employeeId || '-');
                let type = u.role === 'consumer' ? u.consumerType : '-';
                html += `<tr>
                    <td>${u.name}</td>
                    <td>${u.role}</td>
                    <td>${identifier}</td>
                    <td>${type}</td>
                </tr>`;
            });
            html += '</table>';
            container.innerHTML = html;
        } catch (err) {
            console.error('Failed to fetch users', err);
        }
    }

    document.getElementById('refresh-users').addEventListener('click', fetchUsers);

    fetchUsers();
});
