const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, requireRole } = require('../middleware/auth');
const router = express.Router();

const prisma = new PrismaClient();

// Get all rooms (Admin only)
router.get('/', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const rooms = await prisma.room.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(rooms);
  } catch (error) {
    console.error('Get rooms error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create room (Admin only)
router.post('/', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { name, theme = {} } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Room name is required' });
    }

    const room = await prisma.room.create({
      data: {
        name,
        theme: theme || {}
      }
    });

    res.status(201).json(room);
  } catch (error) {
    console.error('Create room error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update room theme (Host/Admin)
router.patch('/:id/theme', authenticateToken, requireRole(['host', 'admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Validate theme updates
    const allowedFields = ['textColor', 'speed', 'lanes', 'fontFamily', 'reactionSpawnRate'];
    const filteredUpdates = {};
    
    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        filteredUpdates[field] = updates[field];
      }
    }

    const room = await prisma.room.update({
      where: { id },
      data: {
        theme: filteredUpdates
      }
    });

    // Broadcast theme update to all clients in room
    const io = req.app.get('socketio');
    io.to(id).emit('theme.updated', {
      roomId: id,
      delta: filteredUpdates,
      at: new Date().toISOString()
    });

    res.json(room);
  } catch (error) {
    console.error('Update room theme error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Clear room (Host/Moderator/Admin)
router.post('/:id/clear', authenticateToken, requireRole(['host', 'moderator', 'admin']), async (req, res) => {
  try {
    const { id } = req.params;

    // Broadcast clear event
    const io = req.app.get('socketio');
    io.to(id).emit('room.cleared', {
      roomId: id,
      at: new Date().toISOString()
    });

    res.json({ success: true, message: 'Room cleared' });
  } catch (error) {
    console.error('Clear room error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Pause/Resume room (Host/Moderator/Admin)
router.post('/:id/pause', authenticateToken, requireRole(['host', 'moderator', 'admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { paused } = req.body;

    const room = await prisma.room.update({
      where: { id },
      data: {
        status: paused ? 'paused' : 'active'
      }
    });

    // Broadcast pause/resume event
    const io = req.app.get('socketio');
    io.to(id).emit('room.paused', {
      roomId: id,
      paused,
      at: new Date().toISOString()
    });

    res.json(room);
  } catch (error) {
    console.error('Pause/Resume room error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;