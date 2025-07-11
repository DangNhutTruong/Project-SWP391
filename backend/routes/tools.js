const express = require('express');
const mysql = require('mysql2/promise');
const router = express.Router();

// Database config
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  ssl: { rejectUnauthorized: false }
};

// Get all tools (for ToolsSection)
router.get('/', async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    const tools = [
      { id: 1, name: 'Your quit smoking plan', route: '/quit-smoking-plan', icon: 'fas fa-file-alt' },
      { id: 2, name: 'Cost of smoking', route: '/cost-calculator', icon: 'fas fa-calculator' },
      { id: 3, name: 'Effects of smoking on your body', route: '/smoking-effects', icon: 'fas fa-lungs' },
      { id: 4, name: 'Your quit vaping plan', route: '/quit-vaping-plan', icon: 'fas fa-file-alt' },
      { id: 5, name: 'Benefits of quitting vaping', route: '/vaping-benefits', icon: 'fas fa-plus-circle' },
      { id: 6, name: 'Effects of vaping on your body', route: '/vaping-effects', icon: 'fas fa-lungs' }
    ];
    
    await connection.end();
    res.json(tools);
  } catch (error) {
    console.error('Error fetching tools:', error);
    res.status(500).json({ error: 'Failed to fetch tools' });
  }
});

// Get quit smoking plan for user
router.get('/quit-smoking-plan/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const connection = await mysql.createConnection(dbConfig);
    
    const [rows] = await connection.execute(
      'SELECT * FROM daily_progress WHERE smoker_id = ? AND tool_type = "quit_smoking_plan" ORDER BY date DESC LIMIT 1',
      [userId]
    );
    
    await connection.end();
    res.json(rows[0] || null);
  } catch (error) {
    console.error('Error fetching quit plan:', error);
    res.status(500).json({ error: 'Failed to fetch quit smoking plan' });
  }
});

// Calculate cost savings
router.post('/cost-calculator', async (req, res) => {
  try {
    const { cigarettesPerDay, costPerPack, quitDate } = req.body;
    
    const daysQuit = Math.floor((new Date() - new Date(quitDate)) / (1000 * 60 * 60 * 24));
    const cigarettesAvoided = daysQuit * cigarettesPerDay;
    const packsAvoided = cigarettesAvoided / 20; // 20 cigarettes per pack
    const moneySaved = packsAvoided * costPerPack;
    
    res.json({
      daysQuit,
      cigarettesAvoided,
      moneySaved: Math.round(moneySaved * 100) / 100,
      healthBenefits: getHealthBenefits(daysQuit)
    });
  } catch (error) {
    console.error('Error calculating cost:', error);
    res.status(500).json({ error: 'Failed to calculate cost' });
  }
});

// Get health effects timeline
router.get('/smoking-effects/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const connection = await mysql.createConnection(dbConfig);
    
    const [rows] = await connection.execute(
      'SELECT days_clean FROM daily_progress WHERE smoker_id = ? ORDER BY date DESC LIMIT 1',
      [userId]
    );
    
    const daysClean = rows[0]?.days_clean || 0;
    const effects = getSmokingEffects(daysClean);
    
    await connection.end();
    res.json({ daysClean, effects });
  } catch (error) {
    console.error('Error fetching smoking effects:', error);
    res.status(500).json({ error: 'Failed to fetch smoking effects' });
  }
});

// Helper functions
function getHealthBenefits(days) {
  const benefits = [];
  if (days >= 1) benefits.push('Blood oxygen levels return to normal');
  if (days >= 3) benefits.push('Breathing becomes easier');
  if (days >= 7) benefits.push('Sense of taste and smell improve');
  if (days >= 30) benefits.push('Lung function begins to improve');
  if (days >= 365) benefits.push('Risk of heart disease is cut in half');
  return benefits;
}

function getSmokingEffects(days) {
  if (days < 1) return 'Start your quit journey today!';
  if (days < 7) return 'Your body is beginning to heal';
  if (days < 30) return 'Major improvements in circulation and lung function';
  if (days < 90) return 'Significant improvement in lung function and circulation';
  return 'Your body has made remarkable recovery progress';
}

module.exports = router;
