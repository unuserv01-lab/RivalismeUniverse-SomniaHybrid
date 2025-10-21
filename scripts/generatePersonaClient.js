// scripts/generatePersonaClient.js
async function generatePersonaClientFlow() {
  const promptText = prompt('Hy, who do you want me to be today? Describe briefly:');
  if (!promptText) return alert('No prompt provided.');

  try {
    const btn = document.getElementById('generateButton');
    if (btn) { btn.innerText = 'Generating...'; btn.disabled = true; }

    const resp = await fetch('/api/generate-persona', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: promptText })
    });

    if (!resp.ok) {
      const e = await resp.json().catch(()=>({error:'unknown'}));
      throw new Error(e.error || 'Server error');
    }

    const data = await resp.json();
    const persona = data.persona || {};
    const name = persona.name || 'Unnamed';
    const title = persona.title || '';
    const desc = persona.description || '';
    const image = data.imageUrl || persona.image || './assets/placeholder.jpg';
    const ipfs = data.ipfsUrl || '#';

    const cardHTML = `
      <div class="persona-card">
        <img src="${image}" alt="${name}" />
        <h3>${name}</h3>
        <p>${title}</p>
        <p>${desc}</p>
        <small><a href="${ipfs}" target="_blank">View on IPFS</a></small>
      </div>
    `;

    const queue = JSON.parse(localStorage.getItem('newPersonaCards') || '[]');
    queue.push(cardHTML);
    localStorage.setItem('newPersonaCards', JSON.stringify(queue));

    alert(`Persona "${name}" generated. Open Personas page to see it.`);
  } catch (err) {
    console.error(err);
    alert('Failed to generate persona: ' + err.message);
  } finally {
    const btn = document.getElementById('generateButton');
    if (btn) { btn.innerText = 'Generate Persona'; btn.disabled = false; }
  }
}

window.generatePersonaClientFlow = generatePersonaClientFlow;
