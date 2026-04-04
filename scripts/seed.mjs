import mongoose from 'mongoose';
import fs from 'fs';

// Manually parse .env.local because dotenv might not be installed
const envContent = fs.readFileSync('.env.local', 'utf8');
const MONGODB_URI = envContent.split('\n').find(line => line.startsWith('MONGODB_URI=')).split('=')[1].trim();

if (!MONGODB_URI) {
  console.error("MONGODB_URI is not defined");
  process.exit(1);
}

// Inline User and Job schemas for the script
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  role: String,
  isVerified: Boolean,
  rating: Number,
  noShows: Number,
  createdAt: { type: Date, default: Date.now }
});

const jobSchema = new mongoose.Schema({
  title: String,
  category: String,
  payRate: Number,
  payType: String,
  urgency: String,
  location: String,
  description: String,
  duration: String,
  geoCoordinates: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true }
  },
  employerId: mongoose.Schema.Types.ObjectId,
  expiresAt: Date
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', userSchema);
const Job = mongoose.models.Job || mongoose.model('Job', jobSchema);

async function run() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    // Find employer
    let employer = await User.findOne({ role: 'employer' });
    
    if (!employer) {
       console.log("No employer user found, creating system employer...");
       employer = await User.create({
         name: "FlexiWork Official",
         email: "hire@flexiwork.com",
         role: "employer",
         isVerified: true,
         rating: 5,
         noShows: 0
       });
    }

    console.log(`Using Employer ID: ${employer._id}`);

    const seedJobs = [
      {
        title: "Delivery Helper (Bank More)",
        category: "Delivery",
        payRate: 450,
        payType: "daily",
        urgency: "immediate",
        location: "Bank More, Dhanbad",
        description: "Need an active person to assist with small package deliveries around Bank More area. Fuel and vehicle provided. Shift is 10 AM to 6 PM.",
        duration: "1 Day (Immediate)",
        geoCoordinates: { type: "Point", coordinates: [86.4172, 23.7913] },
        employerId: employer._id,
        expiresAt: new Date(Date.now() + 86400000),
      },
      {
        title: "Tuition Teacher (Steel Gate)",
        category: "Tutor",
        payRate: 200,
        payType: "hourly",
        urgency: "normal",
        location: "Steel Gate, Dhanbad",
        description: "Looking for a tutor for Class 8 Math and Science. 1 hour daily, focused on basic concept building. Prefer students from BIT Sindri nearby.",
        duration: "Starting Today (Ongoing)",
        geoCoordinates: { type: "Point", coordinates: [86.4521, 23.8124] },
        employerId: employer._id,
        expiresAt: new Date(Date.now() + 30 * 86400000),
      },
      {
        title: "Wedding Event Helper",
        category: "Event Helper",
        payRate: 600,
        payType: "daily",
        urgency: "24h",
        location: "Saraidhela, Dhanbad",
        description: "Helpers needed for a luxury wedding event at Saraidhela. Tasks include managing guest entry and general logistics support. Professional attire required.",
        duration: "2 Days (Wedding Weekend)",
        geoCoordinates: { type: "Point", coordinates: [86.4402, 23.8055] },
        employerId: employer._id,
        expiresAt: new Date(Date.now() + 2 * 86400000),
      },
      {
        title: "Shop Assistant (City Centre Mall)",
        category: "Other",
        payRate: 350,
        payType: "daily",
        urgency: "normal",
        location: "City Centre Mall, Dhanbad",
        description: "Assisting in a garment store during the festive rush. Friendly attitude and basic counting required. Shift: 11 AM to 8 PM.",
        duration: "1 Week (Part-Time)",
        geoCoordinates: { type: "Point", coordinates: [86.4304, 23.7957] },
        employerId: employer._id,
        expiresAt: new Date(Date.now() + 7 * 86400000),
      },
      {
        title: "Warehouse Loading Support",
        category: "Technician",
        payRate: 500,
        payType: "daily",
        urgency: "immediate",
        location: "Govindpur, Dhanbad",
        description: "Physical loading and unloading of goods at Govindpur godown. Requires stamina. Afternoon shift available.",
        duration: "Fixed 3 days project",
        geoCoordinates: { type: "Point", coordinates: [86.5186, 23.8340] },
        employerId: employer._id,
        expiresAt: new Date(Date.now() + 24 * 3600 * 1000),
      }
    ];

    // Clear old seeded jobs if needed (optional)
    // await Job.deleteMany({ employerId: employer._id });

    const result = await Job.insertMany(seedJobs);
    console.log(`${result.length} jobs successfully seeded for Dhanbad!`);

  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.connection.close();
  }
}

run();
