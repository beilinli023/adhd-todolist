import { Schema, model, Document, Types } from 'mongoose';
import { IUser } from './User';

export interface ITask extends Document {
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate?: Date;
  tags: string[];
  user: Types.ObjectId | IUser;
  category?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'archived';
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const taskSchema = new Schema<ITask>(
  {
    title: {
      type: String,
      required: [true, '任务标题是必需的'],
      trim: true,
      minlength: [1, '标题不能为空'],
      maxlength: [200, '标题不能超过200个字符'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, '描述不能超过1000个字符'],
    },
    completed: {
      type: Boolean,
      default: false,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    dueDate: {
      type: Date,
      validate: {
        validator: function(value: Date) {
          return !value || value > new Date();
        },
        message: '截止日期必须是将来的时间',
      },
    },
    tags: [{
      type: String,
      trim: true,
    }],
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, '任务必须关联用户'],
    },
    category: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed', 'archived'],
      default: 'pending',
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// 索引
taskSchema.index({ user: 1, status: 1 });
taskSchema.index({ dueDate: 1 }, { sparse: true });
taskSchema.index({ tags: 1 });

// 中间件
taskSchema.pre('save', function(next) {
  if (this.isModified('completed') && this.completed) {
    this.completedAt = new Date();
    this.status = 'completed';
  }
  next();
});

export const Task = model<ITask>('Task', taskSchema); 