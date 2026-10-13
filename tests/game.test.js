import test from "node:test";
import assert from "node:assert/strict";
import {
  getFallbackWord,
  HangmanGame,
  MAX_MISTAKES,
  normalizeWord,
} from "../game.js";

test("normalizes valid words", () => {
  assert.equal(normalizeWord("  HeLLo "), "hello");
});

test("rejects invalid words", () => {
  for (const value of ["", "two words", "word7", "can't", null, 42]) {
    assert.throws(() => normalizeWord(value), TypeError);
  }
});

test("fallback word selection stays within the word list", () => {
  assert.equal(typeof getFallbackWord(() => 0), "string");
  assert.equal(typeof getFallbackWord(() => 0.99), "string");
  assert.equal(typeof getFallbackWord(() => -1), "string");
  assert.equal(typeof getFallbackWord(() => 2), "string");
});

test("a new game starts with every letter hidden and all mistakes available", () => {
  const game = new HangmanGame();
  game.start("apple");

  assert.equal(game.snapshot.status, "playing");
  assert.deepEqual(game.snapshot.displayWord, ["", "", "", "", ""]);
  assert.equal(game.snapshot.remainingMistakes, MAX_MISTAKES);
});

test("correct guesses reveal every occurrence of the letter", () => {
  const game = new HangmanGame();
  game.start("letter");

  assert.equal(game.guess("t").type, "correct");
  assert.deepEqual(game.snapshot.displayWord, ["", "", "t", "t", "", ""]);
  assert.equal(game.guess("E").type, "correct");
  assert.deepEqual(game.snapshot.displayWord, ["", "e", "t", "t", "e", ""]);
});

test("invalid and duplicate guesses do not consume a mistake", () => {
  const game = new HangmanGame();
  game.start("cat");

  assert.equal(game.guess("").type, "invalid");
  assert.equal(game.guess("!").type, "invalid");
  assert.equal(game.guess("z").type, "incorrect");
  assert.equal(game.guess("Z").type, "duplicate");
  assert.equal(game.snapshot.wrongGuesses, 1);
});

test("the game ends in a win when all letters have been guessed", () => {
  const game = new HangmanGame();
  game.start("noon");

  assert.equal(game.guess("n").type, "correct");
  assert.equal(game.guess("o").type, "won");
  assert.equal(game.snapshot.status, "won");
  assert.deepEqual(game.snapshot.displayWord, ["n", "o", "o", "n"]);
  assert.equal(game.guess("x").type, "inactive");
});

test("the game ends safely at the mistake limit and reveals the word", () => {
  const game = new HangmanGame();
  game.start("cat");

  for (const letter of ["b", "d", "e", "f"]) {
    assert.equal(game.guess(letter).type, "incorrect");
  }

  const lastGuess = game.guess("g");
  assert.equal(lastGuess.type, "lost");
  assert.equal(game.snapshot.status, "lost");
  assert.equal(game.snapshot.wrongGuesses, MAX_MISTAKES);
  assert.deepEqual(game.snapshot.displayWord, ["c", "a", "t"]);
  assert.equal(game.guess("c").type, "inactive");
});


test("guessed letters are recorded once in the order they were tried", () => {
  const game = new HangmanGame();
  game.start("banana");

  game.guess("n");
  game.guess("z");
  game.guess("a");

  assert.deepEqual(game.snapshot.guessedLetters, ["n", "z", "a"]);
  assert.equal(game.guess("Z").type, "duplicate");
  assert.deepEqual(game.snapshot.guessedLetters, ["n", "z", "a"]);
});

test("starting a new round clears the old state", () => {
  const game = new HangmanGame();
  game.start("cat");
  game.guess("z");
  game.start("dog");

  assert.equal(game.snapshot.status, "playing");
  assert.equal(game.snapshot.wrongGuesses, 0);
  assert.deepEqual(game.snapshot.guessedLetters, []);
  assert.deepEqual(game.snapshot.displayWord, ["", "", ""]);
});

test("invalid mistake limits are rejected", () => {
  assert.throws(() => new HangmanGame(0), RangeError);
  assert.throws(() => new HangmanGame(2.5), RangeError);
});
