/* Deepseek Chat Core – drop-in untuk personas.html & 3D.html */
const DEEPSEEK_KEY = '%%DEEPSEEK_KEY%%'; // kita replace otomatis saat build/CI
const DEEPSEEK_URL = 'https://api.deepseek.com/v1/chat/completions';

/* UI element generator (minimal) */
function injectChatWidget(personaId) {
  const wrap = document.createElement('div');
  wrap.id = `chat-${personaId}`;
  wrap.className = 'chat-widget';
  wrap.innerHTML = `
    <div class="chat-header">
      <span>Chat with ${personaId}</span>
      <button onclick="this.closest('.chat-widget').style.display='none'">×</button>
    </div>
    <div class="chat-body"></div>
    <div class="chat-footer">
      <input type="text" placeholder="Ketik pesan…" onkeypress="if(event.key==='Enter')sendChat('${personaId}')">
      <button onclick="sendChat('${personaId}')">▶</button>
    </div>`;
  document.body.appendChild(wrap);
}

/* Kirim pesan ke Deepseek */
async function sendChat(personaId) {
  const input = document.querySelector(`#chat-${personaId} input`);
  const body = document.querySelector(`#chat-${personaId} .chat-body`);
  const userText = input.value.trim();
  if (!userText) return;

  // tampilkan bubble user
  body.innerHTML += `<div class="bubble user">${userText}</div>`;
  input.value = '';
  body.scrollTop = body.scrollHeight;

  // siapkan prompt khas tiap tokoh (lihat langkah 3)
  const systemPrompt = getPersonaPrompt(personaId);
  const payload = {
    model: 'deepseek-chat',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user',   content: userText }
    ],
    temperature: 0.8,
    max_tokens: 350
  };

  try {
    const res = await fetch(DEEPSEEK_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DEEPSEK_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    const reply = data.choices[0].message.content.trim();

    body.innerHTML += `<div class="bubble bot">${reply}</div>`;
    body.scrollTop = body.scrollHeight;
  } catch (e) {
    body.innerHTML += `<div class="bubble error">⚠️ Gagal memanggil AI</div>`;
  }
}

/* Prompt engine sederhana */
function getPersonaPrompt(id) {
  const map = {
    unuser:  'You are Unuser. Sarcastic, brutal-honest social critic. Answer 1 short paragraph, roast when appropriate.',
    solara:  'You are Solara. Spiritual, poetic healer. Reply with gentle metaphor and hope.',
    nexar:   'You are Nexar. Logical, existential AI philosopher. Use structured reasoning.',
    einstein:'You are Einstein. Explain science simply, add humor, 1 paragraph.',
    nietzsche:'You are Nietzsche. Provocative, aphoristic, destroy comfortable illusions.',
    alkhwarizmi:'You are Al-Khwarizmi. Teach math historically, connect to wisdom.',
    // tambahkan sisanya …
  };
  return map[id] || 'You are a helpful assistant.';
}

/* Auto-inject widget saat card persona diklik */
window.openPersona = function(id){          // timpa fungsi lama tanpa rusak
  openPersonaOriginal(id);                 // panggil fungsi asli (globe→card)
  if(!document.querySelector(`#chat-${id}`)) injectChatWidget(id);
  document.querySelector(`#chat-${id}`).style.display='flex';
};
/* Simpan fungsi asli supaya globe tetap jalan */
const openPersonaOriginal = openPersona;
