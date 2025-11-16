/**
 * Database initialization script
 * Run with: npm run init-db
 * 
 * This script can be used to:
 * - Create indexes
 * - Seed initial data
 * - Verify database connection
 */

const mongoose = require('mongoose');
const { config } = require('dotenv');
const path = require('path');

// Load environment variables
config({ path: path.join(__dirname, '..', '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in environment variables');
  process.exit(1);
}

async function initDatabase() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB successfully');

    // Import models to ensure they're registered
    require('../models/User.js');
    require('../models/Resume.js');
    require('../models/JobListing.js');
    require('../models/Match.js');
    require('../models/AIInterview.js');
    require('../models/Footprint.js');
    require('../models/CareerReport.js');

    // Create indexes
    console.log('🔄 Creating indexes...');
    await mongoose.connection.db.collection('users').createIndex({ email: 1 }, { unique: true });
    await mongoose.connection.db.collection('users').createIndex({ role: 1 });
    await mongoose.connection.db.collection('resumes').createIndex({ user_id: 1 });
    await mongoose.connection.db.collection('joblistings').createIndex({ title: 'text', description: 'text', company: 'text' });
    await mongoose.connection.db.collection('joblistings').createIndex({ location: 1 });
    await mongoose.connection.db.collection('matches').createIndex({ user_id: 1, job_id: 1 }, { unique: true });
    await mongoose.connection.db.collection('matches').createIndex({ match_score: -1 });
    await mongoose.connection.db.collection('footprints').createIndex({ user_id: 1 }, { unique: true });
    await mongoose.connection.db.collection('carreerreports').createIndex({ user_id: 1 }, { unique: true });
    
    console.log('✅ Indexes created successfully');

    // List all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\n📊 Available collections:');
    collections.forEach(col => {
      console.log(`   - ${col.name}`);
    });

    console.log('\n✅ Database initialization complete!');
    
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

initDatabase();

