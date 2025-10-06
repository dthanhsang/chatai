const messagesEl = document.getElementById("messages");
const promptEl = document.getElementById("prompt");
const imageEl = document.createElement("input");
imageEl.type = "file";

const chatHistory = JSON.parse(localStorage.getItem("chatHistory") || "[]");

// Append image input below prompt
promptEl.parentNode.insertBefore(imageEl, promptEl.nextSibling);

function saveHistory() {
  localStorage.setItem("chatHistory", JSON.stringify(chatHistory));
}

function addMessage(msg) {
  const div = document.createElement("div");
  div.className = `message ${msg.type}`;
  if (msg.text) div.textContent = msg.text;
  if (msg.image) {
    const img = document.createElement("img");
    img.src = msg.image;
    img.style.maxWidth = "200px";
    img.style.borderRadius = "10px";
    div.appendChild(img);
  }
  messagesEl.appendChild(div);
  messagesEl.scrollTo({ top: messagesEl.scrollHeight, behavior: "smooth" });
}

// Load history
chatHistory.forEach(addMessage);

async function sendMessage() {
  const prompt = promptEl.value.trim();
  const file = imageEl.files[0];
  if (!prompt && !file) return;

  let base64 = null;
  if (file) base64 = await fileToBase64(file);

  const userMsg = { type: "user", text: prompt, image: base64 };
  addMessage(userMsg);
  chatHistory.push(userMsg);
  saveHistory();

  promptEl.value = "";
  imageEl.value = "";

  // Typing animation placeholder
  const typingDiv = document.createElement("div");
  typingDiv.className = "message bot typing";
  typingDiv.textContent = "Typing";
  messagesEl.appendChild(typingDiv);
  messagesEl.scrollTo({ top: messagesEl.scrollHeight, behavior: "smooth" });

  try {
    const res = await fetch("https://dthanhsang.netlify.app/.netlify/functions/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, image: base64 })
    });
    const data = await res.json();

    typingDiv.remove();
    const botText = data?.candidates?.[0]?.content?.[0]?.text || "No response";
    await showTypingAnimation(botText);

  } catch (err) {
    typingDiv.remove();
    const botMsg = { type: "bot", text: "Error connecting to Gemini", image: null };
    addMessage(botMsg);
    chatHistory.push(botMsg);
    saveHistory();
  }
}

async function showTypingAnimation(text) {
  const botDiv = document.createElement("div");
  botDiv.className = "message bot";
  messagesEl.appendChild(botDiv);

  for (let i = 0; i < text.length; i++) {
    botDiv.textContent += text[i];
    messagesEl.scrollTo({ top: messagesEl.scrollHeight, behavior: "smooth" });
    await new Promise(res => setTimeout(res, 30));
  }

  chatHistory.push({ type: "bot", text: text, image: null });
  saveHistory();
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = reject;
  });
}
