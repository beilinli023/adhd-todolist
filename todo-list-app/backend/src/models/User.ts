import mongoose from 'mongoose';
import { IUser, BaseUserPreferences } from '../types/user';

const userPreferencesSchema = new mongoose.Schema<BaseUserPreferences>({
  theme: {
    type: String,
    enum: ['light', 'dark'],
    default: 'light',
  },
  notifications: {
    type: Boolean,
    default: true,
  },
  language: {
    type: String,
    default: 'zh-CN',
  },
}, { _id: false });

const userSchema = new mongoose.Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    preferences: {
      type: userPreferencesSchema,
      default: () => ({
        theme: 'light',
        notifications: true,
        language: 'zh-CN',
      }),
    },
    lastLogin: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.model<IUser>('User', userSchema); 