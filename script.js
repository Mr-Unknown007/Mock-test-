async function generateAI(){

  const topic = document.getElementById("topic").value;

  const res = await fetch("/.netlify/functions/ai", {
    method: "POST",
    body: JSON.stringify({ topic })
  });

  const data = await res.json();

  let text = data.candidates[0].content.parts[0].text;

  text = text.replace(/```json|```/g,"").trim();

  const questions = JSON.parse(text);

  alert("Questions generated successfully!");
}
