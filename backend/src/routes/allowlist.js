const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, requireRole } = require('../middleware/auth');
const router = express.Router();

const prisma = new PrismaClient();

// Get allowlist (Admin only)
router.get('/', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const allowlist = await prisma.allowlistUser.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(allowlist);
  } catch (error) {
    console.error('Get allowlist error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add user to allowlist (Admin only)
router.post('/', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { email, name, nickname, role = 'audience' } = req.body;

    if (!email || !name) {
      return res.status(400).json({ error: 'Email and name are required' });
    }

    // Validate role
    const validRoles = ['audience', 'host', 'moderator', 'admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const user = await prisma.allowlistUser.create({
      data: {
        email: email.toLowerCase(),
        name,
        nickname,
        role
      }
    });

    // Log audit trail
    await prisma.auditLog.create({
      data: {
        actorId: req.user.userId,
        action: 'allowlist.add',
        meta: { email: user.email, role: user.role }
      }
    });

    res.status(201).json(user);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Email already exists in allowlist' });
    }
    console.error('Add allowlist user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Remove user from allowlist (Admin only)
router.delete('/:email', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { email } = req.params;

    await prisma.allowlistUser.delete({
      where: { email: email.toLowerCase() }
    });

    // Log audit trail
    await prisma.auditLog.create({
      data: {
        actorId: req.user.userId,
        action: 'allowlist.remove',
        meta: { email }
      }
    });

    res.json({ success: true });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'User not found in allowlist' });
    }
    console.error('Remove allowlist user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;