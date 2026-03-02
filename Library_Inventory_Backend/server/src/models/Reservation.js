import mongoose from 'mongoose';

const MAX_RESERVATION_WINDOW_DAYS = 30;
const MAX_BORROW_DURATION_DAYS = 14;

const getStartOfDay = (date) => {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
};

const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const reservationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  resourceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resource',
    required: true
  },
  userEmail: {
    type: String,
    required: true
  },
  resourceTitle: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'returned', 'cancelled'],
    default: 'pending'
  },
  reservationDate: {
    type: Date,
    default: Date.now,
    validate: {
      validator(value) {
        if (!value) return false;

        const selectedDate = getStartOfDay(value);
        const today = getStartOfDay(new Date());
        const maxAllowedDate = addDays(today, MAX_RESERVATION_WINDOW_DAYS);

        return selectedDate >= today && selectedDate <= maxAllowedDate;
      },
      message: `Borrow date must be from today up to ${MAX_RESERVATION_WINDOW_DAYS} days ahead.`
    }
  },
  dueDate: {
    type: Date,
    required: true,
    validate: {
      validator(value) {
        if (!value || !this.reservationDate) return false;

        const borrowDate = getStartOfDay(this.reservationDate);
        const dueDate = getStartOfDay(value);
        const maxDueDate = addDays(borrowDate, MAX_BORROW_DURATION_DAYS);

        return dueDate > borrowDate && dueDate <= maxDueDate;
      },
      message: `Due date must be after borrow date and within ${MAX_BORROW_DURATION_DAYS} days.`
    }
  },
  returnDate: {
    type: Date
  },
  notes: {
    type: String
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
reservationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('Reservation', reservationSchema);
