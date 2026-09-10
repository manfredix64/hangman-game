async function getData(category) {
  const url = `https://random-words-api.kushcreates.com/api?language=en&category=${category}&length=0&type=lowercase&words=1`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const result = await response.json();
    console.log(result);
    document.getElementById("wrd").innerHTML = result[0].word + " " + result[0].length;
  } catch (error) {
    console.error(error.message);
  }
}