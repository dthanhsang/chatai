import fetch from "node-fetch";

export async function handler(event) {
  const { prompt, image } = JSON.parse(event.body);

  const contents = [{ parts: [{ text: prompt }] }];
  if (image) {
    contents.push({ parts: [{ image: { type: "base64", data: image } }] });
  }

  const response = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-goog-api-key": process.env.GEMINI_KEY
      },
      body: JSON.stringify({ contents })
    }
  );

  const data = await response.json();
  return {
    statusCode: 200,
    body: JSON.stringify(data)
  };
}
