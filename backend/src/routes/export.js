const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, requireRole } = require('../middleware/auth');
const router = express.Router();

const prisma = new PrismaClient();

// Export data (Admin only)
router.post('/', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { roomId, from, to, format = 'csv' } = req.body;

    if (!roomId) {
      return res.status(400).json({ error: 'Room ID is required' });
    }

    // Build query filters
    const where = { roomId };
    
    if (from) {
      where.createdAt = { ...where.createdAt, gte: new Date(from) };
    }
    
    if (to) {
      where.createdAt = { ...where.createdAt, lte: new Date(to) };
    }

    // Get messages
    const messages = await prisma.message.findMany({
      where,
      include: {
        user: {
          select: { email: true, name: true, nickname: true }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    // Get reactions
    const reactions = await prisma.reaction.findMany({
      where,
      include: {
        user: {
          select: { email: true, name: true, nickname: true }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    if (format === 'json') {
      const data = {
        messages: messages.map(msg => ({
          id: msg.id,
          content: msg.content,
          anonymous: msg.anonymous,
          status: msg.status,
          user: msg.anonymous ? null : {
            email: msg.user.email,
            name: msg.user.name,
            nickname: msg.user.nickname
          },
          created_at: msg.createdAt.toISOString()
        })),
        reactions: reactions.map(reaction => ({
          id: reaction.id,
          emoji: reaction.emoji,
          mode: reaction.mode,
          user: {
            email: reaction.user.email,
            name: reaction.user.name,
            nickname: reaction.user.nickname
          },
          created_at: reaction.createdAt.toISOString()
        }))
      };

      // Generate filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      const filename = `room-${roomId}-${timestamp}.json`;

      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.json(data);
    } else {
      // CSV format
      const csvRows = [];
      
      // Header
      csvRows.push('type,id,content,emoji,anonymous,status,user_email,user_name,user_nickname,created_at');
      
      // Messages
      for (const msg of messages) {
        csvRows.push([
          'message',
          msg.id,
          `"${msg.content.replace(/"/g, '""')}"`,
          '',
          msg.anonymous,
          msg.status,
          msg.anonymous ? '' : msg.user.email,
          msg.anonymous ? '' : `"${msg.user.name.replace(/"/g, '""')}"`,
          msg.anonymous ? '' : (msg.user.nickname ? `"${msg.user.nickname.replace(/"/g, '""')}"` : ''),
          msg.createdAt.toISOString()
        ].join(','));
      }
      
      // Reactions
      for (const reaction of reactions) {
        csvRows.push([
          'reaction',
          reaction.id,
          '',
          reaction.emoji,
          'false',
          'approved',
          reaction.user.email,
          `"${reaction.user.name.replace(/"/g, '""')}"`,
          reaction.user.nickname ? `"${reaction.user.nickname.replace(/"/g, '""')}"` : '',
          reaction.createdAt.toISOString()
        ].join(','));
      }

      const csv = csvRows.join('\n');
      
      // Generate filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      const filename = `room-${roomId}-${timestamp}.csv`;

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(csv);
    }

  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;