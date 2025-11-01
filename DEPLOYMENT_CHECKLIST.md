# Mini Zapier - Production Checklist

## ✅ Pre-Deployment

### 1. Environment Setup
- [ ] Create `.env` file from `.env.example`
- [ ] Set strong `JWT_SECRET` (min 32 characters)
- [ ] Configure `DATABASE_URL` (production database)
- [ ] Configure `REDIS_URL` (production Redis)
- [ ] Set `NODE_ENV="production"`
- [ ] Configure SMTP settings (if using email)
- [ ] Update `CORS_ORIGINS` with production domain
- [ ] Set `VITE_API_URL` in frontend `.env`

### 2. Database
- [ ] PostgreSQL database created
- [ ] Run migrations: `npx prisma migrate deploy`
- [ ] Verify database connection

### 3. Redis
- [ ] Redis server running
- [ ] Verify Redis connection
- [ ] Test queue functionality

### 4. Backend
- [ ] Install dependencies: `npm install`
- [ ] Generate Prisma client: `npx prisma generate`
- [ ] Test server: `npm start`
- [ ] Test worker: `npm run worker`

### 5. Frontend
- [ ] Install dependencies: `cd frontend && npm install`
- [ ] Build production: `npm run build`
- [ ] Test build: `npm run preview`
- [ ] Verify `VITE_API_URL` is set correctly

### 6. Security
- [ ] Strong JWT_SECRET set
- [ ] CORS configured for production domain
- [ ] HTTPS enabled (SSL certificate)
- [ ] Environment variables secured (not in git)
- [ ] Database credentials strong
- [ ] Redis credentials strong (if applicable)

### 7. Files
- [ ] Create `uploads/` directory (if not exists)
- [ ] Set proper permissions for `uploads/`
- [ ] Backup `.env` file securely

## 🚀 Deployment Steps

### Option A: Traditional Server (VPS)

1. **Setup Server**
   ```bash
   # Install Node.js, PostgreSQL, Redis, Nginx
   sudo apt update
   sudo apt install nodejs npm postgresql redis-server nginx
   ```

2. **Deploy Code**
   ```bash
   git clone <repo>
   cd Mini_Zapier
   npm install
   ```

3. **Configure Environment**
   ```bash
   cp .env.example .env
   nano .env  # Edit with production values
   ```

4. **Setup Database**
   ```bash
   npx prisma generate
   npx prisma migrate deploy
   ```

5. **Build Frontend**
   ```bash
   cd frontend
   npm install
   npm run build
   cd ..
   ```

6. **Use PM2**
   ```bash
   npm install -g pm2
   pm2 start server.js --name "api"
   pm2 start workers/worker.js --name "worker"
   pm2 save
   pm2 startup
   ```

7. **Configure Nginx**
   - See DEPLOYMENT.md for Nginx config

### Option B: Platform-as-a-Service

1. **Railway/Render/Heroku**
   - Connect GitHub repo
   - Add PostgreSQL service
   - Add Redis service
   - Set environment variables
   - Deploy

## ✅ Post-Deployment

- [ ] Test signup/login
- [ ] Test workflow creation
- [ ] Test webhook trigger
- [ ] Test email action
- [ ] Test Slack action
- [ ] Test job history
- [ ] Monitor server logs
- [ ] Monitor worker logs
- [ ] Setup monitoring (optional)
- [ ] Setup backups (database + uploads)

## 📊 Monitoring

- Monitor server health: `GET /health`
- Check PM2 status: `pm2 status`
- Check logs: `pm2 logs`
- Monitor Redis: `redis-cli ping`
- Monitor database connections

## 🔧 Troubleshooting

- **500 errors**: Check server logs, verify database connection
- **Jobs not processing**: Check worker is running, verify Redis
- **CORS errors**: Update CORS_ORIGINS in .env
- **Email not sending**: Check SMTP credentials

---

**Ready to deploy!** 🚀

