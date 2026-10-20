# VOID — MVP Production Deployment Guide

This guide provides step-by-step instructions for deploying the VOID streetwear e-commerce application to production.

---

## 1. Architecture Overview

```
                      +-----------------------------+
                      |       Vercel (Frontend)     |
                      |   React 19 + Vite + Tailwind|
                      |   https://void.vercel.app   |
                      +--------------+--------------+
                                     |
                 HTTPS API Calls     |  Credentials: include
             with HttpOnly Cookie   |  SameSite: None; Secure
                                     v
                      +-----------------------------+
                      |       Render (Backend)      |
                      |   Express + TypeScript API  |
                      |   https://void-api.onrender.com
                      +--------------+--------------+
                                     |
                         Mongoose TLS Session
                         ACID Multi-Doc Transactions
                                     v
                      +-----------------------------+
                      |   MongoDB Atlas (Database)  |
                      |   Managed M0 Replica Set    |
                      |   mongodb+srv://...         |
                      +-----------------------------+
```

---

## 2. Step 1: Set Up MongoDB Atlas (Database)

MongoDB Atlas provides a free managed replica set (M0 cluster) that natively supports multi-document transactions.

1. **Create an Atlas Account**:
   - Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) and register or log in.
2. **Create a Free Cluster**:
   - Choose the **M0 Free Tier** (AWS or GCP in your closest region).
   - Name the cluster (e.g. `void-cluster`).
3. **Configure Database Access (User)**:
   - Go to **Security** -> **Database Access** -> **Add New Database User**.
   - Authentication Method: **Password**.
   - Set Username (e.g. `void_admin`) and generate a secure password.
   - Database User Privileges: **Read and write to any database**.
4. **Configure Network Access (IP Whitelist)**:
   - Go to **Security** -> **Network Access** -> **Add IP Address**.
   - Choose **Allow Access from Anywhere** (`0.0.0.0/0`) so that Render's cloud servers can connect.
5. **Get Connection String**:
   - In **Databases** -> Click **Connect** -> Choose **Drivers** (Node.js).
   - Copy your connection string:
     ```text
     mongodb+srv://void_admin:<password>@void-cluster.xxxx.mongodb.net/void_db?retryWrites=true&w=majority
     ```
   - Replace `<password>` with your database user password, and ensure the database name is `void_db`.

---

## 3. Step 2: Seed Catalogue to Atlas (One-Time)

To populate your MongoDB Atlas database with the approved initial streetwear catalogue without exposing credentials in Git:

Run the following command locally in your terminal (replacing with your real Atlas connection string):

```powershell
$env:MONGODB_URI="mongodb+srv://void_admin:<password>@void-cluster.xxxx.mongodb.net/void_db?retryWrites=true&w=majority"
npm --prefix backend run seed
```

Verify that the terminal reports:
```text
Catalogue seed complete. Total Products in DB: 8
```

---

## 4. Step 3: Deploy Backend to Render

1. Log in to [dashboard.render.com](https://dashboard.render.com).
2. Click **New +** -> **Web Service**.
3. Connect your GitHub repository (`https://github.com/pmsince2006/Void.git`).
4. Configure service settings:
   - **Name**: `void-backend`
   - **Region**: Closest to your database region (e.g. Frankfurt / Oregon / Singapore).
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: `Free`
5. Click **Advanced** and set:
   - **Health Check Path**: `/api/health`
6. Add the following **Environment Variables**:

| Variable | Value | Description |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Enables production security, error sanitization, and strict secret checks |
| `MONGODB_URI` | `mongodb+srv://void_admin:...` | Your MongoDB Atlas connection string |
| `JWT_SECRET` | *(Click 'Generate' or 64-char random hex)* | Cryptographic key for signing session tokens |
| `FRONTEND_URL` | `https://<your-vercel-app>.vercel.app` | Allowed CORS origin (update once Vercel app is created) |
| `COOKIE_SAME_SITE` | `none` | Allows session cookies across Vercel & Render domains |
| `COOKIE_SECURE` | `true` | Enforces HTTPS on session cookies |
| `TRUST_PROXY` | `1` | Trusts Render's front-facing reverse proxy for client IP rate limiting |
| `ORDER_EXPIRY_MINUTES` | `60` | Time window before abandoned unpaid checkouts are restocked |

7. Click **Create Web Service**. Wait for the build to complete and verify:
   ```text
   Health check at /api/health returned 200 OK
   ```
   Note your Render URL (e.g. `https://void-backend-xxxx.onrender.com`).

---

## 5. Step 4: Deploy Frontend to Vercel

1. Log in to [vercel.com](https://vercel.com).
2. Click **Add New...** -> **Project**.
3. Import your GitHub repository (`Void`).
4. Configure the Project:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click `Edit` -> Select `frontend`
   - **Build Command**: `npm run build` (or default `tsc -b && vite build`)
   - **Output Directory**: `dist`
5. Add Environment Variable:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://void-backend-xxxx.onrender.com/api` (your Render backend URL with `/api`)
6. Click **Deploy**.
7. Vercel will build and assign your production domain:
   `https://void-xxxx.vercel.app`

---

## 6. Step 5: Final Cross-Origin Handshake

1. Return to the **Render Dashboard** -> Your `void-backend` service -> **Environment**.
2. Update `FRONTEND_URL` to match your exact Vercel URL:
   ```text
   FRONTEND_URL=https://void-xxxx.vercel.app
   ```
3. Click **Save Changes**. Render will automatically redeploy the backend with the new allowed origin.

---

## 7. Step 6: Post-Deployment Smoke Verification

Test the live application to verify complete end-to-end functionality:

1. **Backend Health Check**:
   - Open `https://void-backend-xxxx.onrender.com/api/health` in your browser.
   - Expected Response:
     ```json
     {
       "status": "ok",
       "message": "VOID backend is running",
       "database": "connected",
       "timestamp": "..."
     }
     ```
2. **Frontend Loading**:
   - Visit `https://void-xxxx.vercel.app`.
   - Verify catalogue pieces load with correct imagery, pricing, and stock status.
3. **Authentication & Session**:
   - Click account icon -> Register a new client account.
   - Verify success banner and that session persists on refresh (cookie `void_session` present with `SameSite=None; Secure`).
4. **Checkout & Expiry**:
   - Add a product to cart and proceed through checkout.
   - Verify order creation (status: `pending`).
   - Verify order appears in Client Order History (`/orders`).

---

## 8. Common Deployment Troubleshooting

- **CORS Error ("Blocked by CORS policy")**:
  - Verify `FRONTEND_URL` on Render matches the exact Vercel URL without trailing slash (e.g. `https://void.vercel.app`).
- **Session not persisting on refresh in Chrome/Safari**:
  - Ensure `COOKIE_SAME_SITE=none` and `COOKIE_SECURE=true` are set on Render. Cross-origin cookies are rejected by browsers if `Secure` is false.
- **Render deployment hangs on startup**:
  - Check Render logs for database connection failure. Verify MongoDB Atlas Network Access has `0.0.0.0/0` whitelisted.
