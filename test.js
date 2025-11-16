const mongoose = require('mongoose');

const url = "mongodb+srv://dhouaflimohamedaziz_db_user:StrongPassword123!@cluster0.deqv6z6.mongodb.net/utopiahire?retryWrites=true&w=majority";

mongoose.connect(url)
  .then(() => {
    console.log('✅ Database connected successfully');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Connection failed:', err);
    process.exit(1);
  });
