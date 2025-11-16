# Quick MongoDB Setup - 5 Minutes ⚡

## Fastest Way: MongoDB Atlas (Cloud)

### 1️⃣ Sign Up & Create Cluster (2 min)
- Go to: https://www.mongodb.com/cloud/atlas/register
- Click "Build a Database" → Choose "M0 FREE" → Click "Create"

### 2️⃣ Create User (1 min)
- Go to "Database Access" → "Add New Database User"
- Username: `utopiahire_user`
- Password: `YourSecurePassword123` (SAVE THIS!)
- Click "Add User"

### 3️⃣ Allow Network Access (30 sec)
- Go to "Network Access" → "Add IP Address"
- Click "Allow Access from Anywhere"
- Click "Confirm"

### 4️⃣ Get Connection String (1 min)
- Go to "Database" → Click "Connect" → "Connect your application"
- Copy the connection string
- Replace `<username>` and `<password>` with your credentials
- Add `/utopiahire` before the `?`:
  ```
  mongodb+srv://utopiahire_user:YourSecurePassword123@cluster0.xxxxx.mongodb.net/utopiahire?retryWrites=true&w=majority
  ```

### 5️⃣ Update .env.local (30 sec)
Open `.env.local` and paste:
```env
MONGODB_URI=mongodb+srv://utopiahire_user:YourSecurePassword123@cluster0.xxxxx.mongodb.net/utopiahire?retryWrites=true&w=majority
NEXT_PUBLIC_APP_URL=http://localhost:3000
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-chars
```

### 6️⃣ Initialize Database (30 sec)
```bash
npm run init-db
```

**Done!** ✅ Your database is ready!

---

## Test It

Visit: http://localhost:3000/api/test-db

Should show:
```json
{
  "success": true,
  "message": "Database connection successful!",
  "userCount": 0
}
```

---

## Common Issues

**"Authentication failed"**
→ Check username/password in connection string

**"Connection timeout"**
→ Check Network Access in Atlas (whitelist your IP)

**"MONGODB_URI not found"**
→ Make sure `.env.local` exists and has the variable

---

That's it! You're ready to go! 🎉

