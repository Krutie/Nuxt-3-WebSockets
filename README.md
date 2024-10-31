### Links

- **defineWebSocketHandler in Nitro**: https://nitro.unjs.io/guide/websocket 
- **Unified WebSocket Servers**: https://crossws.unjs.io/
- **Reactive WebSocket client**: https://vueuse.org/core/useWebSocket/


# Nuxt Minimal Starter

Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

# Basic Implementation

```ts
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
    const data = JSON.parse(message.toString());
    // The server re-broadcasts incoming messages to everyone
    peer.publish("chat", JSON.stringify({ user: peer.toString(), message: message.toString() }));
    }
  },
  close(peer, event) {
    console.log("[ws] close");
    peer.publish("chat", JSON.stringify({ user: "server", message: `${peer} left!` }));
  },
  error(peer, error) {
    console.log("[ws] error");
  },
});
```
## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
