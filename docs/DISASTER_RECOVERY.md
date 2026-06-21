# Disaster Recovery & Operations Plan

This guide describes operational checklists for deployment failures, performance scaling, and database service disruptions in the **FullStack-Chat-App**.

---

## 1. Rollback Deployment (e.g. Render/Vercel)

If a deployment contains regression issues or crashes during launch:
1. Log in to your hosting provider (e.g., Render Dashboard).
2. Go to your web service settings.
3. Locate the **Deployments** history.
4. Select the last stable release, click the action menu, and select **Rollback** or **Activate**.
5. Uptime check: Immediately test endpoints like GET `/api/health` and GET `/api/ready` to verify service activation.

---

## 2. Environment Variables Validation

Assure all mandatory variables are populated on the deployment service settings:
- `MONGODB_URI`
- `JWT_SECRET`
- `CLIENT_URL`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `PORT` (assigned by Render)
- `NODE_ENV` (set to `production`)

---

## 3. Smoke Test Checklist

Following server recoveries or redeployments, test core workflows manually or via integration scripts:
- **Health check**: Verify GET `/api/health` returns `status: "ok"` and `database: "connected"`.
- **Ready check**: Verify GET `/api/ready` returns `status: "ready"`.
- **Metrics check**: Verify GET `/api/metrics` displays active counts.
- **Authentication**: Test login, logout, and token session check.
- **Messaging**: Verify direct messaging and message requests.
- **Media Upload**: Verify profile photo or message attachment uploads.
- **Websocket Realtime**: Establish two simultaneous test sessions to confirm online indicators and realtime messages delivery.

---

## 4. Scaling Strategy

### A. Horizontal Scaling for Socket.IO
When using more than one application server container instance:
1. Enable **Sticky Sessions** on your network load balancer (e.g. Nginx, AWS ALBs).
2. Integrate a Redis database adapter to synchronize event broadcasts across instances:
   - Install `@socket.io/redis-adapter` and `redis`.
   - Setup client adapter in `backend/src/lib/socket.js`.

### B. MongoDB Atlas Scaling
1. Monitor cluster CPU and query execution metrics on MongoDB Atlas.
2. Confirm indices match active queries.
3. Scale Atlas tier (e.g. from M0 to M10/M20) to handle higher concurrent connections.

### C. CDN caching
Use Cloudinary CDN edge locations to serve media attachments and image files, avoiding hitting backend server bandwidth limits.
