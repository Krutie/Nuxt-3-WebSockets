import type { Peer, Message } from 'crossws';

type IWaitingQueue = {
  id: string,
  peer: Peer
};

type IActiveGame = {
  gameId: string,
  player1: string,
  player2?: string,
  status: string,
  playerSockets: {
    player1: Peer,
    player2?: Peer
  }
}
let waitingQueue: IWaitingQueue[] = [];
let activeGames: IActiveGame[] = [];

export default defineWebSocketHandler({
  open(peer: Peer) {
    console.log(`[peer] Connection opened: ${peer.toString()}`);
    peer.send(JSON.stringify({ type: 'welcome', message: `Welcome ${peer.toString()}!` }));
  },

  message(peer: Peer, message: Message) {
    const data = JSON.parse(message.toString());

    if (data.type === 'game_chat') {
      peer.publish(data.gameId, JSON.stringify({
        type: 'game_chat',
        gameId: data.gameId,
        message: data.message
      }));
    }

    if (data.type === 'join_game') {
      const playerId = peer.toString();
      if (waitingQueue.length > 0) {
        // Match the new player with the first in the queue
        const opponent = waitingQueue.shift();
        const gameId = `game_${Date.now()}`;

        // Store the game information
        activeGames.push({
          gameId,
          player1: playerId,
          player2: opponent?.id,
          status: 'active',
          playerSockets: {
            player1: peer,             // The WebSocket instance of the first player
            player2: opponent?.peer       // The WebSocket instance of the opponent
          }
        });

        // Subscribe both players to the private room
        peer.subscribe(gameId);          // Player 1 joins the private room
        opponent?.peer.subscribe(gameId);     // Player 2 joins the private room

        // Notify each player with their role and game ID
        peer.publish(gameId, JSON.stringify({
          type: 'start_game',
          gameId,
          role: 'player1',
          opponentId: opponent?.id,
          message: `You are player 1. Game has started! You are subscribed to the game room: ${gameId}.`
        }));

        opponent?.peer.publish(gameId, JSON.stringify({
          type: 'start_game',
          gameId,
          role: 'player2',
          opponentId: playerId,
          message: `You are player 2. Game has started! You are subscribed to the game room: ${gameId}.`
        }));

      } else {
        // Add the current player to the waiting queue if no opponent is found
        waitingQueue.push({ id: playerId, peer: peer });
        peer.send(JSON.stringify({ type: 'waiting', message: 'Waiting for an opponent...' }));
      }
    }
  },

  close(peer: Peer) {
    // Remove from the waiting queue if disconnected
    waitingQueue = waitingQueue.filter((player) => player.peer !== peer);

    const gameIndex = activeGames.findIndex(game =>
      game.playerSockets['player1'] === peer || game.playerSockets['player2'] === peer
    );

    if (gameIndex !== -1) {
      const game = activeGames[gameIndex];
      const gameId = game.gameId;

      // Unsubscribe both players if their sockets are available
      game.playerSockets['player1']?.unsubscribe(gameId);
      game.playerSockets['player2']?.unsubscribe(gameId);

      // Remove game from activeGames
      activeGames.splice(gameIndex, 1);
      console.log(`[peer] Active Games: ${activeGames.length}`);
      game.playerSockets['player1']?.send(JSON.stringify({ type: 'game_end', message: 'Player 1 left the Game.' }));
      game.playerSockets['player2']?.send(JSON.stringify({ type: 'game_end', message: 'Player 2 left the Game.' }));
    }

  }
});
