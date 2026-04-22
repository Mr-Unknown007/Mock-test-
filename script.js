let questions = [];
let current = 0;
let score = 0;
let wrong = 0;
let weak = {};

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
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ topic }),
    });

    const data = await res.json();

    if (data.error) {
      alert(data.error);
      return;
    }

    questions = data.questions;
    current = 0;
    score = 0;
    wrong = 0;
    weak = {};

    showQuestion();

  } catch (err) {
    alert("Error fetching questions");
  }
}

// 🧠 Show question
function showQuestion() {
  if (current >= questions.length) {
    showResult();
    return;
  }

  const q = questions[current];

  let html = `
    <div class="card">
      <h3>Q${current + 1}. ${q.question}</h3>
  `;

  q.options.forEach((opt, index) => {
    html += `
      <div>
        <button onclick="checkAnswer('${opt}')">${opt}</button>
      </div>
    `;
  });

  html += `</div>`;

  document.getElementById("quiz").innerHTML = html;
}

// ✅ Check answer
function checkAnswer(selected) {
  const q = questions[current];

  if (selected === q.answer) {
    score++;
  } else {
    wrong++;

    // weak topic tracking
    let topic = document.getElementById("topic").value;
    weak[topic] = (weak[topic] || 0) + 1;
  }

  current++;
  showQuestion();
}

// 📊 Result
function showResult() {
  let final = score - (wrong * 0.25);

  let weakTopics = Object.entries(weak)
    .sort((a, b) => b[1] - a[1])
    .map(x => x[0])
    .join(", ");

  document.getElementById("quiz").innerHTML = `
    <div class="card">
      <h2>Result</h2>
      <p>Score: ${final}</p>
      <p>Correct: ${score}</p>
      <p>Wrong: ${wrong}</p>
      <p>Weak Topics: ${weakTopics || "None"}</p>
      <button onclick="location.reload()">Restart</button>
    </div>
  `;
}
