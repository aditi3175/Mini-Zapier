# 🎯 Mini Zapier

A modern workflow automation platform - create triggers, add actions, and automate your work!

## ✨ Features

- 🔐 **User Authentication** - Secure signup/login with JWT
- 📋 **Workflow Management** - Create, manage, and organize workflows
- 🔗 **Webhook Triggers** - Receive HTTP requests to trigger workflows
- ⏰ **Schedule Triggers** - Run workflows on a schedule (cron or interval)
- 📧 **Email Actions** - Send emails via SMTP
- 💬 **Slack Actions** - Send messages to Slack channels
- 🌐 **Webhook Actions** - Call external APIs
- 📊 **Job History** - Track workflow execution status and results
- 👤 **Profile Management** - Update profile, avatar, and settings
- 🎨 **Modern UI** - Beautiful dark/light theme with smooth animations
- 📱 **Responsive Design** - Works on desktop and mobile

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL
- Redis

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd Mini_Zapier
   ```

2. **Install backend dependencies**
   ```bash
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   cd ..
   ```

4. **Setup environment variables**
   
   Create `.env` file in root:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/mydb"
   JWT_SECRET="your-secret-key-change-this"
   REDIS_URL="redis://localhost:6379"
   ```

5. **Setup database**
   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```

6. **Start services**
   
   Terminal 1 (Backend):
   ```bash
   node server.js
   ```
   
   Terminal 2 (Worker):
   ```bash
   node workers/worker.js
   ```
   
   Terminal 3 (Frontend):
   ```bash
   cd frontend
   npm run dev
   ```

7. **Open in browser**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000

## 📖 Documentation

- [Deployment Guide](./DEPLOYMENT.md) - Complete production deployment instructions

## 🛠️ Tech Stack

**Backend:**
- Express.js
- Prisma ORM
- PostgreSQL
- Redis + BullMQ
- JWT Authentication
- Nodemailer

**Frontend:**
- React 19
- Vite
- Tailwind CSS
- React Router
- Axios

## 📁 Project Structure

```
Mini_Zapier/
├── api/              # API routes
├── controllers/      # Route handlers
├── services/         # Business logic
├── integrations/     # Email, Slack, Webhook integrations
├── workers/          # Background job processor
├── middlewares/      # Auth, error handling
├── DB/              # Database config
├── prisma/          # Database schema & migrations
├── frontend/        # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   └── utils/
└── server.js        # Main server file
```

## 🔑 Environment Variables

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete list.

**Required:**
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret for JWT tokens
- `REDIS_URL` - Redis connection string

**Optional:**
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` - Email configuration
- `NODE_ENV` - Environment (development/production)
- `VITE_API_URL` - Frontend API URL

## 🧪 Testing

### Test Webhook Trigger

1. Create a workflow with webhook trigger
2. Copy the webhook URL and secret from UI
3. Use Postman to send POST request:
   ```json
   {
     "workflowSecret": "your-secret",
     "user": { "email": "test@example.com" }
   }
   ```

See [POSTMAN_TESTING_GUIDE.md](./POSTMAN_TESTING_GUIDE.md) for details.

## 🤝 Contributing

Contributions welcome! Please feel free to submit a Pull Request.

## 📝 License

ISC

## 👨‍💻 Author

Built with ❤️ using modern web technologies

---

**Happy Automating!** 🎉

