# Hangman

A small, dark, arcade-inspired hangman game built with plain HTML, CSS, and JavaScript. No frontend framework or runtime dependencies are required.

## Run the game

The game uses JavaScript modules and fetches a random word from an online word service. Serve this directory with any static HTTP server, then open the provided local URL in your browser. For example, with Python installed:

```sh
python -m http.server 8000
```

Open <http://localhost:8000> in your browser. If the word service is unavailable, the game automatically selects a word from its built-in offline list.

## Play

1. Select **Start** and read the flashing-lights notice.
2. Enter one letter from A to Z and press **Guess** or Enter.
3. Repeated guesses do not cost a mistake. The round ends when you reveal the word or reach five incorrect guesses.
4. Guess the word in time to trigger the rescue ending. Using all five mistakes triggers the loss ending, including a brief white flash.
5. Select **New game** to play another round.

## Development

Node.js 18 or newer is recommended for the built-in test runner. Run the game-logic tests with:

```sh
npm test
```

Syntax-check the browser scripts with:

```sh
node --check index.js
node --check game.js
```

`test.html` remains a standalone visual experiment. Its warm spotlight is integrated into the main game and flickers on after the intro and flashing-lights warning sequence; it stays off on the intro screens. The character artwork is in `img/guy_start.png`, `img/guy_victory.png`, and `img/guy_death.png`. The main scene uses the full viewport as a textured wall stage, with the HUD arranged away from the central character and gun artwork. The shotgun is deliberately scaled down and positioned around head height; the lamp beam is sized relative to viewport height to keep its shape consistent across desktop display sizes. The start, victory, and death character images share an identical 666 × 374 pixel canvas so transitions stay aligned. It assembles the gun across five wrong guesses and switches to the rescue or loss artwork when the round ends. For debugging, the correct answer is logged to the browser console each time a new round starts.

## Credits

- Code: `manfredix`
- Assets: AV
