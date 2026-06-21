# Backup & Recovery Guide

This document describes the backup and recovery procedures for **FullStack-Chat-App** production resources (MongoDB database and Cloudinary assets).

## 1. MongoDB Database Backup & Restore

### A. MongoDB Atlas Cloud Backups (Recommended)
If MongoDB is hosted on Atlas:
1. Navigate to your cluster on Atlas dashboard.
2. Select **Database Backups** tab.
3. Configure scheduled snapshot frequencies (e.g. daily snapshots, 7-day retention).
4. Restores can be initiated directly through the Atlas UI via point-in-time recovery.

### B. Manual Backups (Using CLI Utilities)
Use `mongodump` and `mongorestore` tools locally or in backend scripts.

#### Backing up MongoDB
Run the dump command specifying your URI:
```bash
mongodump --uri="mongodb+srv://<username>:<password>@cluster.mongodb.net/chat_prod" --out="./backups/mongodb-$(date +%F)"
```

#### Restoring MongoDB
To restore the dumped database:
```bash
mongorestore --uri="mongodb+srv://<username>:<password>@cluster.mongodb.net/chat_prod" "./backups/mongodb-<timestamp>/chat_prod" --drop
```
*(Warning: `--drop` will delete existing data in matching collections before restoring).*

---

## 2. Cloudinary Media Asset Backup

Cloudinary serves as our storage engine for avatar images and messages.

### A. Cloudinary Backup Feature
Enabling backup in Cloudinary accounts automatically copies images to secure secondary repositories:
1. Log in to **Cloudinary Console**.
2. Go to **Settings** > **Upload**.
3. Under **Backup**, check **Enable Backup**.
4. Deleted assets can be restored from backup storage through Cloudinary support or management API.

### B. Bulk Backup Download (CLI)
You can write local backup scripts using the Cloudinary CLI tool:
```bash
cloudinary admin assets -f csv > cloudinary_assets.csv
```
For manual download:
Use the CSV paths to fetch and store files to local storage or an AWS S3 bucket.
