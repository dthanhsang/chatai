const messagesDiv = document.getElementById("messages");

// Load chat history
let chatHistory = JSON.parse(localStorage.getItem("chatHistory") || "[]");
chatHistory.forEach(msg => addMessage(msg, msg.sender));

async function sendMessage() {
  const promptInput = document.getElementById("prompt");
  const imageInput = document.getElementById("image");
  const prompt = promptInput.value.trim();
  const imageFile = imageInput.files[0];

  if (!prompt && !imageFile) return;

  // User message
  const userMessage = { text: prompt, image: imageFile ? URL.createObjectURL(imageFile) : null };
  addMessage(userMessage, "user");
  chatHistory.push({ ...userMessage, sender: "user" });
  localStorage.setItem("chatHistory", JSON.stringify(chatHistory));

  promptInput.value = "";
  imageInput.value = "";

  let base64 = null;
  if (imageFile) {
    base64 = await fileToBase64(imageFile);
  }

  try {
    const res = await fetch("/.netlify/functions/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, image: base64 })
    });
    const data = await res.json();
    const botText = data?.candidates?.[0]?.content?.[0]?.text || "No response";
    const botImage = data?.candidates?.[0]?.content?.[0]?.image?.url || null;

    const botMessage = { text: botText, image: botImage };
    addMessage(botMessage, "bot");
    chatHistory.push({ ...botMessage, sender: "bot" });
    localStorage.setItem("chatHistory", JSON.stringify(chatHistory));
  } catch (err) {
    console.error(err);
    addMessage({ text: "Error: Cannot reach server" }, "bot");
  }
}

function addMessage(msg, sender) {
  const div = document.createElement("div");
  div.classList.add("message", sender);

  if (msg.text) div.textContent = msg.text;
  if (msg.image) {
    const img = document.createElement("img");
    img.src = msg.image;
    div.appendChild(img);
  }

  messagesDiv.appendChild(div);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = reject;
  });
}

