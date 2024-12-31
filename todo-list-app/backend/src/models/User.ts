import { Schema, model, Document } from 'mongoose';

export interface IUser extends Document {
  _id: Schema.Types.ObjectId;
  email: string;
  password: string;
  name: string;
  avatar?: string;
  preferences: {
    theme: 'light' | 'dark';
    notifications: boolean;
    language: string;
  };
  lastLogin?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, '邮箱是必需的'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, '请输入有效的邮箱地址'],
    },
    password: {
      type: String,
      required: [true, '密码是必需的'],
      minlength: [6, '密码至少需要6个字符'],
    },
    name: {
      type: String,
      required: [true, '用户名是必需的'],
      trim: true,
      minlength: [2, '用户名至少需要2个字符'],
      maxlength: [50, '用户名不能超过50个字符'],
    },
    avatar: {
      type: String,
      default: null,
    },
    preferences: {
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
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_, ret) => {
        delete ret.password;
        return ret;
      },
    },
  }
);

// 索引
userSchema.index({ email: 1 });

export const User = model<IUser>('User', userSchema); 