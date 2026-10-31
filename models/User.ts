import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: false,
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user',
  },
  name: {
    type: String,
    default: '',
  },
  phone: {
    type: String,
    default: '',
  },
  address: {
    type: String,
    default: '',
  },
  profilePic: {
    type: String,
    default: '',
  },
  lastLoginAt: {
    type: Date,
    default: null,
  },
  tokenVersion: {
    type: Number,
    default: 0,
  }
}, { timestamps: true });



export default mongoose.models.User || mongoose.model('User', UserSchema);
