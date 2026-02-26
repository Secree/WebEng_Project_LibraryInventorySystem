import mongoose from 'mongoose';

const resourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  author: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['book', 'journal', 'magazine', 'digital', 'other'],
    default: 'book'
  },
  isbn: {
    type: String,
    trim: true
  },
  publisher: {
    type: String,
    trim: true
  },
  yearPublished: {
    type: Number
  },
  quantity: {
    type: Number,
    required: true,
    min: 0,
    default: 1
  },
  availableQuantity: {
    type: Number,
    required: true,
    min: 0,
    default: 1
  },
  location: {
    type: String,
    trim: true
  },
  description: {
    type: String
  },
  imageUrl: {
    type: String
  },
  status: {
    type: String,
    enum: ['available', 'unavailable', 'reserved'],
    default: 'available'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp on save
resourceSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for search
resourceSchema.index({ title: 'text', author: 'text', category: 'text' });

export default mongoose.model('Resource', resourceSchema);
