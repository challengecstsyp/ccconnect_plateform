# MongoDB Setup Guide - Step by Step

Follow these steps to set up your MongoDB database for UtopiaHire.

## Option 1: MongoDB Atlas (Cloud - Recommended) ⭐

### Step 1: Create MongoDB Atlas Account
1. Go to https://www.mongodb.com/cloud/atlas/register
2. Sign up with your email (or use Google/GitHub)
3. Verify your email address

### Step 2: Create a Free Cluster
1. After logging in, click **"Build a Database"**
2. Choose **"M0 FREE"** (Free tier - perfect for development)
3. Select a **Cloud Provider** (AWS, Google Cloud, or Azure)
4. Choose a **Region** closest to you
5. Click **"Create"** (takes 1-3 minutes)

### Step 3: Create Database User
1. Go to **"Database Access"** (left sidebar)
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication
4. Enter:
   - **Username**: `utopiahire_user` (or your choice)
   - **Password**: Create a strong password (SAVE THIS!)
5. Set privileges to **"Atlas admin"** or **"Read and write to any database"**
6. Click **"Add User"**

### Step 4: Configure Network Access
1. Go to **"Network Access"** (left sidebar)
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (for development)
   - Or add your specific IP address for better security
4. Click **"Confirm"**

### Step 5: Get Connection String
1. Go to **"Database"** (left sidebar)
2. Click **"Connect"** on your cluster
3. Choose **"Connect your application"**
4. Select **Driver**: `Node.js`
5. Select **Version**: `5.5 or later`
6. **Copy the connection string** - it looks like:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

### Step 6: Update Your Connection String
1. Replace `<username>` with your database username
2. Replace `<password>` with your database password
3. Add database name at the end: `/utopiahire?retryWrites=true&w=majority`
4. Final string should look like:
   ```
   mongodb+srv://utopiahire_user:YourPassword123@cluster0.xxxxx.mongodb.net/utopiahire?retryWrites=true&w=majority
   ```

### Step 7: Update .env.local
1. Open `.env.local` in your project root
2. Update `MONGODB_URI` with your connection string:
   ```env
   MONGODB_URI=mongodb+srv://utopiahire_user:YourPassword123@cluster0.xxxxx.mongodb.net/utopiahire?retryWrites=true&w=majority
   ```
3. Save the file

### Step 8: Test Connection
Run this command in your terminal:
```bash
npm run init-db
```

**Expected Output:**
```
🔄 Connecting to MongoDB...
✅ Connected to MongoDB successfully
🔄 Creating indexes...
✅ Indexes created successfully

📊 Available collections:
   - users
   - resumes
   - joblistings
   - matches
   - aiinterviews
   - footprints
   - carreerreports

✅ Database initialization complete!
🔌 Database connection closed
```

---

## Option 2: Local MongoDB Installation

### Step 1: Download MongoDB
1. Go to https://www.mongodb.com/try/download/community
2. Select:
   - **Version**: Latest (7.0+)
   - **Platform**: Windows
   - **Package**: MSI
3. Click **"Download"**

### Step 2: Install MongoDB
1. Run the downloaded `.msi` installer
2. Choose **"Complete"** installation
3. Check **"Install MongoDB as a Service"**
4. Choose **"Run service as Network Service user"**
5. Check **"Install MongoDB Compass"** (GUI tool - optional but helpful)
6. Click **"Install"**

### Step 3: Verify Installation
Open PowerShell and run:
```powershell
mongod --version
```

If you see version info, MongoDB is installed!

### Step 4: Start MongoDB Service
MongoDB should start automatically. To check:
```powershell
Get-Service MongoDB
```

If it shows "Running", you're good! If not:
```powershell
Start-Service MongoDB
```

### Step 5: Update .env.local
1. Open `.env.local` in your project root
2. Set `MONGODB_URI`:
   ```env
   MONGODB_URI=mongodb://localhost:27017/utopiahire
   ```
3. Save the file

### Step 6: Test Connection
Run this command:
```bash
npm run init-db
```

**Expected Output:**
```
🔄 Connecting to MongoDB...
✅ Connected to MongoDB successfully
🔄 Creating indexes...
✅ Indexes created successfully

📊 Available collections:
   - users
   - resumes
   - joblistings
   - matches
   - aiinterviews
   - footprints
   - carreerreports

✅ Database initialization complete!
🔌 Database connection closed
```

---

## Troubleshooting

### ❌ "MONGODB_URI not found"
- Make sure `.env.local` exists in project root
- Check the file has `MONGODB_URI=` line
- Restart your dev server after updating `.env.local`

### ❌ "Connection timeout" or "ECONNREFUSED"
**For Local MongoDB:**
- Check if MongoDB service is running: `Get-Service MongoDB`
- Start it: `Start-Service MongoDB`
- Check if port 27017 is open

**For MongoDB Atlas:**
- Check Network Access - your IP might not be whitelisted
- Verify connection string has correct username/password
- Make sure database name is included: `/utopiahire`

### ❌ "Authentication failed"
- Double-check username and password in connection string
- Make sure special characters in password are URL-encoded:
  - `@` → `%40`
  - `#` → `%23`
  - `$` → `%24`
  - `%` → `%25`

### ❌ "Database initialization error"
- Make sure MongoDB is running
- Check connection string format
- Try connecting with MongoDB Compass first to verify

---

## Verify Database Setup

### Test API Endpoint
1. Make sure your dev server is running: `npm run dev`
2. Visit: http://localhost:3000/api/test-db
3. You should see:
   ```json
   {
     "success": true,
     "message": "Database connection successful!",
     "userCount": 0
   }
   ```

### Check Collections in MongoDB Atlas
1. Go to MongoDB Atlas → Database
2. Click **"Browse Collections"**
3. You should see the database `utopiahire` with collections ready

### Check Collections in MongoDB Compass (Local)
1. Open MongoDB Compass
2. Connect to: `mongodb://localhost:27017`
3. You should see database `utopiahire` with collections

---

## Next Steps After Setup

✅ Database is ready!
✅ You can now:
- Sign up new users
- Login with accounts
- Test email verification
- Create job listings
- All features will work with real database

---

## Quick Reference

### Connection Strings

**MongoDB Atlas:**
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/utopiahire?retryWrites=true&w=majority
```

**Local MongoDB:**
```
mongodb://localhost:27017/utopiahire
```

### Environment Variables (.env.local)
```env
MONGODB_URI=your_connection_string_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-chars
```

### Useful Commands
```bash
# Initialize database
npm run init-db

# Test database connection
curl http://localhost:3000/api/test-db

# Check MongoDB service (Windows)
Get-Service MongoDB
Start-Service MongoDB
Stop-Service MongoDB
```

---

## Need Help?

If you encounter issues:
1. Check the error message carefully
2. Verify your connection string format
3. Test connection with MongoDB Compass (for local) or Atlas web interface
4. Make sure all environment variables are set correctly

Good luck! 🚀

