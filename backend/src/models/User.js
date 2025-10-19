const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: true,
    enum: ['student', 'teacher', 'admin', 'hod', 'dean'],
    default: 'student'
  },
  phoneNumber: {
    type: String,
    trim: true
  },
  department: {
    type: String,
    trim: true
  },
  profilePicture: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  // Class-related fields for students
  enrolledClasses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LiveClass'
  }],
  // Class-related fields for teachers
  teachingClasses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LiveClass'
  }],
  // Statistics
  stats: {
    totalClassesAttended: {
      type: Number,
      default: 0
    },
    totalClassesTaught: {
      type: Number,
      default: 0
    },
    totalHoursInClass: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Indexes for performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ createdAt: -1 });

// Virtual for user's full profile
userSchema.virtual('profile').get(function() {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
    phoneNumber: this.phoneNumber,
    department: this.department,
    profilePicture: this.profilePicture,
    isActive: this.isActive,
    lastLogin: this.lastLogin,
    stats: this.stats
  };
});

// Method to check if user is teacher
userSchema.methods.isTeacher = function() {
  return ['teacher', 'hod', 'dean', 'admin'].includes(this.role);
};

// Method to check if user is student
userSchema.methods.isStudent = function() {
  return this.role === 'student';
};

const User = mongoose.model('User', userSchema);

module.exports = User;
