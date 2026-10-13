import { getFallbackWord, HangmanGame, MAX_MISTAKES, normalizeWord } from "./game.js";

const RANDOM_WORD_URL = "https://random-word-api.herokuapp.com/word";
const REQUEST_TIMEOUT_MS = 8000;
const TRANSITION_MS = 700;
const WARNING_HOLD_MS = 1800;

const elements = {
  spotlightScene: document.querySelector(".spotlight-scene"),
  startOverlay: document.getElementById("start-overlay"),
  startButton: document.getElementById("start-button"),
  warning: document.getElementById("warning"),
  main: document.getElementById("main"),
  newGameButton: document.getElementById("new-game-button"),
  wordDisplay: document.getElementById("letters"),
  healthIndicator: document.getElementById("health"),
  healthCircles: [...document.querySelectorAll(".circle")],
  guessedLetters: document.getElementById("guessed-letters"),
  gunLayers: [...document.querySelectorAll(".gun img")],
  guessForm: document.getElementById("guess-form"),
  guessInput: document.getElementById("guess-input"),
  submitButton: document.getElementById("submit-guess"),
  statusMessage: document.getElementById("status-message"),
  hostageStage: document.getElementById("hostage-stage"),
  resultMessage: document.getElementById("result-message"),
  resultTitle: document.getElementById("result-title"),
  resultCopy: document.getElementById("result-copy"),
  screenFlash: document.getElementById("screen-flash"),
};

let game = new HangmanGame();

function delay(milliseconds) {
  return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
}

async function startExperience() {
  if (elements.startButton.disabled) {
    return;
  }

  elements.startButton.disabled = true;
  elements.startOverlay.classList.add("fade-out");
  await delay(TRANSITION_MS);
  elements.startOverlay.hidden = true;

  elements.warning.hidden = false;
  elements.warning.classList.add("fade-in");
  await delay(TRANSITION_MS + WARNING_HOLD_MS);
  elements.warning.classList.remove("fade-in");
  elements.warning.classList.add("fade-out");
  await delay(TRANSITION_MS);
  elements.warning.hidden = true;

  elements.main.hidden = false;
  elements.main.classList.add("fade-in");
  document.body.classList.add("spotlight-active");
  elements.spotlightScene.classList.add("is-lighting-up");
  await startNewGame();
  await delay(TRANSITION_MS);
  elements.main.classList.remove("fade-in");
}

async function fetchRandomWord() {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(RANDOM_WORD_URL, { signal: controller.signal });

    if (!response.ok) {
      throw new Error(`Word service responded with status ${response.status}.`);
    }

    const result = await response.json();

    if (!Array.isArray(result) || result.length === 0) {
      throw new Error("Word service returned an empty or invalid response.");
    }

    return normalizeWord(result[0]);
  } finally {
    window.clearTimeout(timeoutId);
  }
}

async function startNewGame() {
  game = new HangmanGame();
  elements.hostageStage.classList.remove("is-victory", "is-defeat");
  elements.resultMessage.hidden = true;
  elements.guessForm.hidden = false;
  elements.resultMessage.className = "result-message";
  elements.resultTitle.textContent = "";
  elements.resultCopy.textContent = "";
  elements.screenFlash.classList.remove("is-active");
  elements.newGameButton.disabled = true;
  elements.guessInput.disabled = true;
  elements.submitButton.disabled = true;
  elements.statusMessage.textContent = "Choosing a word…";
  renderGame();

  let usedFallback = false;

  try {
    game.start(await fetchRandomWord());
  } catch (error) {
    console.warn("Could not load a random word; using the offline word list.", error);
    game.start(getFallbackWord());
    usedFallback = true;
  }

  console.log("[Hangman debug] Correct word:", game.answer);

  elements.newGameButton.disabled = false;
  elements.guessInput.disabled = false;
  elements.submitButton.disabled = false;
  elements.statusMessage.textContent = usedFallback
    ? "The word service is unavailable, so an offline word was selected."
    : "Guess a letter to reveal the word.";

  renderGame();
  elements.guessInput.focus();
}

function renderGame() {
  const state = game.snapshot;
  const letterElements = state.displayWord.map((letter, index) => {
    const item = document.createElement("li");
    item.className = "letter";
    item.textContent = letter;
    item.setAttribute("aria-label", letter || `Hidden letter ${index + 1}`);
    return item;
  });

  elements.wordDisplay.replaceChildren(...letterElements);
  elements.healthIndicator.setAttribute(
    "aria-label",
    `${state.wrongGuesses} of ${MAX_MISTAKES} incorrect guesses`,
  );

  elements.healthCircles.forEach((circle, index) => {
    circle.classList.toggle("full", index < state.wrongGuesses);
  });

  const guessedLetterElements = state.guessedLetters.map((letter) => {
    const isCorrect = game.answer.includes(letter);
    const item = document.createElement("span");
    item.className = `guessed-letter ${isCorrect ? "is-correct" : "is-incorrect"}`;
    item.textContent = letter.toUpperCase();
    item.title = isCorrect ? "Correct guess" : "Incorrect guess";
    item.setAttribute("role", "listitem");
    item.setAttribute(
      "aria-label",
      `${letter.toUpperCase()}, ${isCorrect ? "correct" : "incorrect"} guess`,
    );
    return item;
  });

  if (guessedLetterElements.length === 0) {
    const empty = document.createElement("span");
    empty.className = "guessed-empty";
    empty.textContent = "No guesses yet";
    elements.guessedLetters.replaceChildren(empty);
  } else {
    elements.guessedLetters.replaceChildren(...guessedLetterElements);
  }

  elements.gunLayers.forEach((layer, index) => {
    layer.style.opacity = index < state.wrongGuesses ? "1" : "0";
  });

  elements.guessInput.disabled = !state.isPlaying;
  elements.submitButton.disabled = !state.isPlaying;
}

function showOutcome(kind, answer) {
  elements.resultMessage.className = `result-message is-${kind}`;
  elements.resultTitle.textContent = kind === "win" ? "YOU SAVED HIM" : "TOO LATE";
  elements.resultCopy.textContent = kind === "win"
    ? `You found ${answer.toUpperCase()} in time. Start a new game to play again.`
    : `The word was ${answer.toUpperCase()}. Start a new game to try again.`;
  elements.guessForm.hidden = true;
  elements.resultMessage.hidden = false;
}

function triggerLossFlash() {
  elements.screenFlash.classList.remove("is-active");
  // Restart the CSS animation so each loss gets its own flash.
  void elements.screenFlash.offsetWidth;
  elements.screenFlash.classList.add("is-active");
  window.setTimeout(() => {
    elements.screenFlash.classList.remove("is-active");
  }, 760);
}

function handleGuess(event) {
  event.preventDefault();

  const result = game.guess(elements.guessInput.value);
  elements.guessInput.value = "";

  if (result.type === "invalid") {
    elements.statusMessage.textContent = "Enter one letter from A to Z.";
    elements.guessInput.focus();
    return;
  }

  if (result.type === "duplicate") {
    elements.statusMessage.textContent = `You already guessed ${result.letter.toUpperCase()}. Try another letter.`;
    elements.guessInput.focus();
    return;
  }

  if (result.type === "inactive") {
    elements.statusMessage.textContent = "This round has ended. Start a new game to play again.";
    return;
  }

  renderGame();

  if (result.type === "won") {
    elements.hostageStage.classList.remove("is-defeat");
    elements.hostageStage.classList.add("is-victory");
    showOutcome("win", game.answer);
    elements.statusMessage.textContent = `Victory. You saved him by guessing ${game.answer.toUpperCase()}.`;
    elements.newGameButton.focus();
  } else if (result.type === "lost") {
    elements.hostageStage.classList.remove("is-victory");
    elements.hostageStage.classList.add("is-defeat");
    showOutcome("loss", game.answer);
    elements.statusMessage.textContent = `The round ended. The word was ${game.answer.toUpperCase()}.`;
    triggerLossFlash();
    elements.newGameButton.focus();
  } else if (result.type === "correct") {
    elements.statusMessage.textContent = `Correct! ${result.remainingMistakes} incorrect guesses remaining.`;
    elements.guessInput.focus();
  } else {
    elements.statusMessage.textContent = `No ${result.letter.toUpperCase()}. ${result.remainingMistakes} incorrect guesses remaining.`;
    elements.guessInput.focus();
  }
}

elements.startButton.addEventListener("click", startExperience);
elements.newGameButton.addEventListener("click", startNewGame);
elements.guessForm.addEventListener("submit", handleGuess);
