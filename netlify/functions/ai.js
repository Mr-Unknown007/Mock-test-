exports.handler = async (event) => {

  const { topic } = JSON.parse(event.body);

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Generate 20 MCQs on ${topic}.
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

  return {
    statusCode: 200,
    body: JSON.stringify(data)
  };
};
