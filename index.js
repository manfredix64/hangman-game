// document.getElementById("start-button").onclick = function () {
//   document.getElementById("start-overlay").remove();
// };
function start() {
  document.getElementById("start-overlay").remove();
  word();
}

let wurd = "";
let health = 0;
async function word() {
  health = 0;

  for (let i = 1; i < 6; i++) {
    document.getElementById(`gun-${i}`).style.opacity = 0;
  }

  const circles = document.querySelectorAll(".circle");
  circles.forEach(circle => {
    circle.classList.remove("full");
  });

  // const url2 = "https://random-words-api.kushcreates.com/api?language=en&length=10&type=lowercase&words=1"
  const url = "https://random-word-api.herokuapp.com/word";

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const result = await response.json();

    const word = result[0].toLowerCase();
    wurd = word;

    // console.log(result);
    console.log(word);
    // console.log(word.length);
    // document.getElementById("wrd").innerHTML = result[0].word;

    document.getElementById("wrd").innerHTML = word;

    generateParagraphs(word);

  } catch (error) {
    console.error(error.message);
  }
}

function generateParagraphs(word) {

  letters.innerHTML = "";

  for (let i = 0; i < word.length; i++) {
    const p = document.createElement("p");

    p.id = `p-${i}`;
    // p.textContent = `Paragraph ${i + 1}`;
    // p.textContent = word[i]
    p.textContent = " ";

    letters.appendChild(p);
  }
}

function check() {

  const letter = document.getElementById("input").value.toLowerCase()
  // console.log(wurd);
  // console.log(letter);

  let found = false;

  for (let i = 0; i < wurd.length; i++) {
    if (letter === wurd[i]) {
      document.getElementById(`p-${i}`).textContent = wurd[i];
      found = true;
    }
  }

  if (!found) {
    healthFunc("add");
  }

  document.getElementById("input").value = "";
}

function healthFunc(action) {

  const circles = document.querySelectorAll(".circle");

  if (action === "add") {
    circles[health].classList.add("full");
    health++;
    document.getElementById(`gun-${health}`).style.opacity = 1
    console.log(health)
  }
  
}