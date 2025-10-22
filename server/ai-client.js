require('dotenv').config();
const fetch = require('node-fetch');

const DEEPSEEK_KEY = process.env.DEEPSEEK_KEY || '';
const DEEPSEEK_URL = process.env.DEEPSEEK_URL || 'https://api.deepseek.com/v1/chat/completions';

async function callDeepseek(prompt) {
    if (!DEEPSEEK_KEY) throw new Error('Deepseek key not configured');
    
    const body = {
        model: "deepseek-chat",
        messages: [
            {
                role: "system",
                content: "You are a persona generator. Return ONLY valid JSON with keys: name, title, description, traits (array of strings), visual_prompt (string for image generation)."
            },
            {
                role: "user",
                content: `Create an AI persona based on: ${prompt}`
            }
        ],
        temperature: 0.8,
        max_tokens: 500
    };

    const response = await fetch(DEEPSEEK_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${DEEPSEEK_KEY}`
        },
        body: JSON.stringify(body)
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Deepseek API Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content || '';
    return extractJSONFromText(text);
}

function extractJSONFromText(text) {
    if (!text) return { name: 'Unknown', title: '', description: '', traits: [], visual_prompt: '' };
    
    // Try to extract JSON from markdown code blocks
    const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/) || text.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
        return { 
            name: 'Generated Persona', 
            title: '', 
            description: text, 
            traits: [], 
            visual_prompt: text.substring(0, 100) 
        };
    }

    try {
        const jsonText = jsonMatch[1] || jsonMatch[0];
        const parsed = JSON.parse(jsonText);
        
        // Validate required fields
        return {
            name: parsed.name || 'Unknown Persona',
            title: parsed.title || '',
            description: parsed.description || '',
            traits: Array.isArray(parsed.traits) ? parsed.traits : [],
            visual_prompt: parsed.visual_prompt || parsed.name || ''
        };
    } catch (e) {
        console.warn('JSON parse failed:', e.message);
        return { 
            name: 'Generated Persona', 
            title: '', 
            description: text, 
            traits: [], 
            visual_prompt: '' 
        };
    }
}

module.exports = { callDeepseek };
