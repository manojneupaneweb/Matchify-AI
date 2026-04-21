import mongoose from 'mongoose';

const StatsSchema = new mongoose.Schema({
  totalUsers: {
    type: Number,
    default: 0,
  },
  totalAnalyses: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

export default mongoose.models.Stats || mongoose.model('Stats', StatsSchema);
