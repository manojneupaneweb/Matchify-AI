import mongoose from 'mongoose';

const ResultSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true,
  },
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
  },
  matchedSkills: [String],
  missingSkills: [String],
  rewrites: [{ before: String, after: String, reason: String }],
  rewrittenSummary: { type: String, default: '' },
  improvedScore: { type: Number, default: null },
  model: { type: String, default: '' },
  usage: {
    promptTokens: { type: Number, default: 0 },
    completionTokens: { type: Number, default: 0 },
    totalTokens: { type: Number, default: 0 },
  },
  steps: [{
    name: String,
    model: String,
    latencyMs: Number,
    promptTokens: Number,
    completionTokens: Number,
  }],
}, { timestamps: true });

ResultSchema.index({ userId: 1, createdAt: -1 });
ResultSchema.index({ userEmail: 1, createdAt: -1 });

export default mongoose.models.Result || mongoose.model('Result', ResultSchema);
