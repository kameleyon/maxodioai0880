const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { usageService } = require('../services/usage.service');

// Get usage stats
router.get('/stats', requireAuth, async (req, res) => {
  try {
    // Mock data for development
    res.json({
      current: {
        charactersUsed: 5000,
        requestsThisMinute: 30,
        voiceClones: 2
      },
      limits: {
        charactersPerMonth: 100000,
        requestsPerMinute: 60,
        voiceClones: 5
      },
      remaining: {
        charactersPerMonth: 95000,
        requestsPerMinute: 30,
        voiceClones: 3
      },
      history: [
        {
          date: '11/11/2024',
          requests: 2000,
          storage: 1024 * 1024 * 30
        },
        {
          date: '11/10/2024',
          requests: 3500,
          storage: 1024 * 1024 * 40
        },
        {
          date: '11/09/2024',
          requests: 4500,
          storage: 1024 * 1024 * 50
        }
      ],
      lastUpdated: new Date().toLocaleString()
    });
  } catch (error) {
    console.error('Error getting usage stats:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// Get detailed usage history
router.get('/history', requireAuth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    // Mock response with detailed history
    res.json([
      {
        date: '11/11/2024',
        requests: 4500,
        storage: 1024 * 1024 * 50,
        audioGenerated: 20,
        averageAudioLength: 120,
        peakUsageTime: '14:00',
        errorRate: 0.02
      },
      {
        date: '11/10/2024',
        requests: 3500,
        storage: 1024 * 1024 * 40,
        audioGenerated: 15,
        averageAudioLength: 90,
        peakUsageTime: '15:30',
        errorRate: 0.01
      }
    ]);
  } catch (error) {
    console.error('Error getting usage history:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// Get current quota status
router.get('/quota', requireAuth, async (req, res) => {
  try {
    res.json({
      requestsUsed: 30,
      requestsLimit: 60,
      storageUsed: 1024 * 1024 * 100,
      storageLimit: 1024 * 1024 * 1024,
      resetDate: '11/25/2024'
    });
  } catch (error) {
    console.error('Error getting quota status:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// Track usage event
router.post('/track', requireAuth, async (req, res) => {
  try {
    const { eventType, metadata } = req.body;
    // Mock response
    res.json({
      tracked: true,
      timestamp: new Date().toLocaleString(),
      eventType,
      metadata
    });
  } catch (error) {
    console.error('Error tracking usage event:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

module.exports = router;
