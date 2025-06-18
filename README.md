# SmartMess 🍽️

**SmartMess** is a full-stack MERN (MongoDB, Express.js, React.js, Node.js) application designed to streamline and digitize hostel mess operations. It provides role-based access for students and admins, enabling smooth management of attendance, complaints, menu updates, rebate applications, notices, and payments.

> Both frontend and backend are hosted on **Vercel**.

---

## 👤 Login Credentials

- **Admin Email:** `admin@example.com`  
- **Admin Password:** `admin`

> ⚠️ Admin registration is disabled on the frontend for security reasons. Admin accounts must be created via a secure POST request to the backend (e.g., using Postman).

---

## ✨ Features

### 🧑 Student:
- Register/Login
- View attendance
- File complaints
- View noticeboard
- Check mess menu
- Apply for mess rebate (with date range)
- Pay mess bills via Razorpay
- View past rebate requests

### 👨‍💼 Admin:
- Login with credentials (no UI-based signup)
- Mark attendance
- View and resolve complaints (pending/resolved filter)
- Update mess menu
- Upload and manage notices
- View and process rebates
- Manage payments

---

## 🛠️ Tech Stack

### Frontend:
- React.js
- Tailwind CSS
- Redux Toolkit
- Axios

### Backend:
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- Razorpay Integration

---

## 📁 Folder Structure

```
SmartMess/
├── client/               # Frontend - React App
│   ├── public/
│   └── src/
├── server/               # Backend - Express App
│   ├── routes/
│   ├── controllers/
│   ├── models/
│   └── utils/
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites:
- Node.js
- MongoDB (local or MongoDB Atlas)
- Vercel account (optional for deployment)

### 1. Clone the Repository

```bash
git clone https://github.com/nihalrawat2001/SmartMess.git
cd SmartMess
```

### 2. Setup Backend

```bash
cd server
npm install
```

Create a `.env` file inside `server/` with the following:

```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

Start the server:

```bash
npm start
```

### 3. Setup Frontend

```bash
cd ../client
npm install
npm start
```

> The frontend will run on `http://localhost:3000` and communicate with the backend via defined API routes.

---

## 🔐 Admin Registration (via Postman)

To register an admin, make a POST request to:

```
POST /api/admin/register
```

With the following body:

```json
{
  "role": "admin",
  "email": "example@gmail.com",
  "password": "admin"
}
```

---

## 💡 Future Improvements

- OTP-based student login
- Email notifications
- Mobile app (React Native or Flutter)

---

## 🧾 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

**Nihal Rawat**  
- [GitHub](https://github.com/aestheticoder1)  
- [LinkedIn](https://www.linkedin.com/in/nihal-rawat-134440260/)
