// server.js - HTTP Server Entry Point (Final Version)
import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import app from './app.js';

// Load environment variables first
dotenv.config();

// ✅ Environment debugging (remove after testing)
console.log('🔍 SERVER ENV CHECK:');
console.log('NODE_ENV:', process.env.NODE_ENV || 'development');
console.log('PORT:', process.env.PORT || '5000');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Found ✅' : 'Missing ❌');
console.log('MONGODB_URI_PROD:', process.env.MONGODB_URI_PROD ? 'Found ✅' : 'Missing ❌');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Found ✅' : 'Missing ❌');

const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = http.createServer(app);

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:5173',
      'http://localhost:5174',
      'https://krishi-sahayak.vercel.app'
    ],
    credentials: true,
    methods: ['GET', 'POST']
  }
});

// Socket.IO events
io.on('connection', (socket) => {
  console.log(`👤 User connected: ${socket.id}`);
  
  // Basic socket events
  socket.on('join_room', (roomId) => {
    socket.join(roomId);
    console.log(`👤 User ${socket.id} joined room: ${roomId}`);
  });

  socket.on('leave_room', (roomId) => {
    socket.leave(roomId);
    console.log(`👋 User ${socket.id} left room: ${roomId}`);
  });

  // Real-time chat for farmer support
  socket.on('chat_message', (data) => {
    socket.to(data.roomId).emit('chat_message', {
      id: socket.id,
      message: data.message,
      timestamp: new Date(),
      sender: data.sender
    });
  });

  // Disconnect event
  socket.on('disconnect', () => {
    console.log(`👋 User disconnected: ${socket.id}`);
  });
});

// Make io available to the app for real-time notifications
app.set('socketio', io);

// Start server
server.listen(PORT, () => {
  console.log(`
🌾 ==========================================
   Krishi Sahayak API Server Started
   ==========================================
   📍 Environment: ${process.env.NODE_ENV || 'development'}
   🌐 Port: ${PORT}
   🔗 Local URL: http://localhost:${PORT}
   🌍 Frontend URL: http://localhost:3000
   📖 Health Check: http://localhost:${PORT}/api/health
   🔐 Auth API: http://localhost:${PORT}/api/auth
   🔌 Socket.IO: Ready for real-time features
   ==========================================
   ✅ Server is ready for requests! 🌾
   ==========================================
  `);
});

// Graceful shutdown handlers
const gracefulShutdown = (signal) => {
  console.log(`🛑 ${signal} received. Shutting down gracefully...`);
  
  // Close Socket.IO connections
  io.close(() => {
    console.log('🔌 Socket.IO connections closed');
  });

  // Close HTTP server
  server.close(() => {
    console.log('✅ HTTP server closed');
    process.exit(0);
  });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error('❌ Unhandled Promise Rejection:', err.message);
  console.error('Promise:', promise);
  
  // Close server gracefully
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err.message);
  console.error('Stack:', err.stack);
  
  // Close server immediately
  process.exit(1);
});

// Export server for testing
export default server;
