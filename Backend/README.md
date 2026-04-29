# ⚙️ AideDesk Backend: The Engine Room

Welcome to the backend of the **AideDesk** platform. This repository serves as the "brain" of the application, managing everything from secure authentication and real-time messaging to data persistence and AI-powered ticket handling.

## 🚀 What’s Inside?

Our backend is designed for high performance, security, and scalability. It efficiently bridges the gap between your customers, human agents, and our intelligent AI components.

## 🛠 Tech Stack

- **Node.js & Express:** The robust, event-driven foundation of our REST API server.
- **MongoDB & Mongoose:** Our NoSQL database choice for flexibly storing chat histories, user profiles, and organization data.
- **Socket.IO:** Powers the instant, bi-directional "real-time" communication required for seamless chat support.
- **Claude AI:** The core AI engine that understands, routes, and automatically answers customer questions.

## 🔐 Security & Operations

We take data privacy, security, and developer experience seriously.

- **Safe Logins:** We implement secure authentication using **JSON Web Tokens (JWT)** and **bcrypt** to ensure users only access what they are permitted to.
- **Email Verification:** Required via `nodemailer` for all new users before accessing the platform.
- **Code Quality:** Automated linting and formatting via **ESLint** and **Prettier** keep the codebase clean, consistent, and highly readable.
- **Containerization:** Fully containerized with **Docker** ensuring "it works on my machine" translates to "it works everywhere."

## 🚦 Getting Started

Follow these instructions to run the backend locally.

### Prerequisites

- Node.js (v18+)
- MongoDB (Running locally or MongoDB Atlas)
- Docker (Optional, for containerized running)

### Setup

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Environment Variables:**
   Create a `.env` file in the root directory and add the required configurations (e.g., `PORT`, `MONGODB_URI`, `JWT_SECRET`, etc.).

3. **Run the Development Server:**
   ```bash
   npm run dev
   ```
   *The server will start using `nodemon` for hot-reloading.*

4. **Run via Docker:**
   ```bash
   docker-compose up --build
   ```
