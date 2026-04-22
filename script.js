async function generateAI() {
  const topic = document.getElementById("topic").value;

  if (!topic) {
    alert("Enter topic first");
    return;
  }

  document.getElementById("quiz").innerHTML = "Loading questions... ⏳";

  try {
    const res = await fetch("/api/ai", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ topic })
    });

    const data = await res.json();

    if (data.error) {
      alert(data.error);
      console.log(data);
      return;
    }

    // 👇 IMPORTANT FIX
    document.getElementById("quiz").innerText = data.result;

  } catch (err) {
    alert("Error");
    console.log(err);
  }
}
