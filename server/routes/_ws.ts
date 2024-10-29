export default defineWebSocketHandler({
  open(peer) {
    console.log("[ws] open: peer.id", peer.toString());
    // Join new client to the "chat" channel
    peer.send("Welcome to the server!");
    peer.subscribe("chat");
    // Notify every other connected client
    peer.publish("chat", `[system] ${peer.id} joined!`);
  },
  message(peer, message) {
    // The server re-broadcasts incoming messages to everyone
    console.log("[ws] publish message", { user: peer.toString(), message: message.toString() });
    // peer.publish("chat", message.toString());
    // peer.publish("chat", message.text()); // ok
    peer.publish("chat", JSON.stringify({ user: peer.toString(), message: message.toString() })); // ok
    // peer.send({ user: peer.toString(), message: message.toString() });
  },
  close(peer, event) {
    console.log("[ws] close");
    peer.publish("chat", JSON.stringify({ user: "server", message: `${peer} left!` }));
  },
  error(peer, error) {
    console.log("[ws] error");
  },
});

