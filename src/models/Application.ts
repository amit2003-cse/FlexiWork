import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IApplication extends Document {
  jobId: mongoose.Schema.Types.ObjectId | string;
  employeeId: mongoose.Schema.Types.ObjectId | string;
  employerId: mongoose.Schema.Types.ObjectId | string; // Denormalized for dashboard speed
  status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'no_show';
  appliedAt: Date;
}

const ApplicationSchema: Schema<IApplication> = new Schema({
  jobId: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
  employeeId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  employerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'accepted', 'rejected', 'completed', 'no_show'], default: 'pending' },
  appliedAt: { type: Date, default: Date.now },
});

// Strictly prevent duplicate applications
ApplicationSchema.index({ jobId: 1, employeeId: 1 }, { unique: true });

const Application: Model<IApplication> = mongoose.models.Application || mongoose.model<IApplication>('Application', ApplicationSchema);

export default Application;
