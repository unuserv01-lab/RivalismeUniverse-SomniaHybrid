require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const createPersona = require('./create-persona');
const path = require('path');

const app = express();
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '..')));

// ✅ ADDED: CORS middleware untuk handle frontend-backend communication
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// ✅ IMPROVED: Better error handling untuk generate persona
app.post('/api/generate-persona', async (req, res) => {
  try {
    const { prompt, type, walletAddress } = req.body;
    
    console.log('🎯 Received persona generation request:', {
      prompt: prompt?.substring(0, 100) + '...',
      type,
      walletAddress: walletAddress ? `${walletAddress.substring(0, 10)}...` : 'none'
    });

    if (!prompt) {
      return res.status(400).json({ 
        error: 'Missing prompt',
        message: 'Please provide a description for the AI persona'
      });
    }

    if (prompt.length < 5) {
      return res.status(400).json({
        error: 'Prompt too short',
        message: 'Please provide a more detailed description (at least 5 characters)'
      });
    }

    const result = await createPersona.generateAndPublish(prompt);
    
    console.log('✅ Persona generated successfully:', result.persona?.name);
    
    res.json({
      success: true,
      persona: result.persona,
      metadata: result.metadata,
      ipfsUrl: result.ipfsUrl,
      ipfsHash: result.ipfsHash,
      imageUrl: result.imageUrl
    });

  } catch (err) {
    console.error('❌ Error in /api/generate-persona:', err);
    
    // User-friendly error messages
    let errorMessage = 'Failed to generate persona';
    let errorDetails = err.message;

    if (err.message.includes('API key') || err.message.includes('key not configured')) {
      errorMessage = 'AI service configuration error';
      errorDetails = 'Please check your API keys configuration';
    } else if (err.message.includes('network') || err.message.includes('fetch')) {
      errorMessage = 'Network error';
      errorDetails = 'Please check your internet connection and try again';
    }

    res.status(500).json({ 
      error: errorMessage,
      details: errorDetails,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});

// ✅ ADDED: Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    services: {
      ai: 'configured',
      pinata: process.env.PINATA_JWT ? 'configured' : 'missing',
      freepik: process.env.FREEPIK_API_KEY ? 'configured' : 'missing'
    }
  });
});

// ✅ ADDED: Test AI connection endpoint
app.get('/api/test-ai', async (req, res) => {
  try {
    const { generatePersonaJSON } = require('./ai-client');
    const testResult = await generatePersonaJSON('test persona - friendly AI assistant');
    
    res.json({
      status: 'AI service working',
      testPersona: testResult,
      keys: {
        deepseek: process.env.DEEPSEEK_KEY ? 'configured' : 'missing',
        gemini: process.env.GEMINI_API_KEY ? 'configured' : 'missing',
        openai: process.env.OPENAI_API_KEY ? 'configured' : 'missing'
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'AI service error',
      error: error.message
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🔍 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🤖 AI test: http://localhost:${PORT}/api/test-ai`);
});
