import createGame from "./game.js";
import createKeyboardListener from "./keyboard-listener.js";
import renderScreen from "./render-screen.js";

const game = createGame();
const keyboardListener = createKeyboardListener(document);

const socket = io();

socket.on("connect", () => {
  const playerId = socket.id;
  console.log(`Player connected on client with id: ${playerId}`);

  const screen = document.getElementById("screen");
  const score = document.getElementById("score");

  renderScreen(screen, game, score, window.requestAnimationFrame, playerId);
});

socket.on("setup", (state) => {
  const playerId = socket.id;
  game.setState(state);

  keyboardListener.registerPlayerId(playerId);
  keyboardListener.subscribe(game.movePlayer);
  keyboardListener.subscribe((command) => {
    socket.emit("move-player", command);
  });
});

socket.on("add-player", (command) => {
  console.log(`Receiving add-player command on client: ${command.playerId}`);
  game.addPlayer(command);
});

socket.on("remove-player", (command) => {
  console.log(`Receiving remove-player command on client: ${command.playerId}`);
  game.removePlayer(command);
});

socket.on("move-player", (command) => {
  console.log(`Receiving move-player command on client: ${command.playerId}`);
  const playerId = socket.id;
  if (playerId !== command.playerId) {
    game.movePlayer(command);
  }
});

socket.on("add-fruit", (command) => {
  console.log(`Receiving add-fruit command on client: ${command.fruitId}`);
  game.addFruit(command);
});

socket.on("remove-fruit", (command) => {
  console.log(`Receiving remove-fruit command on client: ${command.fruitId}`);
  const playerId = socket.id;
  if (playerId !== command.playerId) {
    game.captureFruit(command);
  }
});
