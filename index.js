async function getData(category) {
  const url = `https://random-words-api.kushcreates.com/api?language=en&category=${category}&length=0&type=lowercase&words=1`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const result = await response.json();
    console.log(result);
    document.getElementById("wrd").innerHTML = result[0].word
    
    function showCircles() {
      const container = document.getElementById("health");

      container.innerHTML = ""
      health = 0

      for (let i = 0; i < result[0].length; i++) {
        const circle = document.createElement("div");
        circle.classList.add("circle");

        container.appendChild(circle);
      }
    }

  } catch (error) {
    console.error(error.message);
  }
  showCircles()
}

let health = 0

function addHealth() {
  const circles = document.querySelectorAll(".circle");
  
  if (health < circles.length) {
    circles[health].classList.add("full");
    health++;
  }
}



// showCircles()