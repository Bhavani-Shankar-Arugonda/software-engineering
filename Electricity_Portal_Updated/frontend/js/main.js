const API_URL = 'http://localhost:3000/api';

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const roleSelect = document.getElementById('role-select');

    localStorage.clear();

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const role = roleSelect.value;
        const identifier = document.getElementById('login-id').value;
        const password = document.getElementById('login-password').value;

        try {
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifier, password, role })
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('user', JSON.stringify(data.user));

                if (role === 'admin') {
                    window.location.href = 'admin_dashboard.html';
                } else if (role === 'employee') {
                    window.location.href = 'employee_dashboard.html';
                } else if (role === 'consumer') {
                    window.location.href = 'user_dashboard.html';
                }
            } else {
                alert('Login Failed: ' + data.error);
            }
        } catch (err) {
            console.error(err);
            alert('An error occurred during login.');
        }
    });
});
