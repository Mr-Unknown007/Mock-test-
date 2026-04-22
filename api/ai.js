export default async function handler(req, res) {
  try {
    const { topic } = req.body;

    if (!topic) {
      return res.status(400).json({ error: "Topic missing" });
    }

    const API_KEY = process.env.GEMINI_API_KEY;

    if (!API_KEY) {
      return res.status(500).json({ error: "API key missing" });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Generate 5 MCQ questions on ${topic}.
Return JSON like:
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

    console.log("FULL RESPONSE:", JSON.stringify(data));

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      return res.status(500).json({ error: "AI response empty", full: data });
    }

    res.status(200).json({ result: text });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
