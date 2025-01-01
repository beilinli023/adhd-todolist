import mongoose, { Schema, Document } from 'mongoose';

export interface ITask extends Document {
  title: string;
  description?: string;
  dueDate?: Date;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed' | 'archived';
  user: mongoose.Types.ObjectId;
  order: number;
  tags?: string[];
  category?: string;
  createdAt: Date;
  updatedAt: Date;
}

const taskSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  dueDate: {
    type: Date
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'archived'],
    default: 'pending'
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  order: {
    type: Number,
    required: true,
    default: 0
  },
  tags: [{
    type: String,
    trim: true
  }],
  category: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// 添加索引以优化排序查询
taskSchema.index({ user: 1, order: 1 });
taskSchema.index({ user: 1, category: 1 }); // 添加分类索引
taskSchema.index({ user: 1, tags: 1 }); // 添加标签索引

export default mongoose.model<ITask>('Task', taskSchema); 