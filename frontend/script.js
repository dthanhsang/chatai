async function sendMessage() {
  const input = document.getElementById("input").value;
  const messagesDiv = document.getElementById("messages");
  messagesDiv.innerHTML += `<div><b>You:</b> ${input}</div>`;

  const res = await fetch("http://localhost:3000/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt: input })
  });

  const data = await res.json();
  const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || "No reply";
  messagesDiv.innerHTML += `<div><b>Gemini:</b> ${reply}</div>`;
  document.getElementById("input").value = "";
}
