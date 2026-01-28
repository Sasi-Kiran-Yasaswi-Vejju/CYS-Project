# Secure Document Management System (CYS Lab Project)

This project is developed as part of the **Cyber Security Lab Evaluation**.  
It demonstrates the **practical implementation of cyber security concepts** using a **React frontend** and a **Node.js + MongoDB backend**.

---

## 🔐 Project Objective

To design and implement a **secure document management system** that ensures:

- Confidentiality of data  
- Integrity of documents  
- Secure user authentication and authorization  

The project applies **cryptographic and security mechanisms** in a real-world web application.

---

## 🛡️ Security Concepts Implemented

- **AES-256 Encryption**
  - Encrypts document content before storage.
- **SHA-256 Digital Hashing**
  - Ensures document integrity via digital signatures.
- **Base64 Encoding**
  - Safe representation of encrypted data.
- **JWT Authentication**
  - Secure login and protected API routes.
- **Middleware-based Authorization**
  - Prevents unauthorized access.

---

## 🏗️ Project Architecture

cys/
├── Backend/
│   ├── models/           # MongoDB Schemas (User, Document)
│   ├── routers/          # API Route definitions (auth, document, user)
│   ├── utils/            # Logic for Encryption & Security
│   ├── authMiddleware.js # Security layer for protected routes
│   ├── server.js         # Main entry point (Express app)
│   └── .env              # Environment variables
├── Frontend/
│   ├── src/
│   │   ├── components/   # Reusable UI widgets
│   │   ├── pages/        # Main application screens
│   │   └── App.jsx       # React entry point
│   └── pubspec.yaml      # Flutter dependencies
└── README.md



---

## 💻 Technologies Used

### Frontend
- React.js
- JavaScript (ES6+)
- HTML & CSS

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose

### Security & Tools
- Node.js Crypto Module
- JSON Web Tokens (JWT)
- Git & GitHub

---

## ⚙️ Features

- Secure user registration and login
- JWT-based authentication
- Encrypted document storage
- Digital signature verification
- Protected REST API endpoints
- Clean separation of frontend and backend

---

## 🎯 Learning Outcomes

Through this project, the following skills were gained:

- Practical implementation of cryptographic algorithms
- Secure API design using middleware
- Understanding of authentication and authorization
- Full-stack web application development
- Version control using Git

---

## 📌 Conclusion

This project demonstrates how **cyber security principles** such as encryption, hashing, and authentication can be applied to build a **secure web application**, bridging academic concepts with practical implementation.

---

## 👨‍💻 Author

**Vejju Sasi Kiran Yasaswi**  
Cyber Security Lab Project
