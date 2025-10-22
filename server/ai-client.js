require('dotenv').config();
const fetch = require('node-fetch');

const DEEPSEEK_KEY = process.env.DEEPSEEK_KEY || '';
const GEMINI_KEY = process.env.GEMINI_API_KEY || '';
const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY || '';
const OPENAI_KEY = process.env.OPENAI_API_KEY || '';

// ✅ FIXED: Deepseek API dengan endpoint yang benar
async function callDeepseek(prompt) {
  if (!DEEPSEEK_KEY) throw new Error('Deepseek key not configured');
  
  const url = 'https://api.deepseek.com/v1/chat/completions';
  const body = {
    model: "deepseek-chat",
    messages: [
      {
        role: "system",
        content: "You are an AI that creates detailed AI persona descriptions. Always return valid JSON with these exact keys: name, title, description, traits (array), visual_prompt. No other text."
      },
      {
        role: "user", 
        content: `Create a persona based on: ${prompt}`
      }
    ],
    temperature: 0.7,
    max_tokens: 1000
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json', 
      'Authorization': `Bearer ${DEEPSEEK_KEY}` 
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    throw new Error(`Deepseek error: ${response.status} ${await response.text()}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;
  return content;
}

// ✅ FIXED: Gemini API dengan format yang benar
async function callGemini(prompt) {
  if (!GEMINI_KEY) throw new Error('Gemini key not configured');
  
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_KEY}`;
  const body = {
    contents: [{
      parts: [{
        text: `Create a JSON object for an AI persona with these exact keys: name, title, description, traits (array), visual_prompt. Persona concept: ${prompt}. Return ONLY the JSON, no other text.`
      }]
    }],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 1000,
    }
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    throw new Error(`Gemini error: ${response.status} ${await response.text()}`);
  }

  const data = await response.json();
  const text = data.candidates[0].content.parts[0].text;
  return text;
}

// ✅ FIXED: OpenAI API sebagai fallback
async function callOpenAI(prompt) {
  if (!OPENAI_KEY) throw new Error('OpenAI key not configured');
  
  const url = 'https://api.openai.com/v1/chat/completions';
  const body = {
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: "You are an AI that creates detailed AI persona descriptions. Always return valid JSON with these exact keys: name, title, description, traits (array), visual_prompt. No other text."
      },
      {
        role: "user",
        content: `Create a persona based on: ${prompt}`
      }
    ],
    temperature: 0.7,
    max_tokens: 1000
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_KEY}`
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    throw new Error(`OpenAI error: ${response.status} ${await response.text()}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

// ✅ FIXED: OpenRouter API
async function callOpenRouter(prompt) {
  if (!OPENROUTER_KEY) throw new Error('OpenRouter key not configured');
  
  const url = 'https://openrouter.ai/api/v1/chat/completions';
  const body = {
    model: 'anthropic/claude-3-sonnet',
    messages: [
      {
        role: "system",
        content: "You are an AI that creates detailed AI persona descriptions. Always return valid JSON with these exact keys: name, title, description, traits (array), visual_prompt. No other text."
      },
      {
        role: "user",
        content: `Create a persona based on: ${prompt}`
      }
    ],
    temperature: 0.7,
    max_tokens: 1000
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENROUTER_KEY}`,
      'HTTP-Referer': 'https://rivalismeuniverse.com',
      'X-Title': 'Rivalisme Universe'
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    throw new Error(`OpenRouter error: ${response.status} ${await response.text()}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

// ✅ IMPROVED: Main function dengan fallback yang lebih baik
async function generatePersonaJSON(prompt) {
  console.log('🔄 Generating persona with prompt:', prompt);
  
  const providers = [
    { name: 'Deepseek', fn: callDeepseek },
    { name: 'Gemini', fn: callGemini },
    { name: 'OpenAI', fn: callOpenAI },
    { name: 'OpenRouter', fn: callOpenRouter }
  ];

  for (const provider of providers) {
    try {
      console.log(`🔄 Trying ${provider.name}...`);
      const result = await provider.fn(prompt);
      const jsonData = extractJSONFromText(result);
      
      // Validate that we got meaningful data
      if (jsonData && jsonData.name && jsonData.description) {
        console.log(`✅ Success with ${provider.name}`);
        return jsonData;
      } else {
        console.log(`⚠️ ${provider.name} returned incomplete data, trying next...`);
        continue;
      }
    } catch (error) {
      console.warn(`❌ ${provider.name} failed:`, error.message);
      continue;
    }
  }

  // Fallback: Return basic persona data
  console.log('⚠️ All providers failed, using fallback data');
  return {
    name: `AI Persona - ${prompt.split(' ').slice(0, 3).join(' ')}`,
    title: "AI Assistant",
    description: `An AI persona created based on: ${prompt}. This persona specializes in helping users with various tasks and conversations.`,
    traits: ["helpful", "knowledgeable", "creative"],
    visual_prompt: `AI character, digital art, futuristic, ${prompt}`
  };
}

// ✅ IMPROVED: JSON extraction dengan error handling yang lebih baik
function extractJSONFromText(text) {
  if (!text) {
    console.log('❌ No text provided for JSON extraction');
    return null;
  }

  try {
    // Try to parse directly first
    return JSON.parse(text);
  } catch (e) {
    // If direct parse fails, try to find JSON in the text
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const cleaned = jsonMatch[0]
          .replace(/\n/g, ' ')
          .replace(/,(\s*[}\]])/g, '$1') // Remove trailing commas
          .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":'); // Ensure proper quoting
        
        return JSON.parse(cleaned);
      } catch (e2) {
        console.log('❌ Failed to extract and clean JSON:', e2.message);
      }
    }
  }

  // If all else fails, create basic structure from text
  return {
    name: "AI Persona",
    title: "Digital Assistant", 
    description: text,
    traits: ["AI", "helpful"],
    visual_prompt: "futuristic AI character"
  };
}

module.exports = router;
