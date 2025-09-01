const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');
const router = express.Router();

const prisma = new PrismaClient();

// Rate limiting for reactions (shared with messages)
const reactionRateLimit = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) || 3000,
  max: parseInt(process.env.RATE_LIMIT_MAX) || 1,
  message: { error: 'Too many reactions, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Send reaction
router.post('/:roomId', authenticateToken, reactionRateLimit, async (req, res) => {
  try {
    const { roomId } = req.params;
    const { emoji, mode = 'rain' } = req.body;
    const userId = req.user.userId;

    // Validate emoji against whitelist
    const allowedEmojis = (process.env.EMOJI_WHITELIST || '👍,😂,😭,🎉').split(',');
    if (!allowedEmojis.includes(emoji)) {
      return res.status(400).json({ error: 'Emoji not allowed' });
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

    // Create reaction record
    const reaction = await prisma.reaction.create({
      data: {
        roomId,
        userId,
        emoji,
        mode
      }
    });

    // Broadcast reaction to room
    const io = req.app.get('socketio');
    io.to(roomId).emit('reaction.push', {
      roomId,
      emoji,
      mode,
      at: reaction.createdAt
    });

    res.status(201).json({ success: true, reactionId: reaction.id });

  } catch (error) {
    console.error('Send reaction error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;