⚙️ Backend README.md
The Engine Room

What’s inside?
This is the "brain" of the app. It handles the security, the database, and the AI logic.

The Tech We Used
Node.js & Express: The foundation of our server.

MongoDB: Where we store all the chats, users, and company info.

Socket.IO: This makes the "real-time" part work so messages send instantly.

Claude AI: The AI model that understands customer questions.

Security & DevOps
Safe Logins: We use secure tokens (JWT) to make sure users only see what they are allowed to see.

Email Verification: New users must verify their email before they can start.

Code Quality: We use ESLint and Prettier to keep our code clean and easy for other devs to read.

Docker: We containerized the whole backend so it runs the same on everyone's computer.
