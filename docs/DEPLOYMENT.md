# College Internship Management System (CIMS) - Production Deployment Guide

This guide details the steps required to take the College Internship Management System from local development to a production cloud deployment.

```
                           +------------------------+
                           |  GitHub Source Hosting |
                           +-----------+------------+
                                       |
                   +-------------------+-------------------+
                   |                                       |
                   v                                       v
    +-------------------------------+       +-------------------------------+
    |  Frontend Web Deployment      |       |  Backend API Deployment       |
    |  (Vercel / Netlify / AWS)     |       |  (Render / Railway / AWS ECS) |
    +---------------+---------------+       +---------------+---------------+
                    |                                       |
                    | CORS & API Requests                   | Prisma ORM (Port 3306)
                    +-------------------+-------------------+
                                        |
                                        v
                         +-----------------------------+
                         |  Managed MySQL Database     |
                         |  (AWS RDS / PlanetScale /   |
                         |   Aiven / Railway MySQL)    |
                         +-----------------------------+
```

---

## Step 1: Provision Managed MySQL Database

GitHub is used strictly for source code hosting. Do **NOT** attempt to run a MySQL database instance inside GitHub. Use a dedicated managed MySQL service:

Recommended Managed MySQL Providers:
- **Aiven for MySQL** (Free tier available)
- **Railway Managed MySQL**
- **Amazon RDS for MySQL**
- **DigitalOcean Managed Databases**
- **PlanetScale**

Obtain your production database connection string formatted as:
```env
DATABASE_URL="mysql://<USERNAME>:<SECURE_PASSWORD>@<HOST>:3306/<DATABASE_NAME>?sslaccept=strict"
```

---

## Step 2: Configure Backend Cloud Deployment

Deploy the `backend/` folder on a container or Node.js hosting platform (e.g., Render, Railway, Fly.io, AWS Elastic Beanstalk).

### Production Environment Variables (Backend)

Set these environment variables in your hosting provider's dashboard (never commit them to Git):

| Variable | Production Value Description | Example |
|---|---|---|
| `DATABASE_URL` | Connection string to your managed MySQL database | `mysql://admin:P@ssw0rd!@db.host.com:3306/college_internship` |
| `JWT_SECRET` | 32+ character random cryptographic secret key | `c8f2a1b9d4e7f0c1a3b5d7e9f2a4b6c8d0e2...` |
| `CLIENT_URL` | Public HTTPS domain of your deployed frontend | `https://cims-portal.vercel.app` |
| `PORT` | Web port assigned by provider (or default 5000) | `5000` |
| `NODE_ENV` | Environment identifier | `production` |
| `UPLOAD_DIR` | Directory or S3 bucket path for uploaded resumes | `./uploads` |

### Build & Run Commands
- **Build Command:** `npm install && npx prisma generate && npm run build`
- **Migration Command:** `npx prisma db push` (or `npx prisma migrate deploy`)
- **Seed Command (Initial Setup):** `npm run prisma:seed`
- **Start Command:** `npm run start`

---

## Step 3: Configure Frontend Cloud Deployment

Deploy the `frontend/` folder on a static hosting service (e.g., Vercel, Netlify, Cloudflare Pages, AWS S3 + CloudFront).

### Production Environment Variables (Frontend)

| Variable | Description | Example |
|---|---|---|
| `VITE_API_URL` | Public HTTPS URL of the deployed backend API | `https://api.cims.yourdomain.com/api` |

### Build Settings
- **Framework Preset:** Vite
- **Root Directory:** `frontend`
- **Build Command:** `npm run build`
- **Output Directory:** `dist`

### Single Page Application (SPA) Routing Configuration
For Vercel or Netlify, ensure all routes redirect to `index.html`:
- For **Vercel**: Add `vercel.json`:
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/" }]
}
```
- For **Netlify**: Add `public/_redirects`:
```text
/*    /index.html   200
```

---

## Step 4: Verification & Smoke Testing Checklist

Once deployed, complete the following verification checklist:
1. [ ] Send `GET https://your-backend-api.com/api/health` and verify `status: "healthy"`, `database: "connected (MySQL)"`.
2. [ ] Navigate to the public frontend URL and confirm the landing page renders with styling and assets.
3. [ ] Test logging in with the seeded Admin account (`admin@example.com`).
4. [ ] Verify role-based routing restricts unauthorized paths.
5. [ ] Submit a test application with a PDF resume upload.
6. [ ] Confirm CORS headers allow incoming requests from your production frontend domain.
7. [ ] Confirm `.env` files are not publicly accessible or present in the Git history.
