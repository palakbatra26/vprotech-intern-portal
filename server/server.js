import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import ExcelJS from 'exceljs';
import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const app = express();
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:8080'],
  credentials: true
}));
app.use(express.json());

// MongoDB Connection
const mongoUrl = process.env.MONGODB_URL || 'mongodb+srv://palakbatra79_vprohiring:vprohiring@cluster0.7il53yg.mongodb.net/';
const dbName = process.env.DB_NAME || 'vprohiring';

mongoose.connect(`${mongoUrl}${dbName}`)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'vprotechdigital_secret_key_2024';

// ==================== MONGODB MODELS ====================

// User Schema
const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  collegeName: { type: String, required: true },
  crn: { type: String, required: true },
  urn: { type: String, required: true },
  course: { type: String, required: true },
  semester: { type: String, required: true },
  city: { type: String, required: true },
  applicationId: { type: String, unique: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
const User = mongoose.model('User', userSchema);

// Exam Request Schema
const examRequestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  requestedDomain: { type: String, required: true },
  requestStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  requestedAt: { type: Date, default: Date.now },
  approvedAt: { type: Date },
  rejectedAt: { type: Date },
  rejectionReason: { type: String },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  examAvailableAt: { type: Date }
});
const ExamRequest = mongoose.model('ExamRequest', examRequestSchema);

// Question Schema
const questionSchema = new mongoose.Schema({
  categoryType: { type: String, enum: ['aptitude', 'technical'], required: true },
  domain: { type: String, required: true },
  questionText: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: String, required: true },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  marks: { type: Number, default: 1 },
  createdAt: { type: Date, default: Date.now }
});
const Question = mongoose.model('Question', questionSchema);

// Exam Attempt Schema
const examAttemptSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  requestId: { type: mongoose.Schema.Types.ObjectId, ref: 'ExamRequest' },
  domain: { type: String, required: true },
  attemptNumber: { type: Number, default: 1 },
  questionsShown: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
  selectedAnswers: { type: Map, of: String },
  aptitudeScore: { type: Number, default: 0 },
  technicalScore: { type: Number, default: 0 },
  totalScore: { type: Number, default: 0 },
  totalMarks: { type: Number, default: 30 },
  correctCount: { type: Number, default: 0 },
  wrongCount: { type: Number, default: 0 },
  status: { type: String, enum: ['in_progress', 'completed', 'disqualified'], default: 'in_progress' },
  startedAt: { type: Date },
  submittedAt: { type: Date },
  violationsCount: { type: Number, default: 0 },
  disqualified: { type: Boolean, default: false },
  disqualifiedReason: { type: String },
  approvedAt: { type: Date },
  examAvailableAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});
const ExamAttempt = mongoose.model('ExamAttempt', examAttemptSchema);

// Violation Log Schema
const violationLogSchema = new mongoose.Schema({
  attemptId: { type: mongoose.Schema.Types.ObjectId, ref: 'ExamAttempt', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, required: true },
  details: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});
const ViolationLog = mongoose.model('ViolationLog', violationLogSchema);

// Cutoff Schema
const cutoffSchema = new mongoose.Schema({
  domain: { type: String, required: true, unique: true },
  aptitudeCutoff: { type: Number, default: 4 },
  technicalCutoff: { type: Number, default: 10 },
  overallCutoff: { type: Number, default: 14 },
  violationThreshold: { type: Number, default: 3 },
  approvalWaitMinutes: { type: Number, default: 5 },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedAt: { type: Date, default: Date.now }
});
const Cutoff = mongoose.model('Cutoff', cutoffSchema);

// Password Reset Schema
const passwordResetSchema = new mongoose.Schema({
  email: { type: String, required: true },
  token: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now }
});
const PasswordReset = mongoose.model('PasswordReset', passwordResetSchema);

// Audit Log Schema
const auditLogSchema = new mongoose.Schema({
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, required: true },
  targetType: { type: String },
  targetId: { type: String },
  details: { type: String },
  timestamp: { type: Date, default: Date.now }
});
const AuditLog = mongoose.model('AuditLog', auditLogSchema);

// Exam Timing Configuration Schema
const examTimingConfigSchema = new mongoose.Schema({
  defaultWaitMinutes: { type: Number, default: 5 },
  defaultDurationMinutes: { type: Number, default: 30 },
  globalExamStartTime: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
const ExamTimingConfig = mongoose.model('ExamTimingConfig', examTimingConfigSchema);

// ==================== MIDDLEWARE ====================

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

const requireAdmin = async (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

// ==================== HELPER FUNCTIONS ====================

function generateApplicationId() {
  const prefix = 'VPRO';
  const random = Math.floor(100000 + Math.random() * 900000);
  return `${prefix}${random}`;
}

function getExamAvailableTime(approvedAt, waitMinutes = 5) {
  return new Date(approvedAt.getTime() + waitMinutes * 60 * 1000);
}

// ==================== EXAM TIMING CONFIG ROUTES ====================

// Get exam timing configuration
app.get('/api/admin/exam-timing', authenticate, requireAdmin, async (req, res) => {
  try {
    let config = await ExamTimingConfig.findOne();
    if (!config) {
      config = new ExamTimingConfig({
        defaultWaitMinutes: 5,
        defaultDurationMinutes: 30
      });
      await config.save();
    }
    res.json(config);
  } catch (error) {
    console.error('Get exam timing error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update exam timing configuration
app.put('/api/admin/exam-timing', authenticate, requireAdmin, async (req, res) => {
  try {
    const { defaultWaitMinutes, defaultDurationMinutes, globalExamStartTime } = req.body;
    
    let config = await ExamTimingConfig.findOne();
    if (!config) {
      config = new ExamTimingConfig();
    }
    
    if (defaultWaitMinutes !== undefined) config.defaultWaitMinutes = defaultWaitMinutes;
    if (defaultDurationMinutes !== undefined) config.defaultDurationMinutes = defaultDurationMinutes;
    if (globalExamStartTime !== undefined) config.globalExamStartTime = globalExamStartTime;
    
    await config.save();
    
    res.json({ message: 'Exam timing updated', config });
  } catch (error) {
    console.error('Update exam timing error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Set exam start time for all pending/approved users (bulk)
app.post('/api/admin/exam/bulk-schedule', authenticate, requireAdmin, async (req, res) => {
  try {
    const { examAvailableAt } = req.body;
    const examTime = new Date(examAvailableAt);
    
    if (isNaN(examTime.getTime())) {
      return res.status(400).json({ message: 'Invalid date format' });
    }
    
    const result = await ExamRequest.updateMany(
      { requestStatus: { $in: ['pending', 'approved'] } },
      { 
        $set: { 
          examAvailableAt: examTime,
          requestStatus: 'approved',
          approvedAt: new Date(),
          approvedBy: req.user._id
        }
      }
    );
    
    res.json({ 
      message: `Scheduled exam for ${result.modifiedCount} users`,
      updatedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Bulk schedule error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Set exam start time for individual user
app.put('/api/admin/requests/:requestId/schedule', authenticate, requireAdmin, async (req, res) => {
  try {
    const { requestId } = req.params;
    const { examAvailableAt } = req.body;
    const examTime = new Date(examAvailableAt);
    
    if (isNaN(examTime.getTime())) {
      return res.status(400).json({ message: 'Invalid date format' });
    }
    
    const examRequest = await ExamRequest.findById(requestId);
    if (!examRequest) {
      return res.status(404).json({ message: 'Request not found' });
    }
    
    examRequest.examAvailableAt = examTime;
    examRequest.requestStatus = 'approved';
    examRequest.approvedAt = examRequest.approvedAt || new Date();
    examRequest.approvedBy = req.user._id;
    
    await examRequest.save();
    
    res.json({ message: 'Exam scheduled', request: examRequest });
  } catch (error) {
    console.error('Schedule error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const transporter = nodemailer.createTransport({
  host: 'smtp.resend.com',
  port: 587,
  secure: false,
  auth: {
    user: 'resend',
    pass: process.env.RESEND_API_KEY
  }
});

async function sendEmail(to, subject, html) {
  try {
    await transporter.sendMail({
      from: 'VproTechDigital <onboarding@resend.dev>',
      to,
      subject,
      html
    });
    return true;
  } catch (error) {
    console.error('Email error:', error);
    return false;
  }
}

// ==================== AUTH ROUTES ====================

app.post('/api/auth/register', async (req, res) => {
  try {
    const registerSchema = z.object({
      fullName: z.string().min(2).max(100),
      email: z.string().email(),
      password: z.string().min(6).max(72),
      phone: z.string().min(10).max(15),
      collegeName: z.string().min(2).max(200),
      crn: z.string().min(1).max(50),
      urn: z.string().min(1).max(50),
      course: z.string().min(2).max(100),
      semester: z.string().min(1).max(20),
      city: z.string().min(2).max(100)
    });

    const data = registerSchema.parse(req.body);

    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    let applicationId = generateApplicationId();
    while (await User.findOne({ applicationId })) {
      applicationId = generateApplicationId();
    }

    const user = new User({
      ...data,
      password: hashedPassword,
      applicationId
    });

    await user.save();

    res.status(201).json({ 
      message: 'Registration successful',
      userId: user._id,
      applicationId: user.applicationId
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.errors[0].message });
    }
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const loginSchema = z.object({
      email: z.string().email(),
      password: z.string().min(1)
    });

    const { email, password } = loginSchema.parse(req.body);

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        collegeName: user.collegeName,
        crn: user.crn,
        urn: user.urn,
        course: user.course,
        semester: user.semester,
        city: user.city,
        applicationId: user.applicationId,
        role: user.role
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.errors[0].message });
    }
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(200).json({ message: 'If an account exists, a reset link will be sent' });
    }

    await PasswordReset.deleteMany({ email });

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 3600000);

    await PasswordReset.create({ email, token, expiresAt });

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${token}`;
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Password Reset Request</h2>
        <p>You requested a password reset for your VproTechDigital account.</p>
        <a href="${resetUrl}" style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">Reset Password</a>
        <p style="word-break: break-all; color: #666;">${resetUrl}</p>
        <p style="color: #666; font-size: 12px; margin-top: 20px;">This link will expire in 1 hour.</p>
      </div>
    `;

    await sendEmail(email, 'Password Reset Request', emailHtml);

    res.status(200).json({ message: 'Password reset link sent to your email' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Token and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const resetRecord = await PasswordReset.findOne({
      token,
      expiresAt: { $gt: new Date() }
    });

    if (!resetRecord) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    const user = await User.findOne({ email: resetRecord.email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    await PasswordReset.deleteOne({ token });

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/auth/me', authenticate, async (req, res) => {
  res.json({ user: req.user });
});

// ==================== USER PROFILE ROUTES ====================

app.get('/api/users/profile', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    const examRequests = await ExamRequest.find({ userId: req.user._id })
      .sort({ requestedAt: -1 });
    
    const attempts = await ExamAttempt.find({ userId: req.user._id })
      .sort({ createdAt: -1 });

    const latestAttempt = attempts[0];

    res.json({
      user,
      examRequests,
      attempts,
      latestAttempt
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/users/profile', authenticate, async (req, res) => {
  try {
    const updateSchema = z.object({
      fullName: z.string().min(2).max(100).optional(),
      phone: z.string().min(10).max(15).optional(),
      collegeName: z.string().min(2).max(200).optional(),
      crn: z.string().min(1).max(50).optional(),
      urn: z.string().min(1).max(50).optional(),
      course: z.string().min(2).max(100).optional(),
      semester: z.string().min(1).max(20).optional(),
      city: z.string().min(2).max(100).optional()
    });

    const data = updateSchema.parse(req.body);

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { ...data, updatedAt: Date.now() },
      { new: true }
    ).select('-password');

    res.json({ user });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.errors[0].message });
    }
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================== EXAM REQUEST ROUTES ====================

app.post('/api/exam/request', authenticate, async (req, res) => {
  try {
    const { domain } = req.body;

    if (!domain) {
      return res.status(400).json({ message: 'Domain is required' });
    }

    const pendingRequest = await ExamRequest.findOne({
      userId: req.user._id,
      requestStatus: 'pending'
    });

    if (pendingRequest) {
      return res.status(400).json({ message: 'You already have a pending request' });
    }

    const approvedRequest = await ExamRequest.findOne({
      userId: req.user._id,
      requestStatus: 'approved',
      examAvailableAt: { $gt: new Date() }
    });

    if (approvedRequest) {
      return res.status(400).json({ message: 'You already have an approved request. Please start your exam.' });
    }

    const examRequest = new ExamRequest({
      userId: req.user._id,
      requestedDomain: domain
    });

    await examRequest.save();

    res.status(201).json({
      message: 'Exam request submitted successfully. Please wait for admin approval.',
      request: examRequest
    });
  } catch (error) {
    console.error('Exam request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/exam/status', authenticate, async (req, res) => {
  try {
    const latestRequest = await ExamRequest.findOne({ userId: req.user._id })
      .sort({ requestedAt: -1 });

    const latestAttempt = await ExamAttempt.findOne({ userId: req.user._id })
      .sort({ createdAt: -1 });

    const allAttempts = await ExamAttempt.find({ userId: req.user._id })
      .sort({ createdAt: -1 });

    let examAvailable = false;
    let canStartExam = false;
    let waitingTimeLeft = 0;

    if (latestRequest && latestRequest.requestStatus === 'approved') {
      const now = new Date();
      if (latestRequest.examAvailableAt) {
        if (latestRequest.examAvailableAt > now) {
          waitingTimeLeft = Math.ceil((latestRequest.examAvailableAt.getTime() - now.getTime()) / 1000);
          examAvailable = false;
        } else {
          examAvailable = true;
          const inProgressAttempt = await ExamAttempt.findOne({
            userId: req.user._id,
            requestId: latestRequest._id,
            status: 'in_progress'
          });
          canStartExam = !inProgressAttempt;
        }
      } else {
        const cutoff = await Cutoff.findOne({ domain: latestRequest.requestedDomain });
        const waitMinutes = cutoff?.approvalWaitMinutes || 5;
        const examAvailableAt = getExamAvailableTime(latestRequest.approvedAt, waitMinutes);
        
        if (examAvailableAt > now) {
          waitingTimeLeft = Math.ceil((examAvailableAt.getTime() - now.getTime()) / 1000);
          examAvailable = false;
        } else {
          examAvailable = true;
          canStartExam = true;
        }
      }
    }

    res.json({
      latestRequest,
      latestAttempt,
      allAttempts,
      examAvailable,
      canStartExam,
      waitingTimeLeft
    });
  } catch (error) {
    console.error('Exam status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/exam/questions/:requestId', authenticate, async (req, res) => {
  try {
    const { requestId } = req.params;

    const examRequest = await ExamRequest.findById(requestId);
    if (!examRequest) {
      return res.status(404).json({ message: 'Exam request not found' });
    }

    if (examRequest.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    if (examRequest.requestStatus !== 'approved') {
      return res.status(400).json({ message: 'Exam not approved' });
    }

    const now = new Date();
    const examAvailableAt = examRequest.examAvailableAt || getExamAvailableTime(examRequest.approvedAt);
    
    if (now < examAvailableAt) {
      return res.status(400).json({ message: 'Exam is not yet available. Please wait.' });
    }

    const aptitudeQuestions = await Question.aggregate([
      { $match: { categoryType: 'aptitude' } },
      { $sample: { size: 10 } }
    ]);

    const technicalQuestions = await Question.aggregate([
      { $match: { categoryType: 'technical', domain: examRequest.requestedDomain } },
      { $sample: { size: 20 } }
    ]);

    if (aptitudeQuestions.length < 10 || technicalQuestions.length < 20) {
      return res.status(400).json({ message: 'Not enough questions available for this domain' });
    }

    const allQuestions = shuffleArray([...aptitudeQuestions, ...technicalQuestions]);
    
    const questionsWithShuffledOptions = allQuestions.map(q => ({
      ...q,
      options: shuffleArray(q.options)
    }));

    const attemptNumber = await ExamAttempt.countDocuments({ userId: req.user._id, requestId: examRequest._id }) + 1;

    const attempt = new ExamAttempt({
      userId: req.user._id,
      requestId: examRequest._id,
      domain: examRequest.requestedDomain,
      attemptNumber,
      questionsShown: questionsWithShuffledOptions.map(q => q._id),
      selectedAnswers: new Map(),
      startedAt: new Date(),
      approvedAt: examRequest.approvedAt,
      examAvailableAt
    });

    await attempt.save();

    const questionsToSend = questionsWithShuffledOptions.map(q => ({
      _id: q._id,
      questionText: q.questionText,
      options: q.options,
      categoryType: q.categoryType
    }));

    res.json({
      attemptId: attempt._id,
      domain: examRequest.requestedDomain,
      totalQuestions: questionsToSend.length,
      duration: 30,
      questions: questionsToSend
    });
  } catch (error) {
    console.error('Get questions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/exam/answer', authenticate, async (req, res) => {
  try {
    const { attemptId, questionId, answer } = req.body;

    const attempt = await ExamAttempt.findById(attemptId);
    if (!attempt) {
      return res.status(404).json({ message: 'Attempt not found' });
    }

    if (attempt.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    if (attempt.status !== 'in_progress') {
      return res.status(400).json({ message: 'Exam already submitted' });
    }

    attempt.selectedAnswers.set(questionId, answer);
    await attempt.save();

    res.json({ message: 'Answer saved' });
  } catch (error) {
    console.error('Save answer error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/exam/submit', authenticate, async (req, res) => {
  try {
    const { attemptId } = req.body;

    const attempt = await ExamAttempt.findById(attemptId);
    if (!attempt) {
      return res.status(404).json({ message: 'Attempt not found' });
    }

    if (attempt.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    if (attempt.status !== 'in_progress') {
      return res.status(400).json({ message: 'Exam already submitted' });
    }

    const questions = await Question.find({ _id: { $in: attempt.questionsShown } });

    let aptitudeCorrect = 0;
    let technicalCorrect = 0;
    let correctCount = 0;
    let wrongCount = 0;

    const answers = attempt.selectedAnswers;

    for (const question of questions) {
      const selectedAnswer = answers.get(question._id.toString());
      if (selectedAnswer) {
        if (selectedAnswer === question.correctAnswer) {
          correctCount++;
          if (question.categoryType === 'aptitude') {
            aptitudeCorrect++;
          } else {
            technicalCorrect++;
          }
        } else {
          wrongCount++;
        }
      }
    }

    const totalScore = correctCount;
    const aptitudeScore = aptitudeCorrect;
    const technicalScore = technicalCorrect;

    const cutoff = await Cutoff.findOne({ domain: attempt.domain });
    let status = 'not_qualified';
    
    if (attempt.disqualified) {
      status = 'disqualified';
    } else if (cutoff) {
      if (totalScore >= cutoff.overallCutoff) {
        status = 'qualified';
      }
    } else if (totalScore >= 14) {
      status = 'qualified';
    }

    attempt.aptitudeScore = aptitudeScore;
    attempt.technicalScore = technicalScore;
    attempt.totalScore = totalScore;
    attempt.correctCount = correctCount;
    attempt.wrongCount = wrongCount;
    attempt.status = 'completed';
    attempt.submittedAt = new Date();

    await attempt.save();

    res.json({
      message: 'Exam submitted successfully',
      result: {
        attemptId: attempt._id,
        domain: attempt.domain,
        attemptNumber: attempt.attemptNumber,
        aptitudeScore,
        technicalScore,
        totalScore,
        totalMarks: attempt.totalMarks,
        correctCount,
        wrongCount,
        status
      }
    });
  } catch (error) {
    console.error('Submit exam error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/exam/violation', authenticate, async (req, res) => {
  try {
    const { attemptId, type, details } = req.body;

    const attempt = await ExamAttempt.findById(attemptId);
    if (!attempt) {
      return res.status(404).json({ message: 'Attempt not found' });
    }

    if (attempt.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await ViolationLog.create({
      attemptId: attempt._id,
      userId: req.user._id,
      type,
      details
    });

    attempt.violationsCount += 1;
    await attempt.save();

    const cutoff = await Cutoff.findOne({ domain: attempt.domain });
    const threshold = cutoff?.violationThreshold || 3;

    if (attempt.violationsCount >= threshold) {
      attempt.disqualified = true;
      attempt.disqualifiedReason = `Exceeded ${threshold} violations`;
      attempt.status = 'disqualified';
      await attempt.save();
      
      return res.json({
        disqualified: true,
        message: 'You have been disqualified due to multiple violations'
      });
    }

    res.json({
      violationsCount: attempt.violationsCount,
      threshold,
      message: `Warning: ${attempt.violationsCount}/${threshold} violations`
    });
  } catch (error) {
    console.error('Violation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/exam/result/:attemptId', authenticate, async (req, res) => {
  try {
    const { attemptId } = req.params;

    const attempt = await ExamAttempt.findById(attemptId);
    if (!attempt) {
      return res.status(404).json({ message: 'Attempt not found' });
    }

    if (attempt.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const questions = await Question.find({ _id: { $in: attempt.questionsShown } });

    const questionDetails = questions.map(q => ({
      _id: q._id,
      questionText: q.questionText,
      categoryType: q.categoryType,
      options: q.options,
      correctAnswer: q.correctAnswer,
      selectedAnswer: attempt.selectedAnswers.get(q._id.toString())
    }));

    res.json({
      attempt: {
        ...attempt.toObject(),
        selectedAnswers: undefined
      },
      questionDetails
    });
  } catch (error) {
    console.error('Get result error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================== ADMIN ROUTES ====================

app.post('/api/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (email === adminEmail && password === adminPassword) {
      let adminUser = await User.findOne({ email, role: 'admin' });
      
      if (!adminUser) {
        // Check if user exists with different role
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          // Update existing user to admin role
          existingUser.role = 'admin';
          existingUser.applicationId = 'ADMIN001';
          await existingUser.save();
          adminUser = existingUser;
        } else {
          const hashedPassword = await bcrypt.hash(password, 10);
          adminUser = new User({
            fullName: 'Admin',
            email,
            password: hashedPassword,
            phone: '0000000000',
            collegeName: 'N/A',
            crn: 'N/A',
            urn: 'N/A',
            course: 'N/A',
            semester: 'N/A',
            city: 'N/A',
            applicationId: 'ADMIN001',
            role: 'admin'
          });
          await adminUser.save();
        }
      }

      const token = jwt.sign(
        { userId: adminUser._id, role: adminUser.role },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      return res.json({
        message: 'Admin login successful',
        token,
        user: {
          id: adminUser._id,
          fullName: adminUser.fullName,
          email: adminUser.email,
          role: adminUser.role
        }
      });
    }

    res.status(401).json({ message: 'Invalid admin credentials' });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/admin/stats', authenticate, requireAdmin, async (req, res) => {
  try {
    const totalCandidates = await User.countDocuments({ role: 'user' });
    const pendingRequests = await ExamRequest.countDocuments({ requestStatus: 'pending' });
    const approvedRequests = await ExamRequest.countDocuments({ requestStatus: 'approved' });
    const rejectedRequests = await ExamRequest.countDocuments({ requestStatus: 'rejected' });

    const activeExams = await ExamAttempt.countDocuments({ status: 'in_progress' });
    const completedExams = await ExamAttempt.countDocuments({ status: 'completed' });

    const qualifiedCandidates = await ExamAttempt.distinct('userId', { status: 'completed', totalScore: { $gte: 14 } });
    const disqualifiedCandidates = await ExamAttempt.countDocuments({ disqualified: true });

    const domainStats = await ExamAttempt.aggregate([
      { $match: { status: 'completed' } },
      { $group: { 
        _id: '$domain', 
        count: { $sum: 1 },
        avgScore: { $avg: '$totalScore' }
      }}
    ]);

    const avgMarks = await ExamAttempt.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, avg: { $avg: '$totalScore' } }}
    ]);

    const recentRequests = await ExamRequest.find()
      .populate('userId', 'fullName email collegeName applicationId')
      .sort({ requestedAt: -1 })
      .limit(10);

    res.json({
      totalCandidates,
      pendingRequests,
      approvedRequests,
      rejectedRequests,
      activeExams,
      completedExams,
      qualifiedCount: qualifiedCandidates.length,
      disqualifiedCount: disqualifiedCandidates,
      domainStats,
      avgMarks: avgMarks[0]?.avg || 0,
      recentRequests
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/admin/requests', authenticate, requireAdmin, async (req, res) => {
  try {
    const { status, domain, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (status) filter.requestStatus = status;
    if (domain) filter.requestedDomain = domain;

    const requests = await ExamRequest.find(filter)
      .populate('userId', 'fullName email phone collegeName crn urn course semester city applicationId')
      .populate('approvedBy', 'fullName')
      .sort({ requestedAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await ExamRequest.countDocuments(filter);

    res.json({
      requests,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Get requests error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/admin/requests/:requestId', authenticate, requireAdmin, async (req, res) => {
  try {
    const { requestId } = req.params;
    const { action, rejectionReason } = req.body;

    const examRequest = await ExamRequest.findById(requestId);
    if (!examRequest) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (action === 'approve') {
      const cutoff = await Cutoff.findOne({ domain: examRequest.requestedDomain });
      const waitMinutes = cutoff?.approvalWaitMinutes || 5;
      
      examRequest.requestStatus = 'approved';
      examRequest.approvedAt = new Date();
      examRequest.approvedBy = req.user._id;
      
      // If examAvailableAt is provided, use it; otherwise calculate from default wait time
      if (req.body.examAvailableAt) {
        examRequest.examAvailableAt = new Date(req.body.examAvailableAt);
      } else {
        examRequest.examAvailableAt = getExamAvailableTime(examRequest.approvedAt, waitMinutes);
      }
      
      await examRequest.save();

      const user = await User.findById(examRequest.userId);
      if (user) {
        const availableAt = examRequest.examAvailableAt;
        const now = new Date();
        const minutesUntilAvailable = Math.ceil((availableAt.getTime() - now.getTime()) / 60000);
        
        const emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Exam Approval Notification</h2>
            <p>Dear ${user.fullName},</p>
            <p>Your exam request for <strong>${examRequest.requestedDomain}</strong> has been approved!</p>
            <p>You can start your exam from: <strong>${availableAt.toLocaleString()}</strong></p>
            ${minutesUntilAvailable > 0 ? `<p>Please wait approximately <strong>${minutesUntilAvailable} minutes</strong> before starting your exam.</p>` : '<p>You can start your exam now!</p>'}
            <p>Please log in to your dashboard to start the exam.</p>
          </div>
        `;
        await sendEmail(user.email, 'Exam Approved - VproTechDigital', emailHtml);
      }

      await AuditLog.create({
        adminId: req.user._id,
        action: 'approve_request',
        targetType: 'ExamRequest',
        targetId: requestId,
        details: `Approved for ${examRequest.requestedDomain}`
      });

      res.json({ message: 'Request approved', request: examRequest });
    } else if (action === 'reject') {
      examRequest.requestStatus = 'rejected';
      examRequest.rejectedAt = new Date();
      examRequest.rejectionReason = rejectionReason || 'Not specified';
      
      await examRequest.save();

      const user = await User.findById(examRequest.userId);
      if (user) {
        const emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Exam Request Status</h2>
            <p>Dear ${user.fullName},</p>
            <p>Your exam request for <strong>${examRequest.requestedDomain}</strong> has been rejected.</p>
            <p>Reason: ${rejectionReason || 'Not specified'}</p>
          </div>
        `;
        await sendEmail(user.email, 'Exam Request Rejected - VproTechDigital', emailHtml);
      }

      await AuditLog.create({
        adminId: req.user._id,
        action: 'reject_request',
        targetType: 'ExamRequest',
        targetId: requestId,
        details: `Rejected: ${rejectionReason}`
      });

      res.json({ message: 'Request rejected', request: examRequest });
    } else {
      res.status(400).json({ message: 'Invalid action' });
    }
  } catch (error) {
    console.error('Update request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/admin/candidates', authenticate, requireAdmin, async (req, res) => {
  try {
    const { college, domain, status, page = 1, limit = 20, sort = 'createdAt', order = 'desc' } = req.query;

    let filter = { role: 'user' };

    if (domain || status) {
      const attemptFilter = {};
      if (domain) attemptFilter.domain = domain;
      if (status) attemptFilter.status = status === 'qualified' ? 'completed' : status;
      
      const userIds = await ExamAttempt.distinct('userId', attemptFilter);
      filter._id = { $in: userIds };
    }

    if (college) {
      filter.collegeName = { $regex: college, $options: 'i' };
    }

    const users = await User.find(filter)
      .sort({ [sort]: order === 'desc' ? -1 : 1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await User.countDocuments(filter);

    const usersWithAttempts = await Promise.all(
      users.map(async (user) => {
        const latestAttempt = await ExamAttempt.findOne({ userId: user._id })
          .sort({ createdAt: -1 });
        const totalAttempts = await ExamAttempt.countDocuments({ userId: user._id });
        
        return {
          ...user.toObject(),
          latestAttempt,
          totalAttempts
        };
      })
    );

    res.json({
      candidates: usersWithAttempts,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Get candidates error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/admin/candidates/:candidateId', authenticate, requireAdmin, async (req, res) => {
  try {
    const { candidateId } = req.params;

    const user = await User.findById(candidateId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Candidate not found' });
    }

    const examRequests = await ExamRequest.find({ userId: candidateId })
      .populate('approvedBy', 'fullName')
      .sort({ requestedAt: -1 });

    const attempts = await ExamAttempt.find({ userId: candidateId })
      .sort({ createdAt: -1 });

    res.json({
      candidate: user,
      examRequests,
      attempts
    });
  } catch (error) {
    console.error('Get candidate error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/admin/results', authenticate, requireAdmin, async (req, res) => {
  try {
    const { domain, status, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (domain) filter.domain = domain;
    if (status === 'qualified') filter.status = 'completed';
    if (status === 'disqualified') filter.disqualified = true;

    const attempts = await ExamAttempt.find(filter)
      .populate('userId', 'fullName email phone collegeName crn urn course semester city applicationId')
      .sort({ submittedAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await ExamAttempt.countDocuments(filter);

    res.json({
      results: attempts,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Get results error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/admin/results/:attemptId', authenticate, requireAdmin, async (req, res) => {
  try {
    const { attemptId } = req.params;

    const attempt = await ExamAttempt.findById(attemptId)
      .populate('userId', 'fullName email phone collegeName crn urn course semester city applicationId');

    if (!attempt) {
      return res.status(404).json({ message: 'Result not found' });
    }

    const questions = await Question.find({ _id: { $in: attempt.questionsShown } });
    const violations = await ViolationLog.find({ attemptId: attempt._id });

    const questionDetails = questions.map(q => ({
      _id: q._id,
      questionText: q.questionText,
      categoryType: q.categoryType,
      domain: q.domain,
      difficulty: q.difficulty,
      options: q.options,
      correctAnswer: q.correctAnswer,
      selectedAnswer: attempt.selectedAnswers.get(q._id.toString())
    }));

    res.json({
      attempt,
      questionDetails,
      violations
    });
  } catch (error) {
    console.error('Get result details error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/admin/candidates/:candidateId', authenticate, requireAdmin, async (req, res) => {
  try {
    const { candidateId } = req.params;

    await ExamRequest.deleteMany({ userId: candidateId });
    await ExamAttempt.deleteMany({ userId: candidateId });
    await ViolationLog.deleteMany({ userId: candidateId });
    await User.findByIdAndDelete(candidateId);

    await AuditLog.create({
      adminId: req.user._id,
      action: 'delete_candidate',
      targetType: 'User',
      targetId: candidateId,
      details: 'Candidate deleted'
    });

    res.json({ message: 'Candidate deleted successfully' });
  } catch (error) {
    console.error('Delete candidate error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================== QUESTION BANK ROUTES ====================

app.get('/api/admin/questions', authenticate, requireAdmin, async (req, res) => {
  try {
    const { categoryType, domain, difficulty, page = 1, limit = 50 } = req.query;

    const filter = {};
    if (categoryType) filter.categoryType = categoryType;
    if (domain) filter.domain = domain;
    if (difficulty) filter.difficulty = difficulty;

    const questions = await Question.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Question.countDocuments(filter);

    res.json({
      questions,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Get questions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/admin/questions', authenticate, requireAdmin, async (req, res) => {
  try {
    const questionSchema = z.object({
      categoryType: z.enum(['aptitude', 'technical']),
      domain: z.string(),
      questionText: z.string().min(10),
      options: z.array(z.string()).length(4),
      correctAnswer: z.string(),
      difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
      marks: z.number().optional()
    });

    const data = questionSchema.parse(req.body);

    const question = new Question(data);
    await question.save();

    await AuditLog.create({
      adminId: req.user._id,
      action: 'add_question',
      targetType: 'Question',
      targetId: question._id.toString(),
      details: `Added ${data.categoryType} question for ${data.domain}`
    });

    res.status(201).json({ message: 'Question added', question });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.errors[0].message });
    }
    console.error('Add question error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/admin/questions/:questionId', authenticate, requireAdmin, async (req, res) => {
  try {
    const { questionId } = req.params;

    const updateSchema = z.object({
      questionText: z.string().min(10).optional(),
      options: z.array(z.string()).length(4).optional(),
      correctAnswer: z.string().optional(),
      difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
      marks: z.number().optional()
    });

    const data = updateSchema.parse(req.body);

    const question = await Question.findByIdAndUpdate(
      questionId,
      data,
      { new: true }
    );

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    await AuditLog.create({
      adminId: req.user._id,
      action: 'update_question',
      targetType: 'Question',
      targetId: questionId,
      details: 'Question updated'
    });

    res.json({ message: 'Question updated', question });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.errors[0].message });
    }
    console.error('Update question error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/admin/questions/:questionId', authenticate, requireAdmin, async (req, res) => {
  try {
    const { questionId } = req.params;

    await Question.findByIdAndDelete(questionId);

    await AuditLog.create({
      adminId: req.user._id,
      action: 'delete_question',
      targetType: 'Question',
      targetId: questionId,
      details: 'Question deleted'
    });

    res.json({ message: 'Question deleted' });
  } catch (error) {
    console.error('Delete question error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/admin/questions/bulk', authenticate, requireAdmin, async (req, res) => {
  try {
    const { questions } = req.body;

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ message: 'No questions provided' });
    }

    const inserted = await Question.insertMany(questions);

    await AuditLog.create({
      adminId: req.user._id,
      action: 'bulk_upload_questions',
      targetType: 'Question',
      details: `Bulk uploaded ${questions.length} questions`
    });

    res.status(201).json({ message: `${inserted.length} questions uploaded`, count: inserted.length });
  } catch (error) {
    console.error('Bulk upload error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================== CUTOFF SETTINGS ROUTES ====================

app.get('/api/admin/cutoffs', authenticate, requireAdmin, async (req, res) => {
  try {
    const cutoffs = await Cutoff.find();
    res.json({ cutoffs });
  } catch (error) {
    console.error('Get cutoffs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/admin/cutoffs/:domain', authenticate, requireAdmin, async (req, res) => {
  try {
    const { domain } = req.params;
    const { aptitudeCutoff, technicalCutoff, overallCutoff, violationThreshold, approvalWaitMinutes } = req.body;

    const cutoff = await Cutoff.findOneAndUpdate(
      { domain },
      {
        domain,
        aptitudeCutoff: aptitudeCutoff ?? 4,
        technicalCutoff: technicalCutoff ?? 10,
        overallCutoff: overallCutoff ?? 14,
        violationThreshold: violationThreshold ?? 3,
        approvalWaitMinutes: approvalWaitMinutes ?? 5,
        updatedBy: req.user._id,
        updatedAt: Date.now()
      },
      { new: true, upsert: true }
    );

    await AuditLog.create({
      adminId: req.user._id,
      action: 'update_cutoff',
      targetType: 'Cutoff',
      targetId: cutoff._id.toString(),
      details: `Updated cutoff for ${domain}`
    });

    res.json({ message: 'Cutoff updated', cutoff });
  } catch (error) {
    console.error('Update cutoff error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================== EXPORT ROUTES ====================

app.get('/api/admin/export', authenticate, requireAdmin, async (req, res) => {
  try {
    const { domain, status, format = 'excel' } = req.query;

    const filter = {};
    if (domain) filter.domain = domain;
    if (status === 'qualified') filter.status = 'completed';
    if (status === 'disqualified') filter.disqualified = true;

    const attempts = await ExamAttempt.find(filter)
      .populate('userId', 'fullName email phone collegeName crn urn course semester city applicationId')
      .sort({ submittedAt: -1 });

    if (format === 'excel') {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Results');

      worksheet.columns = [
        { header: 'Candidate Name', key: 'fullName', width: 25 },
        { header: 'Email', key: 'email', width: 30 },
        { header: 'Phone', key: 'phone', width: 15 },
        { header: 'College Name', key: 'collegeName', width: 30 },
        { header: 'CRN', key: 'crn', width: 15 },
        { header: 'URN', key: 'urn', width: 15 },
        { header: 'Course', key: 'course', width: 20 },
        { header: 'Semester', key: 'semester', width: 15 },
        { header: 'City', key: 'city', width: 20 },
        { header: 'Application ID', key: 'applicationId', width: 15 },
        { header: 'Domain', key: 'domain', width: 30 },
        { header: 'Attempt Number', key: 'attemptNumber', width: 15 },
        { header: 'Aptitude Marks', key: 'aptitudeScore', width: 15 },
        { header: 'Technical Marks', key: 'technicalScore', width: 15 },
        { header: 'Total Marks', key: 'totalScore', width: 15 },
        { header: 'Correct Answers', key: 'correctCount', width: 15 },
        { header: 'Wrong Answers', key: 'wrongCount', width: 15 },
        { header: 'Status', key: 'status', width: 15 },
        { header: 'Violations', key: 'violationsCount', width: 12 },
        { header: 'Disqualified Reason', key: 'disqualifiedReason', width: 30 },
        { header: 'Exam Start Time', key: 'startedAt', width: 20 },
        { header: 'Submission Time', key: 'submittedAt', width: 20 }
      ];

      for (const attempt of attempts) {
        const user = attempt.userId;
        worksheet.addRow({
          fullName: user?.fullName || 'N/A',
          email: user?.email || 'N/A',
          phone: user?.phone || 'N/A',
          collegeName: user?.collegeName || 'N/A',
          crn: user?.crn || 'N/A',
          urn: user?.urn || 'N/A',
          course: user?.course || 'N/A',
          semester: user?.semester || 'N/A',
          city: user?.city || 'N/A',
          applicationId: user?.applicationId || 'N/A',
          domain: attempt.domain,
          attemptNumber: attempt.attemptNumber,
          aptitudeScore: attempt.aptitudeScore,
          technicalScore: attempt.technicalScore,
          totalScore: attempt.totalScore,
          correctCount: attempt.correctCount,
          wrongCount: attempt.wrongCount,
          status: attempt.disqualified ? 'Disqualified' : (attempt.totalScore >= 14 ? 'Qualified' : 'Not Qualified'),
          violationsCount: attempt.violationsCount,
          disqualifiedReason: attempt.disqualifiedReason || 'N/A',
          startedAt: attempt.startedAt ? new Date(attempt.startedAt).toLocaleString() : 'N/A',
          submittedAt: attempt.submittedAt ? new Date(attempt.submittedAt).toLocaleString() : 'N/A'
        });
      }

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=VproTechDigital_Results_${Date.now()}.xlsx`);

      await workbook.xlsx.write(res);
      res.end();
    } else {
      const data = attempts.map(attempt => {
        const user = attempt.userId;
        return {
          candidateName: user?.fullName,
          email: user?.email,
          phone: user?.phone,
          collegeName: user?.collegeName,
          crn: user?.crn,
          urn: user?.urn,
          course: user?.course,
          semester: user?.semester,
          city: user?.city,
          applicationId: user?.applicationId,
          domain: attempt.domain,
          attemptNumber: attempt.attemptNumber,
          aptitudeScore: attempt.aptitudeScore,
          technicalScore: attempt.technicalScore,
          totalScore: attempt.totalScore,
          correctCount: attempt.correctCount,
          wrongCount: attempt.wrongCount,
          status: attempt.disqualified ? 'Disqualified' : (attempt.totalScore >= 14 ? 'Qualified' : 'Not Qualified'),
          violationsCount: attempt.violationsCount,
          disqualifiedReason: attempt.disqualifiedReason,
          startedAt: attempt.startedAt,
          submittedAt: attempt.submittedAt
        };
      });

      res.json({ results: data, total: data.length });
    }
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/admin/export/:attemptId', authenticate, requireAdmin, async (req, res) => {
  try {
    const { attemptId } = req.params;

    const attempt = await ExamAttempt.findById(attemptId)
      .populate('userId', 'fullName email phone collegeName crn urn course semester city applicationId');

    if (!attempt) {
      return res.status(404).json({ message: 'Attempt not found' });
    }

    const questions = await Question.find({ _id: { $in: attempt.questionsShown } });
    const violations = await ViolationLog.find({ attemptId: attempt._id });

    const workbook = new ExcelJS.Workbook();
    
    const summarySheet = workbook.addWorksheet('Summary');
    const user = attempt.userId;
    
    summarySheet.columns = [
      { header: 'Field', key: 'field', width: 25 },
      { header: 'Value', key: 'value', width: 40 }
    ];

    summarySheet.addRow({ field: 'Candidate Name', value: user?.fullName });
    summarySheet.addRow({ field: 'Email', value: user?.email });
    summarySheet.addRow({ field: 'Phone', value: user?.phone });
    summarySheet.addRow({ field: 'College Name', value: user?.collegeName });
    summarySheet.addRow({ field: 'CRN', value: user?.crn });
    summarySheet.addRow({ field: 'URN', value: user?.urn });
    summarySheet.addRow({ field: 'Course', value: user?.course });
    summarySheet.addRow({ field: 'Semester', value: user?.semester });
    summarySheet.addRow({ field: 'City', value: user?.city });
    summarySheet.addRow({ field: 'Application ID', value: user?.applicationId });
    summarySheet.addRow({ field: 'Domain', value: attempt.domain });
    summarySheet.addRow({ field: 'Attempt Number', value: attempt.attemptNumber });
    summarySheet.addRow({ field: 'Aptitude Score', value: attempt.aptitudeScore });
    summarySheet.addRow({ field: 'Technical Score', value: attempt.technicalScore });
    summarySheet.addRow({ field: 'Total Score', value: attempt.totalScore });
    summarySheet.addRow({ field: 'Correct Count', value: attempt.correctCount });
    summarySheet.addRow({ field: 'Wrong Count', value: attempt.wrongCount });
    summarySheet.addRow({ field: 'Status', value: attempt.disqualified ? 'Disqualified' : (attempt.totalScore >= 14 ? 'Qualified' : 'Not Qualified') });
    summarySheet.addRow({ field: 'Violations Count', value: attempt.violationsCount });
    summarySheet.addRow({ field: 'Disqualified Reason', value: attempt.disqualifiedReason || 'N/A' });
    summarySheet.addRow({ field: 'Started At', value: attempt.startedAt?.toISOString() });
    summarySheet.addRow({ field: 'Submitted At', value: attempt.submittedAt?.toISOString() });

    const questionsSheet = workbook.addWorksheet('Questions & Answers');
    questionsSheet.columns = [
      { header: 'Q No.', key: 'qno', width: 8 },
      { header: 'Category', key: 'category', width: 12 },
      { header: 'Domain', key: 'domain', width: 25 },
      { header: 'Question', key: 'question', width: 50 },
      { header: 'Option A', key: 'optionA', width: 30 },
      { header: 'Option B', key: 'optionB', width: 30 },
      { header: 'Option C', key: 'optionC', width: 30 },
      { header: 'Option D', key: 'optionD', width: 30 },
      { header: 'Correct Answer', key: 'correctAnswer', width: 15 },
      { header: 'Selected Answer', key: 'selectedAnswer', width: 15 },
      { header: 'Result', key: 'result', width: 12 }
    ];

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const selectedAnswer = attempt.selectedAnswers.get(q._id.toString());
      const isCorrect = selectedAnswer === q.correctAnswer;

      questionsSheet.addRow({
        qno: i + 1,
        category: q.categoryType,
        domain: q.domain,
        question: q.questionText,
        optionA: q.options[0],
        optionB: q.options[1],
        optionC: q.options[2],
        optionD: q.options[3],
        correctAnswer: q.correctAnswer,
        selectedAnswer: selectedAnswer || 'Not Answered',
        result: selectedAnswer ? (isCorrect ? 'Correct' : 'Wrong') : 'Not Answered'
      });
    }

    if (violations.length > 0) {
      const violationsSheet = workbook.addWorksheet('Violations');
      violationsSheet.columns = [
        { header: 'Type', key: 'type', width: 20 },
        { header: 'Details', key: 'details', width: 50 },
        { header: 'Timestamp', key: 'timestamp', width: 25 }
      ];

      for (const v of violations) {
        violationsSheet.addRow({
          type: v.type,
          details: v.details,
          timestamp: v.timestamp.toISOString()
        });
      }
    }

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=VproTechDigital_Proof_${attempt._id}.xlsx`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Export detailed error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================== SEED ADMIN ====================

app.get('/api/seed-admin', async (req, res) => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      return res.status(400).json({ message: 'Admin credentials not configured' });
    }

    let adminUser = await User.findOne({ email: adminEmail, role: 'admin' });

    if (!adminUser) {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      adminUser = new User({
        fullName: 'Admin',
        email: adminEmail,
        password: hashedPassword,
        phone: '0000000000',
        collegeName: 'N/A',
        crn: 'N/A',
        urn: 'N/A',
        course: 'N/A',
        semester: 'N/A',
        city: 'N/A',
        applicationId: 'ADMIN001',
        role: 'admin'
      });
      await adminUser.save();
      res.json({ message: 'Admin seeded successfully', admin: { email: adminEmail, role: 'admin' } });
    } else {
      res.json({ message: 'Admin already exists', admin: { email: adminEmail, role: 'admin' } });
    }
  } catch (error) {
    console.error('Seed admin error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================== START SERVER ====================

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
