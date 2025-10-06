async function sendMessage() {
  const prompt = document.getElementById("prompt").value;
  const imageFile = document.getElementById("image").files[0];

  let base64 = null;
  if (imageFile) {
    base64 = await fileToBase64(imageFile);
  }

  const res = await fetch("/.netlify/functions/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, image: base64 })
  });

  const data = await res.json();
  console.log(data);
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = reject;
  });
}
