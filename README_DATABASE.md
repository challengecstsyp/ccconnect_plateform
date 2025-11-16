# Quick Start: MongoDB Setup

## 1. Install MongoDB

### Option A: Local Installation
- **Windows**: Download from [MongoDB Download Center](https://www.mongodb.com/try/download/community)
- **macOS**: `brew install mongodb-community`
- **Linux**: Follow [MongoDB Installation Guide](https://www.mongodb.com/docs/manual/installation/)

### Option B: MongoDB Atlas (Cloud - Recommended)
1. Sign up at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Create a free cluster
3. Get your connection string

## 2. Configure Connection

Edit `.env.local` and set your MongoDB URI:

```env
# Local MongoDB
MONGODB_URI=mongodb://localhost:27017/utopiahire

# OR MongoDB Atlas
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/utopiahire
```

## 3. Initialize Database

```bash
npm run init-db
```

## 4. Test Connection

Visit: http://localhost:3000/api/test-db

You should see:
```json
{
  "success": true,
  "message": "Database connection successful!",
  "userCount": 0
}
```

## Database Collections

✅ **users** - User accounts  
✅ **resumes** - Resumes with AI analysis  
✅ **joblistings** - Job postings  
✅ **matches** - Job matches  
✅ **aiinterviews** - Interview sessions  
✅ **footprints** - Public profiles  
✅ **carreerreports** - Career reports  

All models are ready to use! See `DATABASE_SETUP.md` for detailed documentation.

