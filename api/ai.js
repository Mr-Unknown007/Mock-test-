export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const API_KEY = process.env.API_KEY;

    if (!API_KEY) {
      return res.status(500).json({ error: "API key missing" });
    }

    const { topic } = req.body || {};
    if (!topic) {
      return res.status(400).json({ error: "Topic required" });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Generate 5 MCQ questions on ${topic} with 4 options and correct answer. Return ONLY JSON array.`
                }
              ]
            }
          ]
        })
      }
    );

    const data = await response.json();

    console.log("FULL RESPONSE:", data); // debug

    // 🔥 FIX: safe extraction
    let text = "";

    if (data.candidates && data.candidates.length > 0) {
      const parts = data.candidates[0].content.parts;
      text = parts.map(p => p.text).join("");
    }

    if (!text) {
      return res.status(500).json({
        error: "AI response empty",
        raw: data
      });
    }

    // 🔥 JSON clean
    let json;
    try {
      json = JSON.parse(text);
    } catch {
      const cleaned = text.substring(
        text.indexOf("["),
        text.lastIndexOf("]") + 1
      );
      json = JSON.parse(cleaned);
    }

    res.status(200).json({ questions: json });

  } catch (err) {
    res.status(500).json({
      error: "Server error",
      details: err.message,
    });
  }
}
