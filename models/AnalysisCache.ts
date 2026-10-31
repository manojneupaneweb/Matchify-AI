import mongoose from 'mongoose';

const HOUR_SECONDS = 60 * 60;

const AnalysisCacheSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: { type: mongoose.Schema.Types.Mixed, required: true },
  createdAt: { type: Date, default: Date.now, expires: HOUR_SECONDS },
});

export default mongoose.models.AnalysisCache || mongoose.model('AnalysisCache', AnalysisCacheSchema);
