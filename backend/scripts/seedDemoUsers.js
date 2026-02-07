require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');

const User = require(path.join(__dirname, '..', 'models', 'User'));

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/healthvillage';

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB for seeding');

    const users = [
      {
        name: 'Demo Patient',
        email: 'patient@demo.com',
        phone: '9000000001',
        password: 'password123',
        role: 'patient',
        age: 30,
        gender: 'female',
        village: 'Demo Village'
      },
      {
        name: 'Demo Doctor',
        email: 'doctor@demo.com',
        phone: '9000000002',
        password: 'password123',
        role: 'doctor',
        specialization: 'General Practitioner',
        yearsOfExperience: 5
      },
      {
        name: 'Demo Admin',
        email: 'admin@demo.com',
        phone: '9000000003',
        password: 'password123',
        role: 'admin'
      }
    ];

    for (const u of users) {
      const hashed = await bcrypt.hash(u.password, 10);
      const update = {
        name: u.name,
        email: u.email.toLowerCase(),
        phone: u.phone,
        password: hashed,
        role: u.role,
      };
      if (u.role === 'patient') {
        update.age = u.age;
        update.gender = u.gender;
        update.village = u.village;
      }
      if (u.role === 'doctor') {
        update.specialization = u.specialization;
        update.yearsOfExperience = u.yearsOfExperience;
      }

      const res = await User.findOneAndUpdate(
        { email: update.email },
        { $set: update },
        { upsert: true, new: true }
      );
      console.log(`Seeded user: ${res.email} (${res.role})`);
    }

    console.log('Seeding complete.');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

seed();
