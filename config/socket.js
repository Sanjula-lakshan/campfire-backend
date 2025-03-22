const { Server } = require('socket.io');
const Session = require('../models/Session');

const setupSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: '*', // For development - restrict in production
      methods: ['GET', 'POST']
    }
  });

  // Store active users
  const activeUsers = new Map();

  io.on('connection', (socket) => {
    console.log(`New connection: ${socket.id}`);

    // Handle user joining a session
    socket.on('join-session', async (data) => {
      try {
        const { sessionId, user } = data;
        
        // Join the socket room for this session
        socket.join(sessionId);
        
        // Store user data with socket id
        activeUsers.set(socket.id, { sessionId, user });
        
        // Notify others that user has joined
        socket.to(sessionId).emit('user-joined', {
          userId: user.userId,
          name: user.name,
          role: user.role
        });
        
        // Send current participant list to the new user
        const session = await Session.findOne({ sessionId });
        if (session) {
          io.to(socket.id).emit('participant-list', session.participants);
        }
        
        console.log(`User ${user.name} joined session ${sessionId}`);
      } catch (error) {
        console.error('Socket join-session error:', error);
      }
    });

    // Handle user leaving a session
    socket.on('leave-session', async () => {
      try {
        const userData = activeUsers.get(socket.id);
        
        if (userData) {
          const { sessionId, user } = userData;
          
          // Leave the socket room
          socket.leave(sessionId);
          
          // Notify others that user has left
          socket.to(sessionId).emit('user-left', {
            userId: user.userId,
            name: user.name
          });
          
          console.log(`User ${user.name} left session ${sessionId}`);
          
          // Remove user from active users
          activeUsers.delete(socket.id);
        }
      } catch (error) {
        console.error('Socket leave-session error:', error);
      }
    });

    // Handle chat messages
    socket.on('send-message', (data) => {
      const { sessionId, message } = data;
      const userData = activeUsers.get(socket.id);
      
      if (userData) {
        // Broadcast message to all users in the session
        io.to(sessionId).emit('new-message', {
          userId: userData.user.userId,
          name: userData.user.name,
          message,
          timestamp: new Date().toISOString()
        });
      }
    });

    // Handle disconnection
    socket.on('disconnect', async () => {
      try {
        const userData = activeUsers.get(socket.id);
        
        if (userData) {
          const { sessionId, user } = userData;
          
          // Notify others about disconnection
          socket.to(sessionId).emit('user-left', {
            userId: user.userId,
            name: user.name
          });
          
          console.log(`User ${user.name} disconnected from session ${sessionId}`);
          
          // Remove user from active users
          activeUsers.delete(socket.id);
        }
      } catch (error) {
        console.error('Socket disconnect error:', error);
      }
    });
  });

  return io;
};

module.exports = setupSocket;