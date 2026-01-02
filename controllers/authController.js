const { User, Member } = require('../models/authModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Generate ID
const generateUserId = () => `USER${Date.now()}${Math.floor(Math.random() * 1000)}`;
const generateMemberId = () => `MEMBER${Date.now()}${Math.floor(Math.random() * 1000)}`;

// User Registration
const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create new user
    const newUser = new User({
      userId: generateUserId(),
      username,
      email,
      password: hashedPassword,
      role: 'user'
    });
    
    await newUser.save();
    
    res.status(201).json({ 
      message: 'User registered successfully',
      userId: newUser.userId
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// User Login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Create token
    const token = jwt.sign(
      { userId: user.userId, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );
    
    res.json({
      token,
      user: {
        _id: user._id,
        userId: user.userId,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Member Login
const loginMember = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find member
    const member = await Member.findOne({ email });
    if (!member) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Check password
    const isMatch = await bcrypt.compare(password, member.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Create token
    const token = jwt.sign(
      { memberId: member.memberId, email: member.email, role: 'member' },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );
    
    res.json({
      token,
      member: {
        _id: member._id,
        memberId: member.memberId,
        memberName: member.memberName,
        email: member.email
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


module.exports = {
  registerUser,
  loginUser,
  loginMember,
 
};