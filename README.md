Internship Tracker 🚀

A full-stack Internship Tracking Web Application that helps students manage, monitor and organize all internship/job applications in one place.

⸻

🌟 Key Highlight (Scalability Vision)

This project is designed to scale into a real-time internship aggregation and tracking platform.
In future production deployment, the system will fetch real-time internship listings from external sources/APIs, allow users to import them directly, and track progress inside the dashboard — transforming the app from a manual tracker into a live career management platform.

⸻

🏗️ Tech Stack

Frontend

	•	Next.js (React Framework)
	•	Tailwind / Custom Glass UI Styling
	•	JWT based authentication handling

Backend
	•	Node.js + Express.js
	•	Prisma ORM
	•	PostgreSQL / MySQL (depending on environment)

Authentication & Security
	•	JWT Token Authentication
	•	Password Hashing (bcrypt)
	•	Protected Routes Middleware

⸻

✨ Features

Authentication
	•	Register with OTP verification
	•	Login with JWT token
	•	Secure logout

Dashboard
	•	Animated glass UI sidebar
	•	Real-time stats (Total / Interview / Offer / Rejected / Success Rate)

Application Management (CRUD)
	•	Add application
	•	Edit application
	•	Delete application (with confirmation popup)
	•	Filter & search applications
	•	Status colored badges

UI/UX
	•	Glassmorphism design
	•	Animated typing effects
	•	Success / Error popup notifications

⸻

📂 Project Structure

job-tracker
 ├── frontend  (Next.js client)
 └── backend   (Node.js API server)


⸻

⚙️ Setup Instructions

1️⃣ Clone Repository

git clone https://github.com/arnabDevX/internship-tracker.git
cd internship-tracker


⸻

2️⃣ Backend Setup

cd backend
npm install
npx prisma generate
npm run dev

Server runs on:

http://127.0.0.1:5050


⸻

3️⃣ Frontend Setup

cd frontend
npm install
npm run dev

Frontend runs on:

http://localhost:3000


⸻

🔐 Authentication Flow
	1.	User registers → OTP sent
	2.	OTP verified → Account created
	3.	Login → JWT token generated
	4.	Token stored in localStorage
	5.	Protected routes validated using middleware

⸻

📡 API Endpoints (Core)

Auth
	•	POST /api/auth/send-otp
	•	POST /api/auth/verify-otp
	•	POST /api/auth/login

Applications
	•	GET /api/applications
	•	POST /api/applications
	•	PUT /api/applications/:id
	•	DELETE /api/applications/:id

⸻

📘 Postman Testing

Import API routes into Postman and test with Bearer Token authentication:

Authorization: Bearer <JWT_TOKEN>


⸻

🔒 Security Practices
	•	Password hashing using bcrypt
	•	JWT verification middleware
	•	Protected API routes
	•	Input validation

⸻

📈 Production Scaling Plan

To scale the application for production:
	1.	Move JWT to HTTP-Only cookies (prevent XSS)
	2.	Add Redis caching for dashboard queries
	3.	Queue based email/OTP service (RabbitMQ / BullMQ)
	4.	Deploy backend behind Nginx reverse proxy
	5.	Use CDN for frontend assets
	6.	Implement role-based access control
	7.	Add real-time internship ingestion APIs
	8.	Horizontal scaling using Docker + Load Balancer

⸻


👨‍💻 Author

Arnab Ghosh

