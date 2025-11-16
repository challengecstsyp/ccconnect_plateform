# MongoDB Database Setup Guide

This guide will help you set up the MongoDB database for UtopiaHire.

## Prerequisites

1. **MongoDB Installation**
   - Option 1: Install MongoDB locally
     - Download from [MongoDB Community Server](https://www.mongodb.com/try/download/community)
     - Follow installation instructions for your OS
   - Option 2: Use MongoDB Atlas (Cloud)
     - Sign up at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
     - Create a free cluster
     - Get your connection string

## Database Schema

The database `utopiahire` contains the following collections:

1. **users** - User accounts (job seekers, recruiters, admins)
2. **resumes** - User resumes with AI analysis
3. **joblistings** - Job postings
4. **matches** - AI-generated job matches
5. **aiinterviews** - AI interview sessions and feedback
6. **footprints** - Public profile data (GitHub, LinkedIn, StackOverflow)
7. **carreerreports** - AI-generated career insight reports

## Setup Steps

### 1. Configure Environment Variables

Create or update `.env.local` file in the root directory:

```env
# For local MongoDB
MONGODB_URI=mongodb://localhost:27017/utopiahire

# For MongoDB Atlas
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/utopiahire?retryWrites=true&w=majority

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Start MongoDB (Local Installation)

**Windows:**
```bash
# If MongoDB is installed as a service, it should start automatically
# Or start manually:
mongod --dbpath "C:\data\db"
```

**macOS:**
```bash
brew services start mongodb-community
```

**Linux:**
```bash
sudo systemctl start mongod
```

### 3. Initialize Database

Run the initialization script to create indexes:

```bash
npm run init-db
```

This will:
- Connect to MongoDB
- Create necessary indexes for optimal performance
- Verify the connection

### 4. Verify Connection

The init script will output:
- ✅ Connection status
- 📊 List of available collections
- ✅ Index creation status

## Using the Database in Your Code

### Example: API Route

```javascript
// app/api/users/route.js
import connectDB from '@/lib/mongodb';
import { getUserByEmail, createUser } from '@/lib/db-utils';

export async function GET(request) {
  await connectDB();
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');
  
  const user = await getUserByEmail(email);
  return Response.json(user);
}

export async function POST(request) {
  await connectDB();
  const data = await request.json();
  const user = await createUser(data);
  return Response.json(user);
}
```

### Example: Server Component

```javascript
// app/dashboard/page.jsx
import connectDB from '@/lib/mongodb';
import { getJobListings } from '@/lib/db-utils';

export default async function Dashboard() {
  await connectDB();
  const jobs = await getJobListings({ location: 'Remote' });
  
  return (
    <div>
      {jobs.map(job => (
        <div key={job._id}>{job.title}</div>
      ))}
    </div>
  );
}
```

## Database Models

All models are located in the `models/` directory:

- `User.js` - User accounts
- `Resume.js` - Resumes with AI recommendations
- `JobListing.js` - Job postings
- `Match.js` - Job matches
- `AIInterview.js` - Interview sessions
- `Footprint.js` - Public profile data
- `CareerReport.js` - Career insights

## Utility Functions

Common database operations are available in `lib/db-utils.js`:

- `getUserByEmail(email)`
- `getUserById(userId)`
- `createUser(userData)`
- `getResumeByUserId(userId)`
- `createOrUpdateResume(userId, resumeData)`
- `getJobListings(filters)`
- `getMatchesByUserId(userId, status)`
- `createMatch(matchData)`
- And more...

## Troubleshooting

### Connection Issues

1. **Check MongoDB is running:**
   ```bash
   # Windows
   net start MongoDB
   
   # macOS/Linux
   brew services list
   sudo systemctl status mongod
   ```

2. **Verify connection string:**
   - Local: `mongodb://localhost:27017/utopiahire`
   - Atlas: Check your cluster connection string

3. **Check firewall/network:**
   - Ensure port 27017 is open (local)
   - Whitelist your IP in Atlas

### Common Errors

- **"MONGODB_URI not defined"**: Check `.env.local` exists and has the correct variable
- **"Connection timeout"**: MongoDB service might not be running
- **"Authentication failed"**: Check username/password in connection string

## Next Steps

1. Create API routes in `app/api/` to interact with the database
2. Integrate database operations into your pages
3. Add authentication middleware
4. Implement data validation

For more information, see the [Mongoose Documentation](https://mongoosejs.com/docs/).

