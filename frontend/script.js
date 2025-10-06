const messagesEl = document.getElementById("messages");
const promptEl = document.getElementById("prompt");
const imageEl = document.getElementById("image");
const sendBtn = document.getElementById("sendBtn");

const STORAGE_KEY = "chat_history";

// Load chat history
let chatHistory = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
chatHistory.forEach(msg => addMessage(msg));

sendBtn.addEventListener("click", sendMessage);

async function sendMessage() {
  const prompt = promptEl.value.trim();
  const file = imageEl.files[0];

  if (!prompt && !file) return;

  let base64 = null;
  if (file) base64 = await fileToBase64(file);

  // Add user message
  const userMsg = { type: "user", text: prompt, image: base64 };
  addMessage(userMsg);
  chatHistory.push(userMsg);
  saveHistory();

  promptEl.value = "";
  imageEl.value = "";

  // Send to backend
  try {
    const res = await fetch("/.netlify/functions/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, image: base64 })
    });

    const data = await res.json();

    const botText = data?.candidates?.[0]?.content?.[0]?.text || "No response";
    const botMsg = { type: "bot", text: botText, image: null };
    addMessage(botMsg);
    chatHistory.push(botMsg);
    saveHistory();

  } catch (err) {
    console.error(err);
    const botMsg = { type: "bot", text: "Error connecting to Gemini", image: null };
    addMessage(botMsg);
    chatHistory.push(botMsg);
    saveHistory();
  }
}

function addMessage(msg) {
  const div = document.createElement("div");
  div.className = `message ${msg.type}`;
  if (msg.text) div.textContent = msg.text;
  if (msg.image) {
    const img = document.createElement("img");
    img.src = `data:image/png;base64,${msg.image}`;
    div.appendChild(img);
  }
  messagesEl.appendChild(div);
  messagesEl.scrollTo({ top: messagesEl.scrollHeight, behavior: "smooth" });
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = reject;
  });
}

function saveHistory() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(chatHistory));
}
