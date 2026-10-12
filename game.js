export const MAX_MISTAKES = 5;

const VALID_WORD = /^[a-z]+$/;
const VALID_LETTER = /^[a-z]$/;
const FALLBACK_WORDS = [
  "anchor",
  "badger",
  "candle",
  "drizzle",
  "ember",
  "forest",
  "goblin",
  "harbor",
  "island",
  "jigsaw",
  "kitten",
  "lantern",
  "meteor",
  "nectar",
  "orbit",
  "puzzle",
  "quartz",
  "ribbon",
  "sunset",
  "thunder",
  "velvet",
  "willow",
  "xylophone",
  "yellow",
  "zephyr",
];

/** Normalize and validate a word returned by the word service. */
export function normalizeWord(value) {
  if (typeof value !== "string") {
    throw new TypeError("The word must be a string.");
  }

  const word = value.trim().toLowerCase();

  if (!VALID_WORD.test(word)) {
    throw new TypeError("The word must contain only letters from A to Z.");
  }

  return word;
}

/** Return a random word so the game can still be played offline. */
export function getFallbackWord(random = Math.random) {
  const index = Math.floor(random() * FALLBACK_WORDS.length);
  return FALLBACK_WORDS[Math.min(Math.max(index, 0), FALLBACK_WORDS.length - 1)];
}

function normalizeGuess(value) {
  if (typeof value !== "string") {
    return null;
  }

  const letter = value.trim().toLowerCase();
  return VALID_LETTER.test(letter) ? letter : null;
}

/** Store game state and apply guesses independently of the page UI. */
export class HangmanGame {
  #answer = "";
  #guessedLetters = new Set();
  #wrongGuesses = 0;
  #status = "idle";

  constructor(maxMistakes = MAX_MISTAKES) {
    if (!Number.isInteger(maxMistakes) || maxMistakes < 1) {
      throw new RangeError("The maximum number of mistakes must be a positive integer.");
    }

    this.maxMistakes = maxMistakes;
  }

  get answer() {
    return this.#answer;
  }

  get snapshot() {
    const isPlaying = this.#status === "playing";
    const revealAnswer = this.#status === "lost";

    return {
      status: this.#status,
      isPlaying,
      wrongGuesses: this.#wrongGuesses,
      remainingMistakes: this.maxMistakes - this.#wrongGuesses,
      guessedLetters: [...this.#guessedLetters],
      displayWord: [...this.#answer].map((letter) => (
        revealAnswer || this.#guessedLetters.has(letter) ? letter : ""
      )),
    };
  }

  start(word) {
    this.#answer = normalizeWord(word);
    this.#guessedLetters.clear();
    this.#wrongGuesses = 0;
    this.#status = "playing";

    return this.snapshot;
  }

  guess(value) {
    if (this.#status !== "playing") {
      return { type: "inactive", ...this.snapshot };
    }

    const letter = normalizeGuess(value);

    if (!letter) {
      return { type: "invalid", ...this.snapshot };
    }

    if (this.#guessedLetters.has(letter)) {
      return { type: "duplicate", letter, ...this.snapshot };
    }

    this.#guessedLetters.add(letter);
    const isCorrect = this.#answer.includes(letter);

    if (!isCorrect) {
      this.#wrongGuesses += 1;
    }

    const hasWon = [...this.#answer].every((character) => (
      this.#guessedLetters.has(character)
    ));

    if (hasWon) {
      this.#status = "won";
    } else if (this.#wrongGuesses >= this.maxMistakes) {
      this.#status = "lost";
    }

    let type = isCorrect ? "correct" : "incorrect";

    if (this.#status === "won") {
      type = "won";
    } else if (this.#status === "lost") {
      type = "lost";
    }

    return { type, letter, ...this.snapshot };
  }
}
