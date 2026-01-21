# Advanced Electricity Portal

This is a simple web portal for managing electricity bills. It has three roles:
* Admin
* Employee
* Consumer

# 1. What you need to install
Before running this, make sure you have:
*   Node.js
*   MongoDB

You should also install the required libraries. Open your terminal in this folder and run:

npm install express mongoose body-parser cors

# 2. How to Start the Project

1.  Start Database: Make sure your MongoDB is running properly.
2.  Start Server: Run the following command in your terminal:
    
    node backend/server.js
    
    You should see: `Server running on http://localhost:3000`

3.  Open in Browser: Go to `http://localhost:3000`

# 3. How to Use (Step-by-Step)

# Step 1: Login as Admin first
The system creates a default admin for you.
*   Role: Admin
*   ID/Email: `admin`
*   Password: `admin`

**What to do here:**
*   This is where you setup the system.
*   Go to Register New User.
*   Create an Employee.
*   Create a Consumer.

# Step 2: Employee Generates Bills
Logout and login as an Employee.
*   Role: Employee
*   Email: (The one you just registered)
*   Password: (The one you set)

**What to do here:**
*   Enter a consumer's Service Number.
*   Enter the Current Meter Reading.
*   Click Generate Bill.

# Step 3: Consumer Pays Bills
Logout and login as a Consumer.
*   Role: Consumer
*   ID: You can use either your Service Number or Email.
*   Password: (The one set by Admin)

**What to do here:**
*   You will see your bills.
*   You can pay the full amount or a partial amount.
*   If you are late, a fine (5%) is automatically added.
