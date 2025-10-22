require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const { generateAndPublish } = require('./create-persona');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '..')));

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        deepseek: !!process.env.DEEPSEEK_KEY,
        pinata: !!(process.env.PINATA_API_KEY && process.env.PINATA_SECRET)
    });
});

// Generate Persona API
app.post('/api/generate-persona', async (req, res) => {
    try {
        const { prompt, type, walletAddress } = req.body;
        
        if (!prompt) {
            return res.status(400).json({ error: 'Missing prompt' });
        }

        console.log(`\n🎯 Request from: ${walletAddress || 'anonymous'}`);
        console.log(`📝 Prompt: ${prompt}`);
        console.log(`🏷️ Type: ${type || 'general'}`);

        const result = await generateAndPublish(prompt);

        res.json({
            success: true,
            persona: result.persona,
            metadata: result.metadata,
            ipfsUrl: result.ipfsUrl,
            ipfsHash: result.ipfsHash,
            imageUrl: result.imageUrl
        });

    } catch (error) {
        console.error('❌ Error in /api/generate-persona:', error);
        res.status(500).json({ 
            error: 'Server error', 
            details: error.message 
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`\n🚀 RivalismeUniverse Server Running`);
    console.log(`📍 URL: http://localhost:${PORT}`);
    console.log(`🔑 Deepseek: ${process.env.DEEPSEEK_KEY ? '✅ Configured' : '❌ Missing'}`);
    console.log(`📦 Pinata: ${process.env.PINATA_API_KEY ? '✅ Configured' : '❌ Missing'}\n`);
});
