const Session = require('../models/Session');
const User = require('../models/User');

// Create a new session
exports.createSession = async (req, res) => {
  try {
    const { title, category } = req.body;
    const user = req.user;
    
    // Generate a unique session ID 
    const sessionId = `session_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    
    // Create and save new session
    const newSession = new Session({
      sessionId,
      hostId: user.userId,
      title: title || 'Mental Health Discussion',
      category: category || 'Peer Support',
      participants: [{
        userId: user.userId,
        name: user.name,
        role: user.role,
        imageUrl: user.imageUrl
      }]
    });
    
    await newSession.save();
    
    // Store user if not already in database
    const existingUser = await User.findOne({ userId: user.userId });
    if (!existingUser) {
      const newUser = new User({
        userId: user.userId,
        name: user.name,
        role: user.role,
        imageUrl: user.imageUrl || ''
      });
      await newUser.save();
    }
    
    res.status(201).json({ 
      success: true, 
      session: {
        sessionId,
        title: newSession.title,
        hostName: user.name
      }
    });
  } catch (error) {
    console.error('Create session error:', error);
    res.status(500).json({ success: false, message: 'Could not create session' });
  }
};

// Join an existing session
exports.joinSession = async (req, res) => {
  try {
    const { sessionId } = req.body;
    const user = req.user;
    
    // Find the session
    const session = await Session.findOne({ sessionId, active: true });
    
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found or inactive' });
    }
    
    // Check if user is already in the session
    const existingParticipant = session.participants.find(p => p.userId === user.userId);
    
    if (!existingParticipant) {
      // Add user to participants
      session.participants.push({
        userId: user.userId,
        name: user.name,
        role: user.role,
        imageUrl: user.imageUrl || ''
      });
      
      await session.save();
    }
    
    // Store user if not already in database
    const existingUser = await User.findOne({ userId: user.userId });
    if (!existingUser) {
      const newUser = new User({
        userId: user.userId,
        name: user.name,
        role: user.role,
        imageUrl: user.imageUrl || ''
      });
      await newUser.save();
    }
    
    res.status(200).json({ 
      success: true, 
      session: {
        sessionId,
        title: session.title,
        hostId: session.hostId,
        participantCount: session.participants.length
      }
    });
  } catch (error) {
    console.error('Join session error:', error);
    res.status(500).json({ success: false, message: 'Could not join session' });
  }
};

// Get all active sessions
exports.getActiveSessions = async (req, res) => {
  try {
    const sessions = await Session.find({ active: true });
    
    // Format the response
    const formattedSessions = await Promise.all(sessions.map(async (session) => {
      const host = await User.findOne({ userId: session.hostId });
      
      return {
        sessionId: session.sessionId,
        title: session.title,
        category: session.category,
        startTime: new Date(session.startTime).toLocaleTimeString(),
        host: {
          name: host ? host.name : 'Unknown Host',
          role: host ? host.role : 'Host',
          imageUrl: host ? host.imageUrl : '',
          bio: 'Mental health professional ready to support you.'
        },
        participantCount: session.participants.length
      };
    }));
    
    res.status(200).json({ success: true, sessions: formattedSessions });
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({ success: false, message: 'Could not retrieve sessions' });
  }
};

// End a session (host only)
exports.endSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const user = req.user;
    
    const session = await Session.findOne({ sessionId });
    
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }
    
    // Check if user is the host
    if (session.hostId !== user.userId) {
      return res.status(403).json({ success: false, message: 'Only the host can end this session' });
    }
    
    // Update session to inactive
    session.active = false;
    session.endTime = new Date();
    await session.save();
    
    res.status(200).json({ success: true, message: 'Session ended successfully' });
  } catch (error) {
    console.error('End session error:', error);
    res.status(500).json({ success: false, message: 'Could not end session' });
  }
};