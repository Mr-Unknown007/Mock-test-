export default async function handler(req, res) {
  // CORS (important)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    // ✅ API KEY check
    const API_KEY = process.env.API_KEY;
    if (!API_KEY) {
      return res.status(500).json({ error: "API key missing" });
    }

    // ✅ Body parse
    const { topic } = req.body || {};
    if (!topic) {
      return res.status(400).json({ error: "Topic is required" });
    }

    // ✅ Gemini API call
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
                  text: `Generate 5 MCQ questions on ${topic} with 4 options each and correct answer. Format in JSON like:
[
 { "question": "", "options": ["", "", "", ""], "answer": "" }
]`,
                },
              ],
            },
          ],
        }),
      }
    );

    const data = await response.json();

    // ✅ response extract
    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response";

    res.status(200).json({ result: text });

  } catch (error) {
    res.status(500).json({
      error: "Server error",
      details: error.message,
    });
  }
}
