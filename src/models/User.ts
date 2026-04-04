import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  image?: string;
  role?: 'employer' | 'employee'; // Maintained as "Active Role"
  contact?: string; // Sticking to existing 'contact' string for phone backwards compatibility
  skills?: string[];
  resume?: string;
  
  // Trust System & Gig Metrics
  isVerified?: boolean;
  rating?: number;
  jobsCompleted?: number;
  noShows?: number; // Penalty counter for ghosting employers
  
  createdAt: Date;
}

const UserSchema: Schema<IUser> = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  image: { type: String },
  role: { type: String, enum: ['employer', 'employee'] },
  contact: { type: String },
  skills: { type: [String], default: [] },
  resume: { type: String },
  
  // Trust System & Gig Metrics Setup
  isVerified: { type: Boolean, default: false },
  rating: { type: Number, default: 0 },
  jobsCompleted: { type: Number, default: 0 },
  noShows: { type: Number, default: 0 },

  createdAt: { type: Date, default: Date.now },
});

// Avoid OverwriteModelError in Next.js hot-reloading
const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
