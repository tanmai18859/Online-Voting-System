const mongoose = require('mongoose');

const electionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Election title is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  status: {
    type: String,
    enum: ['upcoming', 'active', 'ended'],
    default: 'upcoming'
  }
}, {
  timestamps: true
});

// Pre-save validation to auto-set status based on current time if not overridden
electionSchema.pre('save', function (next) {
  const now = new Date();
  if (this.startDate > now) {
    this.status = 'upcoming';
  } else if (this.endDate < now) {
    this.status = 'ended';
  } else {
    this.status = 'active';
  }
  next();
});

module.exports = mongoose.model('Election', electionSchema);
