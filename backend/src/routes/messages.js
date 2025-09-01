const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, requireRole } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');
const router = express.Router();

const prisma = new PrismaClient();

// Rate limiting for message creation
const messageRateLimit = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) || 3000,
  max: parseInt(process.env.RATE_LIMIT_MAX) || 1,
  message: { error: 'Too many messages, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Create message
router.post('/:roomId', authenticateToken, messageRateLimit, async (req, res) => {
  try {
    const { roomId } = req.params;
    const { content, anonymous = false } = req.body;
    const userId = req.user.userId;

    // Validate content
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Message content is required' });
    }

    if (content.length > 100) {
      return res.status(400).json({ error: 'Message too long (max 100 characters)' });
    }

    // Check if room exists and is active
    const room = await prisma.room.findUnique({
      where: { id: roomId }
    });

    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    if (room.status === 'paused') {
      return res.status(423).json({ error: 'Room is paused' });
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        roomId,
        userId,
        content: content.trim(),
        anonymous,
        status: 'pending' // Auto-moderation will be handled by moderation service
      },
      include: {
        user: {
          select: { id: true, name: true, nickname: true }
        }
      }
    });

    // For now, auto-approve messages (in production, this would go through moderation)
    const approvedMessage = await prisma.message.update({
      where: { id: message.id },
      data: { status: 'approved' },
      include: {
        user: {
          select: { id: true, name: true, nickname: true }
        }
      }
    });

    // Broadcast approved message
    const io = req.app.get('socketio');
    io.to(roomId).emit('message.approved', {
      id: approvedMessage.id,
      roomId: approvedMessage.roomId,
      content: approvedMessage.content,
      anonymous: approvedMessage.anonymous,
      user: approvedMessage.anonymous ? null : {
        name: approvedMessage.user.name,
        nickname: approvedMessage.user.nickname
      },
      at: approvedMessage.createdAt
    });

    res.status(201).json({ success: true, messageId: message.id });

  } catch (error) {
    console.error('Create message error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get pending messages for moderation
router.get('/:roomId/pending', authenticateToken, requireRole(['moderator', 'admin']), async (req, res) => {
  try {
    const { roomId } = req.params;

    const messages = await prisma.message.findMany({
      where: {
        roomId,
        status: 'pending'
      },
      include: {
        user: {
          select: { id: true, email: true, name: true, nickname: true }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    res.json(messages);
  } catch (error) {
    console.error('Get pending messages error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Approve message
router.post('/:id/approve', authenticateToken, requireRole(['moderator', 'admin']), async (req, res) => {
  try {
    const { id } = req.params;

    const message = await prisma.message.update({
      where: { id },
      data: { status: 'approved' },
      include: {
        user: {
          select: { id: true, name: true, nickname: true }
        }
      }
    });

    // Broadcast approved message
    const io = req.app.get('socketio');
    io.to(message.roomId).emit('message.approved', {
      id: message.id,
      roomId: message.roomId,
      content: message.content,
      anonymous: message.anonymous,
      user: message.anonymous ? null : {
        name: message.user.name,
        nickname: message.user.nickname
      },
      at: message.createdAt
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Approve message error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Reject message
router.post('/:id/reject', authenticateToken, requireRole(['moderator', 'admin']), async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.message.update({
      where: { id },
      data: { status: 'rejected' }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Reject message error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;