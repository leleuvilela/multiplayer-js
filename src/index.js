import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import createGame from "./public/game.js";

const app = express();
const server = createServer(app);
const sockets = new Server(server);

app.use(express.static("src/public"));

const game = createGame();
game.start();

game.subscribe((command) => {
  console.log(`Emitting ${command.type}`);
  sockets.emit(command.type, command);
});

sockets.on("connection", (socket) => {
  const playerId = socket.id;
  console.log(`Player connected: ${playerId}`);

  game.addPlayer({ playerId });

  socket.emit("setup", game.state);

  socket.on("disconnect", () => {
    game.removePlayer({ playerId });
    console.log(`Player disconnected: ${playerId}`);
  });

  socket.on("move-player", (command) => {
    command.playerId = playerId;
    command.type = "move-player";
    game.movePlayer(command);
  });
});

server.listen(3000, () => {
  console.log("Server is running on port 3000");
});
