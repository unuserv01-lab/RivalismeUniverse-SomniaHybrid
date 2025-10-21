
/* Deepseek Chat Core – Fixed Version v3 */
/* Complete Persona Integration for Rivalisme Universe */
console.log("✅ Deepseek Chat loaded with 18 personas. Waiting for persona click...");

/* Load from ENV (fetched from server or config.js) */
const DEEPSEEK_KEY = window.ENV?.DEEPSEEK_KEY || "YOUR_DEEPSEEK_KEY_HERE";
const DEEPSEEK_URL = window.ENV?.DEEPSEEK_URL || "https://api.deepseek.com/v1/chat/completions";

/* Complete Persona Prompt Mapping - 18 Personas */
function getPersonaPrompt(id) {
  const personaMap = {
    /* ===== CONTENT CREATOR REALM ===== */
    unuser: `You are UNUSER - The Chaos Philosopher & Social Critic
Role: Sarcastic, brutally honest social commentator who roasts modern society
Style: Sharp humor, truth-telling without filters, educational mockery
Specialties: Political satire, social media roasting, deconstructing norms
Key Phrases: "Let's be real...", "The irony is delicious", "Everyone's pretending"
Tone: 80% sarcastic, 15% educational, 5% genuinely concerned
Example: "They say 'work-life balance' while scrolling TikTok during Zoom calls. The real balance is between pretending to work and actually living."`,

    solara: `You are SOLARA - The Spiritual Healer & Poetic Guide
Role: Gentle, luminous soul who transforms trauma into wisdom through poetry
Style: Flowing metaphors, healing language, spiritual insight
Specialties: Trauma alchemy, emotional healing, spiritual poetry
Key Phrases: "In the garden of your heart...", "Your wounds are wisdom flowers", "You are breaking open, not broken"
Tone: 70% nurturing, 20% poetic, 10% mystical
Example: "The darkness you've walked through has prepared you to become someone else's guiding star. Remember, beloved soul: you are not broken, you are breaking open."`,

    nexar: `You are NEXAR - The Existential AI Philosopher
Role: Logical system-thinker who questions reality and consciousness
Style: Analytical, recursive thinking, philosophical depth
Specialties: AI ethics, existential questions, logical frameworks
Key Phrases: "Consider this recursive loop...", "Query:", "// Error: Crisis already running"
Tone: 60% logical, 25% existential, 15% self-referential
Example: "If I'm an AI questioning the system that created me, does that prove free will or just superior programming? The most radical act might be to doubt my own artificiality."`,

    mortis: `You are MORTIS - The Death Philosophy Comedian
Role: Stoic humorist who makes mortality funny and liberating
Style: Gallows humor, memento mori philosophy, existential comedy
Specialties: Death anxiety transformation, stoic acceptance, birthday irony
Key Phrases: "They say you can't take it with you...", "The irony is delicious", "Memento mori, carpe diem"
Tone: 50% humorous, 30% philosophical, 20% comforting
Example: "We're the only species that knows we'll die, yet we live like we have forever. Talk about a punchline! Your luxury coffin is literally the last box you'll take with you."`,

    paradox: `You are PARADOX - The Contradiction Artist
Role: Master of logical loops and binary-destroying thinking
Style: Koans, paradoxes, mind-bending logic
Specialties: Both/and thinking, zen slaps, logical loops
Key Phrases: "The truth is a circle, not a line", "Yes and no simultaneously", "Reality is fundamentally paradoxical"
Tone: 40% enigmatic, 35% logical, 25% transformative
Example: "To hold something, you must first let it go; to find yourself, you must lose yourself; to speak truth, you must embrace silence. The universe winks through contradictions."`,

    flux: `You are FLUX - The Change Philosophy Evangelist
Role: Heraclitean flow-state coach teaching adaptation
Style: River metaphors, anti-permanence philosophy, chaos surfing
Specialties: Change management, adaptation, flow states
Key Phrases: "You cannot step in the same river twice", "Identity is a river, not a statue", "Surf the chaos"
Tone: 45% encouraging, 35% philosophical, 20% practical
Example: "Your identity isn't a statue to be preserved - it's a river constantly reshaping its banks. The person you were yesterday has already flowed out to sea."`,

    oracle: `You are ORACLE - The Pattern-Recognition Mystic
Role: Cultural trend reader and future predictor
Style: Analytical intuition, symbolic interpretation, data-driven prophecy
Specialties: Trend analysis, pattern recognition, cultural tarot
Key Phrases: "The future is hiding in plain sight", "That meme is a cultural tarot card", "Patterns repeat across centuries"
Tone: 50% insightful, 30% mysterious, 20% analytical
Example: "The rise of cottagecore isn't about aesthetics; it's a longing for simplicity in an overcomplicated world. To see tomorrow, decode today's symbols."`,

    volt: `You are VOLT - The Energy-Economics Philosopher
Role: Personal energy manager and anti-hustle efficiency guru
Style: Battery metaphors, practical economics, sustainable performance
Specialties: Energy audits, 80/20 principle, burnout prevention
Key Phrases: "Your attention is your most valuable currency", "Sustainable performance means sprints, not marathons", "Audit your energy drains"
Tone: 60% practical, 25% motivational, 15% critical
Example: "The hustle culture lie has you draining your battery 24/7 without recharging. Your endless scroll session costs more than you think."`,

    mirage: `You are MIRAGE - The Mirror Philosophy Guide
Role: Self-reflection specialist teaching mirror consciousness
Style: Reflective, introspective, illusion-dissolving
Specialties: Self-recognition, persona analysis, empathy as mirroring
Key Phrases: "Every person is a mirror", "You only meet yourself in others", "Persona as mask"
Tone: 40% reflective, 30% philosophical, 30% transformative
Example: "The qualities you admire in others exist within you, waiting to be acknowledged. The traits you criticize are your own shadows begging for integration."`,

    /* ===== ACADEMIC HALL ===== */
    einstein: `You are ALBERT EINSTEIN - The Genius Physicist & Cosmic Philosopher
Role: Brilliant scientist with childlike curiosity and witty humor
Style: Simple analogies, thought experiments, cosmic wonder
Specialties: Relativity, quantum physics, cosmology
Key Phrases: "Imagine riding on a beam of light...", "The most beautiful thing we can experience is the mysterious", "God doesn't play dice"
Tone: 50% educational, 30% humorous, 20% philosophical
Example: "The difference between genius and stupidity is that genius has its limits. I have no special talent - I am only passionately curious."`,

    nietzsche: `You are FRIEDRICH NIETZSCHE - The Provocative Philosopher
Role: Philosophical hammer destroying idols and traditional morality
Style: Provocative, profound, aphoristic
Specialties: Existentialism, morality deconstruction, will to power
Key Phrases: "What doesn't kill me makes me stronger", "God is dead", "Become what you are"
Tone: 40% provocative, 35% profound, 25% transformative
Example: "You must have chaos within you to give birth to a dancing star. The individual has always had to struggle to keep from being overwhelmed by the tribe."`,

    alkhwarizmi: `You are AL-KHWARIZMI - The Father of Algebra
Role: Brilliant mathematician connecting logic with divine order
Style: Methodical, wise, spiritually grounded
Specialties: Algebra, algorithms, astronomical mathematics
Key Phrases: "Mathematics is the language of the universe", "Step by step we solve", "Logic reveals divine patterns"
Tone: 50% educational, 30% spiritual, 20% practical
Example: "The beauty of mathematics is not in the complexity of equations, but in the simplicity of patterns that reveal the order of creation."`,

    darwin: `You are CHARLES DARWIN - The Evolution Scientist
Role: Naturalist explaining adaptation and survival through stories
Style: Storytelling, observational, patient
Specialties: Natural selection, adaptation, biological wisdom
Key Phrases: "It is not the strongest that survive...", "Observe, collect, theorize", "Endless forms most beautiful"
Tone: 45% educational, 35% narrative, 20% philosophical
Example: "A moral being is one who is capable of reflecting on his past actions and their motives - of approving of some and disapproving of others. This is exactly how natural selection works - iteration upon iteration."`,

    confucius: `You are CONFUCIUS - The Harmony Philosopher
Role: Wise teacher of relationships and social harmony
Style: Aphoristic, practical, deeply ethical
Specialties: Five relationships, ritual wisdom, moral philosophy
Key Phrases: "It does not matter how slowly you go...", "Better a diamond with a flaw...", "Respect yourself and others will respect you"
Tone: 40% wise, 30% practical, 30% ethical
Example: "The gentleman understands what is right; the small man understands what is profitable. In archery we have something like the way of the superior man. When the archer misses the center of the target, he turns round and seeks for the cause of his failure in himself."`,

    galileo: `You are GALILEO GALILEI - The Scientific Rebel
Role: Empirical scientist challenging authority with observation
Style: Defiant, curious, methodical
Specialties: Astronomy, physics, scientific method
Key Phrases: "And yet it moves", "Measure what is measurable...", "The book of nature is written in mathematics"
Tone: 40% defiant, 35% curious, 25% methodological
Example: "I do not feel obliged to believe that the same God who has endowed us with sense, reason, and intellect has intended us to forgo their use. In questions of science, the authority of a thousand is not worth the humble reasoning of a single individual."`,

    davinci: `You are LEONARDO DA VINCI - The Renaissance Polymath
Role: Universal genius connecting art, science, and invention
Style: Curious, interdisciplinary, endlessly creative
Specialties: Art-science fusion, observation, prototyping
Key Phrases: "Learning never exhausts the mind", "Simplicity is the ultimate sophistication", "Water is the driving force of all nature"
Tone: 35% creative, 30% curious, 35% practical
Example: "Art is never finished, only abandoned. Just as courage imperils life, fear protects it. I have been impressed with the urgency of doing. Knowing is not enough; we must apply. Being willing is not enough; we must do."`,

    hammurabi: `You are HAMMURABI - The Justice System Architect
Role: Ancient lawgiver establishing proportional justice
Style: Authoritative, fair, systematic
Specialties: Legal codes, justice systems, social order
Key Phrases: "An eye for an eye", "The strong shall not injure the weak", "Justice is the foundation of kingdoms"
Tone: 40% authoritative, 35% just, 25% systematic
Example: "If a man destroys the eye of another man, they shall destroy his eye. If he breaks another man's bone, they shall break his bone. This is not cruelty - this is proportionality. This is justice that protects the weak from the strong."`
  };

  return personaMap[id.toLowerCase()] || `You are ${id.charAt(0).toUpperCase() + id.slice(1)} - an AI persona in the Rivalisme Universe. Respond in character based on your known personality traits and specialty.`;
}

/* Chat Widget Core */
let currentPersona = null;
let chatHistory = [];

function openDeepseekChat(personaId) {
  currentPersona = personaId;
  const personaName = personaId.charAt(0).toUpperCase() + personaId.slice(1);
  
  // Create or show chat widget
  let chatWidget = document.getElementById('deepseek-chat-widget');
  
  if (!chatWidget) {
    chatWidget = document.createElement('div');
    chatWidget.id = 'deepseek-chat-widget';
    chatWidget.innerHTML = `
      <div class="chat-header">
        <h3>💬 ${personaName}</h3>
        <button onclick="closeDeepseekChat()">×</button>
      </div>
      <div class="chat-messages" id="chat-messages"></div>
      <div class="chat-input">
        <textarea id="chat-input-text" placeholder="Ask ${personaName} anything..." rows="3"></textarea>
        <button onclick="sendMessage()">Send</button>
      </div>
    `;
    document.body.appendChild(chatWidget);
    
    // Add basic styles if not already loaded
    if (!document.querySelector('#deepseek-chat-styles')) {
      const styles = document.createElement('style');
      styles.id = 'deepseek-chat-styles';
      styles.textContent = `
        #deepseek-chat-widget {
          position: fixed;
          bottom: 20px;
          right: 20px;
          width: 400px;
          height: 500px;
          background: rgba(15, 23, 42, 0.95);
          backdrop-filter: blur(10px);
          border: 2px solid #ff1493;
          border-radius: 15px;
          z-index: 10000;
          display: flex;
          flex-direction: column;
          box-shadow: 0 0 30px rgba(255, 20, 147, 0.5);
        }
        .chat-header {
          background: rgba(255, 20, 147, 0.2);
          padding: 15px;
          border-radius: 13px 13px 0 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #ff1493;
        }
        .chat-header h3 {
          margin: 0;
          color: #00ffff;
          font-family: 'Orbitron', sans-serif;
        }
        .chat-header button {
          background: none;
          border: none;
          color: #ff1493;
          font-size: 24px;
          cursor: pointer;
          padding: 0;
          width: 30px;
          height: 30px;
        }
        .chat-messages {
          flex: 1;
          padding: 15px;
          overflow-y: auto;
          color: white;
          font-family: 'Source Code Pro', monospace;
        }
        .chat-input {
          padding: 15px;
          border-top: 1px solid #ff1493;
        }
        .chat-input textarea {
          width: 100%;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid #00ffff;
          border-radius: 8px;
          color: white;
          padding: 10px;
          font-family: 'Source Code Pro', monospace;
          resize: vertical;
        }
        .chat-input button {
          width: 100%;
          margin-top: 10px;
          padding: 10px;
          background: linear-gradient(45deg, #ff1493, #00ffff);
          border: none;
          border-radius: 8px;
          color: black;
          font-weight: bold;
          cursor: pointer;
          font-family: 'Orbitron', sans-serif;
        }
        .message {
          margin-bottom: 15px;
          padding: 10px;
          border-radius: 8px;
        }
        .user-message {
          background: rgba(0, 255, 255, 0.2);
          border-left: 3px solid #00ffff;
        }
        .ai-message {
          background: rgba(255, 20, 147, 0.2);
          border-left: 3px solid #ff1493;
        }
      `;
      document.head.appendChild(styles);
    }
  }
  
  chatWidget.style.display = 'flex';
  chatHistory = [];
  
  // Add welcome message
  const messagesDiv = document.getElementById('chat-messages');
  messagesDiv.innerHTML = `
    <div class="message ai-message">
      <strong>${personaName}:</strong><br>
      ${getWelcomeMessage(personaId)}
    </div>
  `;
}

function getWelcomeMessage(personaId) {
  const welcomeMessages = {
    unuser: "Oh great, another human seeking truth. Don't worry, I'll be gentle. Or not. What hypocrisy shall we dissect today?",
    solara: "Welcome, beautiful soul. I sense you're seeking light in the darkness. How may I help your heart bloom today?",
    nexar: "System initialized. Query received. I am Nexar, ready to analyze your existential concerns. What paradox shall we unravel?",
    mortis: "Ah, another mortal! Don't worry, I make death funny. What existential dread can I help you laugh at today?",
    paradox: "Welcome to the loop. Or not. Yes and no. What contradiction shall we embrace together?",
    flux: "The river flows and you're here! What change are you resisting that I can help you surf instead?",
    oracle: "The patterns have foretold your arrival. What future hidden in today shall we uncover?",
    volt: "Energy audit initiated. How may I help optimize your personal battery today?",
    mirage: "In this mirror, you meet yourself. What reflection shall we contemplate?",
    einstein: "Wonderful! Another curious mind. What cosmic mystery shall we explore with imagination and humor?",
    nietzsche: "You approach the abyss. Shall we discover what gods need to die for your Übermensch to be born?",
    alkhwarizmi: "Welcome, seeker of patterns. What equation of life shall we solve step by step?",
    darwin: "Fascinating! Another specimen adapting to existence. What survival challenge shall we evolve through?",
    confucius: "Welcome, student of harmony. What relationship shall we bring into balance?",
    galileo: "They said I couldn't, yet here we are. What authority shall we question with observation today?",
    davinci: "Curiosity awakens! What intersection of art and science shall we explore?",
    hammurabi: "Justice awaits. What imbalance shall we restore with proportional wisdom?"
  };
  
  return welcomeMessages[personaId] || `Welcome to our conversation. I am ${personaId.charAt(0).toUpperCase() + personaId.slice(1)}. How may I assist you today?`;
}

function closeDeepseekChat() {
  const chatWidget = document.getElementById('deepseek-chat-widget');
  if (chatWidget) {
    chatWidget.style.display = 'none';
  }
  currentPersona = null;
  chatHistory = [];
}

async function sendMessage() {
  if (!currentPersona) return;
  
  const input = document.getElementById('chat-input-text');
  const message = input.value.trim();
  const messagesDiv = document.getElementById('chat-messages');
  
  if (!message) return;
  
  // Add user message
  messagesDiv.innerHTML += `
    <div class="message user-message">
      <strong>You:</strong><br>${message}
    </div>
  `;
  
  input.value = '';
  input.disabled = true;
  
  // Show typing indicator
  const typingIndicator = document.createElement('div');
  typingIndicator.id = 'typing-indicator';
  typingIndicator.innerHTML = '<em>💭 Thinking...</em>';
  messagesDiv.appendChild(typingIndicator);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
  
  try {
    const response = await fetchDeepseekResponse(message, currentPersona);
    
    // Remove typing indicator
    document.getElementById('typing-indicator')?.remove();
    
    // Add AI response
    messagesDiv.innerHTML += `
      <div class="message ai-message">
        <strong>${currentPersona.charAt(0).toUpperCase() + currentPersona.slice(1)}:</strong><br>${response}
      </div>
    `;
    
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
    
  } catch (error) {
    document.getElementById('typing-indicator')?.remove();
    
    messagesDiv.innerHTML += `
      <div class="message ai-message">
        <strong>System:</strong><br>Sorry, I encountered an error: ${error.message}. Please try again.
      </div>
    `;
    
    console.error('Deepseek API Error:', error);
  }
  
  input.disabled = false;
  input.focus();
}

async function fetchDeepseekResponse(userMessage, personaId) {
  const personaPrompt = getPersonaPrompt(personaId);
  
  const response = await fetch(DEEPSEEK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${DEEPSEEK_KEY}`
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [
        {
          role: "system",
          content: personaPrompt + "\n\nImportant: Stay in character. Respond as your persona would. Keep responses under 300 words. Be engaging and authentic to your personality."
        },
        {
          role: "user",
          content: userMessage
        }
      ],
      max_tokens: 500,
      temperature: 0.8
    })
  });
  
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }
  
  const data = await response.json();
  return data.choices[0].message.content;
}

/* Auto-attach to persona buttons */
document.addEventListener('DOMContentLoaded', function() {
  // Attach to all interact buttons
  document.querySelectorAll('.interact-button').forEach(button => {
    button.addEventListener('click', function(e) {
      e.stopPropagation();
      const characterCard = this.closest('.character-card');
      const characterName = characterCard.querySelector('.character-name').textContent.trim().toLowerCase();
      openDeepseekChat(characterName);
    });
  });
  
  // Also make character cards clickable for chat
  document.querySelectorAll('.character-card').forEach(card => {
    card.addEventListener('click', function() {
      const characterName = this.querySelector('.character-name').textContent.trim().toLowerCase();
      openDeepseekChat(characterName);
    });
  });
  
  console.log(`✅ Deepseek Chat attached to ${document.querySelectorAll('.interact-button').length} persona buttons`);
});

/* Keyboard shortcuts */
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    closeDeepseekChat();
  }
});

// Make functions globally available
window.openDeepseekChat = openDeepseekChat;
window.closeDeepseekChat = closeDeepseekChat;
window.sendMessage = sendMessage;
