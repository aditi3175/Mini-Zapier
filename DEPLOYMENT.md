# 🚀 Mini Zapier - Production Deployment Guide

## ✅ Current Features

- ✅ User Authentication (Signup/Login with JWT)
- ✅ Workflow Management (Create, Read, Update, Delete)
- ✅ Webhook Triggers (with secret-based authentication)
- ✅ Schedule Triggers (Cron & Interval-based)
- ✅ Email Actions (SMTP integration)
- ✅ Slack Actions (Webhook integration)
- ✅ Outgoing Webhooks
- ✅ Job History & Status Tracking
- ✅ User Profile Management (Avatar, Email, Name)
- ✅ Modern UI with Dark/Light Theme
- ✅ Responsive Design
- ✅ Drawer-style Sidebar

## 📋 Pre-Deployment Checklist

### 1. Environment Variables Setup

Create a `.env` file in the root directory with:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/mydb"

# JWT Secret (REQUIRED - Generate a strong random string)
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# Redis (for BullMQ queue)
REDIS_URL="redis://localhost:6379"
# OR for Redis Cloud:
# REDIS_URL="redis://default:password@redis-host:port"

# Email Configuration (Optional - for production emails)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
USE_ETHEREAL="false"  # Set to false in production

# Node Environment
NODE_ENV="production"

# Frontend API URL (for production)
VITE_API_URL="https://your-domain.com"
```

### 2. Database Setup

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# (Optional) Seed database with initial data
```

### 3. Backend Setup

#### Install Dependencies
```bash
npm install
```

#### Start Services
- **PostgreSQL**: Make sure PostgreSQL is running
- **Redis**: Make sure Redis is running (required for job queue)

#### Start Backend Server
```bash
node server.js
```

#### Start Worker (in separate terminal)
```bash
node workers/worker.js
```

### 4. Frontend Setup

```bash
cd frontend
npm install
npm run build
```

The built files will be in `frontend/dist/` directory.

### 5. Production Scripts

Add these to `package.json`:

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "worker": "node workers/worker.js",
    "db:generate": "prisma generate",
    "db:migrate": "prisma migrate deploy",
    "db:studio": "prisma studio"
  }
}
```

## 🔒 Security Checklist

- [ ] **JWT_SECRET**: Use a strong, random secret (min 32 characters)
- [ ] **Database**: Use strong passwords, enable SSL if possible
- [ ] **CORS**: Update CORS origins in `server.js` for production domain
- [ ] **Environment Variables**: Never commit `.env` file
- [ ] **HTTPS**: Use SSL/TLS certificates in production
- [ ] **Rate Limiting**: Consider adding rate limiting (optional)
- [ ] **Input Validation**: Add validation middleware (optional)

## 📦 Deployment Options

### Option 1: Traditional VPS (DigitalOcean, AWS EC2, etc.)

1. **Setup Server**:
   ```bash
   # Install Node.js, PostgreSQL, Redis
   sudo apt update
   sudo apt install nodejs npm postgresql redis-server
   ```

2. **Clone Repository**:
   ```bash
   git clone <your-repo>
   cd Mini_Zapier
   ```

3. **Setup Environment**:
   ```bash
   cp .env.example .env
   # Edit .env with production values
   ```

4. **Install & Build**:
   ```bash
   npm install
   npx prisma generate
   npx prisma migrate deploy
   cd frontend && npm install && npm run build
   ```

5. **Use PM2 for Process Management**:
   ```bash
   npm install -g pm2
   pm2 start server.js --name "mini-zapier-api"
   pm2 start workers/worker.js --name "mini-zapier-worker"
   pm2 save
   pm2 startup
   ```

6. **Setup Nginx** (for serving frontend):
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       # Frontend
       location / {
           root /path/to/Mini_Zapier/frontend/dist;
           try_files $uri $uri/ /index.html;
       }

       # Backend API
       location /api {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

### Option 2: Docker Deployment

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY prisma ./prisma
RUN npx prisma generate

COPY . .

EXPOSE 3000

CMD ["node", "server.js"]
```

### Option 3: Platform-as-a-Service (Heroku, Railway, Render)

1. **Heroku**:
   - Add PostgreSQL addon
   - Add Redis addon
   - Set environment variables
   - Deploy backend
   - Deploy frontend separately or use buildpack

2. **Railway**:
   - Connect GitHub repo
   - Add PostgreSQL service
   - Add Redis service
   - Set environment variables
   - Deploy

## 🔧 Required Services

1. **PostgreSQL Database**
   - Local: `postgresql://user:pass@localhost:5432/dbname`
   - Cloud: Use Supabase, Neon, Railway, etc.

2. **Redis Server**
   - Local: `redis://localhost:6379`
   - Cloud: Use Redis Cloud, Upstash, etc.

3. **SMTP Server** (Optional)
   - Gmail, SendGrid, Mailgun, etc.

## 📝 Post-Deployment

1. **Test All Features**:
   - [ ] User signup/login
   - [ ] Create workflow
   - [ ] Add triggers (webhook, schedule)
   - [ ] Add actions (email, slack, webhook)
   - [ ] Test webhook trigger from Postman
   - [ ] Check job history

2. **Monitor**:
   - Check server logs
   - Monitor Redis connection
   - Monitor database connections
   - Check worker logs

3. **Backup**:
   - Setup database backups
   - Backup uploaded files (`uploads/` directory)

## 🐛 Troubleshooting

### Worker not processing jobs?
- Check Redis connection
- Verify worker is running: `node workers/worker.js`

### Database connection errors?
- Verify `DATABASE_URL` in `.env`
- Check PostgreSQL is running
- Run migrations: `npx prisma migrate deploy`

### CORS errors?
- Update `origin` in `server.js` CORS config
- Include your frontend domain

### Emails not sending?
- Check SMTP credentials in `.env`
- Verify `USE_ETHEREAL="false"` in production
- Check email service logs

## 📚 Additional Resources

- [Prisma Deployment Guide](https://www.prisma.io/docs/guides/deployment)
- [BullMQ Documentation](https://docs.bullmq.io/)
- [Express.js Production Best Practices](https://expressjs.com/en/advanced/best-practice-production.html)

## 🎯 Next Steps (Optional Enhancements)

- [ ] Add rate limiting
- [ ] Add request validation middleware
- [ ] Add logging (Winston, Pino)
- [ ] Add monitoring (Sentry, DataDog)
- [ ] Add API documentation (Swagger)
- [ ] Add unit/integration tests
- [ ] Add CI/CD pipeline
- [ ] Add more action types (SMS, Database, etc.)

---

**Ready to deploy!** 🚀

Make sure all environment variables are set correctly and services (PostgreSQL, Redis) are running before deploying.

