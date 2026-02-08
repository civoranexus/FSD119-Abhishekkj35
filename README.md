# 🏥 HealthVillage – Rural Telemedicine Platform

HealthVillage is a full-stack telemedicine platform designed to improve healthcare accessibility for rural populations. The system allows patients to consult doctors remotely, manage appointments, maintain medical records, and receive digital prescriptions securely.

---

## 📌 Project Overview

HealthVillage connects rural patients with certified doctors through a secure digital healthcare platform. The application supports appointment booking, teleconsultation, electronic health records (EHR), and e-prescription management.

This project was developed as part of the **Civora X Internship Program**.

---

## 👥 User Roles

### 🧑‍🦱 Patient
- Register and login
- Book doctor appointments
- View medical records
- View prescriptions
- Join teleconsultation

### 👨‍⚕️ Doctor
- Manage appointments
- Set availability schedule
- Conduct consultations
- Create medical records
- Issue prescriptions

### 🛡 Admin
- Manage users
- Monitor platform analytics
- View system reports

---

## 🚀 Features

### 🔐 Authentication & Authorization
- JWT-based login system
- Role-based access control

### 📅 Appointment Management
- Doctor availability scheduling
- Patient appointment booking
- Appointment tracking

### 🎥 Teleconsultation
- Simulated consultation interface
- Real-time patient-doctor interaction flow

### 🧾 Electronic Health Records (EHR)
- Secure patient medical history storage
- Doctor diagnosis and treatment tracking

### 💊 E-Prescription System
- Digital prescription creation
- Medicine dosage and instructions

### 📊 Admin Dashboard
- User monitoring
- Consultation analytics
- System reporting

---

## 🛠 Tech Stack

### Frontend
- React.js
- Tailwind CSS
- React Router
- Axios

### Backend
- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT Authentication

### Deployment
- Frontend: Render Static Hosting
- Backend: Render Web Service
- Database: MongoDB Atlas

---

### running backend
cd backend
npm install

### running frontend
cd ../frontend
npm install

### ENV
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_secret_key
PORT=5000
VITE_API_BASE_URL=http://localhost:5000


