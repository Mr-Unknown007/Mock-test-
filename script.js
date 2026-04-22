let selectedQ = [];
let timer;
let timeLeft = 600;

function startTimer(){
  clearInterval(timer);
  timeLeft = 600;

  timer = setInterval(()=>{
    let m = Math.floor(timeLeft/60);
    let s = timeLeft % 60;

    document.getElementById("timer").innerText = `⏱ ${m}:${s}`;

    timeLeft--;

    if(timeLeft < 0){
      clearInterval(timer);
      submitTest();
    }
  },1000);
}

function render(){
  const quiz = document.getElementById("quiz");
  quiz.innerHTML = "";

  selectedQ.forEach((q,i)=>{
    let div = document.createElement("div");
    div.className="card";

    div.innerHTML = `<b>Q${i+1}. ${q.q}</b><br>` +
      q.o.map((opt,j)=>
        `<label><input type='radio' name='q${i}' value='${j}'> ${opt}</label><br>`
      ).join("");

    quiz.appendChild(div);
  });

  let btn = document.createElement("button");
  btn.innerText = "Submit Test";
  btn.onclick = submitTest;
  quiz.appendChild(btn);
}

async function generateAI(){

  const topic = document.getElementById("topic").value;

  if(!topic){
    alert("Enter topic first");
    return;
  }

  const res = await fetch("/api/ai", {
    method: "POST",
    body: JSON.stringify({ topic })
  });

  const data = await res.json();

  let text = data.candidates[0].content.parts[0].text;

  text = text.replace(/```json|```/g,"").trim();

  selectedQ = JSON.parse(text);

  render();
  startTimer();
}

function submitTest(){

  clearInterval(timer);

  let correct=0, wrong=0;

  selectedQ.forEach((q,i)=>{
    const sel = document.querySelector(`input[name='q${i}']:checked`);

    if(sel && parseInt(sel.value) === q.a){
      correct++;
    } else {
      wrong++;
    }
  });

  let score = correct - (wrong * 0.25);

  alert(`Score: ${score}\nCorrect: ${correct}\nWrong: ${wrong}`);
}
