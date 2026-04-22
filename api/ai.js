export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
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

    // ✅ NEW WORKING ENDPOINT (IMPORTANT)
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
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
                  text: `Generate 5 MCQ questions on ${topic}. 
Return ONLY JSON like:
[
{"question":"...","options":["A","B","C","D"],"answer":"A"}
]`
                }
              ]
            }
          ]
        })
      }
    );

    const data = await response.json();

    // 🔥 DEBUG (important)
    console.log("Gemini RAW:", JSON.stringify(data));

    // ✅ SAFE EXTRACT
    let text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      return res.status(500).json({
        error: "AI response empty",
        raw: data
      });
    }

    // ✅ CLEAN JSON
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
      details: err.message
    });
  }
}
