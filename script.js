let questions = [];
let current = 0;
let score = 0;
let wrong = 0;
let selectedQ = [];
let weak = {};
let timer;
let timeLeft = 1800; // 30 min

// ================= AI GENERATE =================
async function generateAI(){

  const topic = document.getElementById("topic").value;

  if(!topic){
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

    if(data.error){
      alert(JSON.stringify(data.error));
      return;
    }

    let text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if(!text){
      alert("AI response error");
      console.log(data);
      return;
    }

    // साफ JSON बनाना
    text = text.replace(/```json|```/g,"").trim();

    try {
      selectedQ = JSON.parse(text);
    } catch(e){
      alert("JSON parse error");
      console.log(text);
      return;
    }

    // Shuffle
    selectedQ = shuffleArray(selectedQ);

    // 50 question limit
    selectedQ = selectedQ.slice(0,50);

    current = 0;
    score = 0;
    wrong = 0;
    weak = {};

    render();
    startTimer();

  } catch (err) {
    alert("Server error");
    console.log(err);
  }
}

// ================= RENDER =================
function render(){

  if(current >= selectedQ.length){
    finishTest();
    return;
  }

  let q = selectedQ[current];

  document.getElementById("quiz").innerHTML = `
    <div class="question">
      <h3>Q${current+1}. ${q.question}</h3>

      ${q.options.map((opt,i)=>`
        <div>
          <button onclick="checkAnswer('${opt.replace(/'/g,"")}')">
            ${opt}
          </button>
        </div>
      `).join("")}
    </div>
  `;
}

// ================= CHECK =================
function checkAnswer(ans){

  let q = selectedQ[current];

  if(ans === q.answer){
    score++;
  } else {
    wrong++;

    let topic = q.topic || "General";
    weak[topic] = (weak[topic] || 0) + 1;
  }

  current++;
  render();
}

// ================= TIMER =================
function startTimer(){

  clearInterval(timer);

  timeLeft = 1800;

  timer = setInterval(()=>{
    timeLeft--;

    let min = Math.floor(timeLeft/60);
    let sec = timeLeft % 60;

    document.getElementById("timer").innerText =
      `⏱ ${min}:${sec < 10 ? "0"+sec : sec}`;

    if(timeLeft <= 0){
      clearInterval(timer);
      finishTest();
    }

  },1000);
}

// ================= RESULT =================
function finishTest(){

  clearInterval(timer);

  let final = score - (wrong * 0.25);

  let weakTopics = Object.entries(weak)
    .sort((a,b)=>b[1]-a[1])
    .map(x=>x[0])
    .join(", ");

  alert(
`Score: ${final}
Correct: ${score}
Wrong: ${wrong}
Weak Topics: ${weakTopics}`
  );

  document.getElementById("quiz").innerHTML = "<h2>Test Finished ✅</h2>";
}

// ================= SHUFFLE =================
function shuffleArray(arr){
  for(let i = arr.length -1; i>0; i--){
    let j = Math.floor(Math.random() * (i+1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
