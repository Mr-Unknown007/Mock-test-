export default async function handler(req, res) {
  try {
    const { topic } = req.body;

    if (!topic) {
      return res.status(400).json({ error: "Topic missing" });
    }

    if (!process.env.API_KEY) {
      return res.status(500).json({ error: "API key missing" });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Generate 10 MCQs on ${topic}.
Return ONLY JSON:
[
 {"q":"question","o":["A","B","C","D"],"a":0,"topic":"concept"}
]`
            }]
          }]
        })
      }
    );

    const data = await response.json();

    if (!data) {
      return res.status(500).json({ error: "No response from AI" });
    }

    return res.status(200).json(data);

  } catch (err) {
    return res.status(500).json({
      error: "Server error",
      details: err.message
    });
  }
}
