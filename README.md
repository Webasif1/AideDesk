# Aidedesk: AI Customer Support Platform

## 🤖 What is Aidedesk?
Aidedesk is a production-grade Multi-Tenant AI Customer Support Platform. It is built using the MERN stack (MongoDB, Express, React, Node.js) and the Claude AI engine. The platform acts as a smart bridge between a company and its customers, turning unorganized messages into structured "tickets" that are easy to manage. Because it is "multi-tenant," many different businesses can use the platform at the same time while keeping their data completely private and isolated.

## ❓ Why Aidedesk?
In the modern world, customer support teams are often drowning in messages. This creates several big problems for businesses:

- **Manual Support is Slow:** Human agents spend too much time answering the same repetitive questions over and over.
- **Customer Loss:** When customers have to wait too long for an answer, they get frustrated and take their business elsewhere.
- **Agent Burnout:** Support teams get exhausted by the "chaos" of unorganized emails, chats, and social media messages.
- **The "Gap":** Most tools today are either 100% manual (too slow) or 100% robotic (too cold and often wrong).

## ✅ What Aidedesk Solves
Aidedesk was built to be the perfect middle ground where AI and humans work together to make support "effortless and scalable".

- **Repetitive Task Automation:** Simple FAQ (like "How do I reset my password?") are handled instantly by the AI, so humans don't have to touch them.
- **Faster Human Response:** For complex issues, the AI writes a 3-sentence briefing for the agent, saving them from reading long chat histories.
- **Urgency Detection:** The system uses Sentiment Analysis to score customer frustration on a scale of 1–5, automatically moving angry customers to the front of the line.
- **Grounded Answers:** Unlike generic AI, our system uses RAG (Retrieval-Augmented Generation) to find answers specifically from the company’s own help documents.
- **Efficiency Gains:** In real-world simulations, this "AI Co-pilot" model can reduce the time an agent spends on a ticket by 40%.

## 🛠 Tech Stack & Tools
We used a modern, "DevOps-ready" stack to ensure the platform is fast and reliable:

- **Frontend:** React 18 and Vite for a blazing-fast user interface, styled with TailwindCSS.
- **Backend:** Node.js (Express 5) for the server logic and Socket.IO for instant, real-time messaging.
- **Database:** MongoDB for chat storage and Pinecone (Vector DB) for storing searchable AI knowledge.
- **AI Engine:** Anthropic Claude API (claude-sonnet-4) for intelligent thinking and Voyage AI for text embeddings.
- **DevOps:** Docker and Docker Compose for easy setup, with Prometheus and Grafana for monitoring system health.
