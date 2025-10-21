require('dotenv').config();
const fetch = require('node-fetch');

const DEEPSEEK_KEY = process.env.DEEPSEEK_KEY || '';
const GEMINI_KEY = process.env.GEMINI_API_KEY || '';
const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY || '';

async function callDeepseek(prompt) {
  if (!DEEPSEEK_KEY) throw new Error('Deepseek key not configured');
  // Example Deepseek proxy endpoint - adapt if your Deepseek endpoint differs
  const url = process.env.DEEPSEEK_URL || 'https://api.deepseek.example/v1/generate';
  const body = { prompt: prompt, format: 'json' };
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${DEEPSEEK_KEY}` },
    body: JSON.stringify(body)
  });

  if (!r.ok) throw new Error('Deepseek error: ' + await r.text());
  const data = await r.json();
  return data.text || JSON.stringify(data);
}

async function callGemini(prompt) {
  if (!GEMINI_KEY) throw new Error('Gemini key not configured');
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_KEY}`;
  const body = { contents: [{ parts: [{ text: `Return ONLY a JSON object with keys: name, title, description, traits (array), visual_prompt. Persona concept: ${prompt}` }] }] };
  const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  if (!r.ok) throw new Error('Gemini error: ' + await r.text());
  const data = await r.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  return text;
}

async function callOpenRouter(prompt) {
  if (!OPENROUTER_KEY) throw new Error('OpenRouter key not configured');
  const url = process.env.OPENROUTER_URL || 'https://api.openrouter.ai/v1/chat/completions';
  const body = { model: 'gpt-4o-mini', messages: [{ role: 'user', content: `Return ONLY a JSON object with keys: name, title, description, traits (array), visual_prompt. Persona concept: ${prompt}` }] };
  const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${OPENROUTER_KEY}` }, body: JSON.stringify(body) });
  if (!r.ok) throw new Error('OpenRouter error: ' + await r.text());
  const data = await r.json();
  // Adjust extraction depending on OpenRouter response shape
  const text = data?.choices?.[0]?.message?.content || JSON.stringify(data);
  return text;
}

async function generatePersonaJSON(prompt) {
  // Try Deepseek → Gemini → OpenRouter
  let lastErr = null;
  try {
    const text = await callDeepseek(prompt);
    return extractJSONFromText(text);
  } catch (e) {
    lastErr = e;
    console.warn('Deepseek failed:', e.message);
  }

  try {
    const text = await callGemini(prompt);
    return extractJSONFromText(text);
  } catch (e) {
    lastErr = e;
    console.warn('Gemini failed:', e.message);
  }

  try {
    const text = await callOpenRouter(prompt);
    return extractJSONFromText(text);
  } catch (e) {
    lastErr = e;
    console.warn('OpenRouter failed:', e.message);
  }

  throw new Error('All AI providers failed. Last error: ' + (lastErr && lastErr.message));
}

function extractJSONFromText(text) {
  if (!text) return {};
  const m = text.match(/\{[\s\S]*\}/);
  if (!m) {
    // try to interpret as plain text description
    return { name: null, title: null, description: text, traits: [], visual_prompt: '' };
  }
  try {
    return JSON.parse(m[0]);
  } catch (e) {
    // malformed JSON — attempt simple fixes
    const cleaned = m[0].replace(/\n/g, ' ').replace(/,\s*}/g, '}').replace(/,\s*\]/g, ']');
    try { return JSON.parse(cleaned); } catch (e2) { return { name: null, title: null, description: text, traits: [], visual_prompt: '' }; }
  }
}

module.exports = { generatePersonaJSON };
