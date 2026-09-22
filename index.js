let wurd = "";

async function word() {
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
    console.log(word.length);
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

  for (let i = 0; i < wurd.length; i++) {
    if (letter === wurd[i]) {
      document.getElementById(`p-${i}`).textContent = wurd[i];
    }
  }

  document.getElementById("input").value = "";
}
// async function anotherFunction() {
//   const myWord = await word();

//   console.log(myWord);
// }