import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IJob extends Document {
  employerId: mongoose.Schema.Types.ObjectId | string;
  title: string;
  category: string;
  payPerHour?: number;
  payPerDay?: number;
  duration: string;
  location: string; // Human readable location string
  geoCoordinates?: { type: string; coordinates: number[] }; // Geospatial point
  description: string;
  urgency?: 'normal' | '24h' | 'immediate';
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const JobSchema: Schema<IJob> = new Schema({
  employerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  category: { type: String, required: true },
  payPerHour: { type: Number },
  payPerDay: { type: Number },
  duration: { type: String, required: true },
  location: { type: String, required: true },
  geoCoordinates: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] } // [longitude, latitude]
  },
  description: { type: String, required: true },
  urgency: { type: String, enum: ['normal', '24h', 'immediate'], default: 'normal' },
  expiresAt: { type: Date, required: true }
}, { timestamps: true });

// Geospatial and Expiry Indexes
JobSchema.index({ geoCoordinates: '2dsphere' });
JobSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Job: Model<IJob> = mongoose.models.Job || mongoose.model<IJob>('Job', JobSchema);

export default Job;
