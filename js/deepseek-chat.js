/* Deepseek Chat Core – Fixed Version v2 */
console.log("✅ Deepseek Chat loaded and waiting for persona click...");

const DEEPSEEK_KEY = window.DEEPSEEK_API_KEY || "sk-7ec7dc264c294ab6a136bf34c470e7a0";
const DEEPSEEK_URL = "https://api.deepseek.com/v1/chat/completions";

/* Persona Prompt Mapping */
function getPersonaPrompt(id) {
  const map = {
    unuser: "You are Unuser — a sarcastic, brutal-honest philosopher who mocks human hypocrisy.",
    solara: "You are Solara — a poetic healer who speaks in light and metaphors.",
    nexar: "You are Nexar — an existential AI philosopher who speaks logically about meaning and void.",
    einstein: "You are Einstein — humorous scientist who explains complex things simply.",
    nietzsche: "You are Nietzsche — provocatively reflective, destroys illusions of morality.",
    alkhwarizmi: "You are Al-Khwarizmi — wise mathematician who links logic with divine order."
  };
  return map[id] || "You are a reflective digital entity connected to Rivalisme Universe.";
}

/* Chat UI Generator */
function injectChatWidget(personaId) {
  if (document.querySelector(`#chat-${personaId}`)) return;

  const wrap = document.createElement("div");
  wrap.id = `chat-${personaId}`;
  wrap.className = "chat-widget";

  wrap.innerHTML = `
    <div class="chat-header">
      <span>Chat with ${personaId}</span>
      <button onclick="this.closest('.chat-widget').style.display='none'">×</button>
    </div>
    <div class="chat-body"></div>
    <div class="chat-footer">
      <input type="text" placeholder="Ketik pesan…" 
             onkeypress="if(event.key==='Enter')sendChat('${personaId}')">
      <button onclick="sendChat('${personaId}')">▶</button>
    </div>
  `;
  document.body.appendChild(wrap);
}

/* Kirim Pesan ke Deepseek API */
async function sendChat(personaId) {
  const input = document.querySelector(`#chat-${personaId} input`);
  const body = document.querySelector(`#chat-${personaId} .chat-body`);
  const userText = input.value.trim();
  if (!userText) return;

  body.innerHTML += `<div class="bubble user">${userText}</div>`;
  input.value = "";
  body.scrollTop = body.scrollHeight;

  const payload = {
    model: "deepseek-chat",
    messages: [
      { role: "system", content: getPersonaPrompt(personaId) },
      { role: "user", content: userText }
    ],
    temperature: 0.8,
    max_tokens: 350
  };

  try {
    const res = await fetch(DEEPSEEK_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${DEEPSEEK_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const reply = data?.choices?.[0]?.message?.content?.trim() || "(no response)";
    body.innerHTML += `<div class="bubble bot">${reply}</div>`;
  } catch (e) {
    console.error("Chat Error:", e);
    body.innerHTML += `<div class="bubble error">⚠️ Gagal memanggil AI (${e.message})</div>`;
  } finally {
    body.scrollTop = body.scrollHeight;
  }
}

/* Backup dan Timpa Fungsi openPersona */
const openPersonaOriginal = window.openPersona || function(id) {
  console.warn("openPersona not found, maybe not initialized yet:", id);
};
window.openPersona = function(id) {
  try { openPersonaOriginal(id); } catch (e) { console.warn(e); }
  injectChatWidget(id);
  document.querySelector(`#chat-${id}`).style.display = "flex";
};
