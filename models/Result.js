import mongoose from 'mongoose';

const ResultSchema = new mongoose.Schema({
  userEmail: {
    type: String,
    required: true,
  },
  resumeName: {
    type: String,
    default: 'Resume.pdf'
  },
  jobDescription: {
    type: String,
    default: ''
  },
  score: {
    type: Number,
    required: true,
  },
  funnyMessage: {
    type: String,
  },
  strengths: [String],
  weaknesses: [String],
  suggestions: [String],
  missingKeywords: [String],
  charts: {
    skillsMatch: {
      'Technical Skills': { type: Number, default: 0 },
      'Soft Skills': { type: Number, default: 0 },
      'Experience': { type: Number, default: 0 },
      'Education': { type: Number, default: 0 },
      'Domain Knowledge': { type: Number, default: 0 }
    },
    keywordCoverage: {
      Matched: { type: Number, default: 0 },
      Missing: { type: Number, default: 0 }
    }
  }
}, { timestamps: true });

export default mongoose.models.Result || mongoose.model('Result', ResultSchema);
