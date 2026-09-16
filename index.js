async function getData() {
  // const url2 = "https://random-words-api.kushcreates.com/api?language=en&length=10&type=lowercase&words=1"
  const url = "https://random-word-api.herokuapp.com/word";
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const result = await response.json();
    const word = result[0]
    console.log(result);
    console.log(word);
    console.log(word.length);
    // document.getElementById("wrd").innerHTML = result[0].word;
    document.getElementById("wrd").innerHTML = word;
  } catch (error) {
    console.error(error.message);
  }
}