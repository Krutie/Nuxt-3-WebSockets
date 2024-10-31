<template>
  <div class="h-screen flex flex-col justify-between">
    <main>
      <pre class="text-xs pt-2 fixed z-10 bg-zinc-100 w-full">
        status: <span class="font-bold" :class="{ 'text-teal-500': status === 'OPEN', 'text-rose-500': status === 'CLOSED' }"> {{ status }} </span>
        Game Room: {{ store.gameId || 'Haven`t joined yet' }}
        {{ store.messages.length }} messages
      </pre>
      <!-- Messages -->
      <div id="messages"
           class="flex-grow flex flex-col justify-end px-4 py-8 mt-14">
        <div class="flex items-center mb-4"
             :class="{ 'justify-end': message.user === 'You' }"
             v-for="message in store.messages">
          <div class="flex flex-col">
            <p class="text-gray-500 mb-1 text-xs ml-10"
               :class="{ 'text-right': message.user === 'You' }">{{ message.user }}</p>
            <div class="flex items-center"
                 :class="{ 'gap-2 flex-row-reverse': message.user === 'You', }">
              <img :src="'https://www.gravatar.com/avatar/' + encodeURIComponent(message.user + Math.random()) + '?s=512&d=monsterid'"
                   alt="Avatar"
                   class="w-8 h-8 rounded-full" />
              <div class="ml-2 bg-gray-800 rounded-lg p-2"
                   :class="{ 'bg-purple-200': message.user === 'You' }">
                <p v-if="message.formattedText"
                   class="overflow-x-scroll"
                   :class="{ '': message.user === 'You' }"
                   v-html="message.formattedText"></p>
                <p v-else
                   class="text-white"
                   :class="{ 'text-gray-800': message.user === 'You' }">{{ message.text }}</p>
              </div>
            </div>
            <p class="text-gray-500 mt-1 text-xs ml-10">{{ message.date }}</p>
          </div>
        </div>
      </div>

      <!-- Chatbox -->
      <div class="bg-gray-800 px-4 py-2 flex items-center justify-between fixed bottom-0 w-full">
        <div class="w-full min-w-6">
          <input type="text"
                 placeholder="Type your message..."
                 class="w-full rounded-l-lg px-4 py-2 bg-gray-700 text-white focus:outline-none focus:ring focus:border-blue-300"
                 @keydown.enter="sendMessage"
                 v-model="message" />
        </div>
        <div class="flex">
          <button v-if="status === 'CLOSED'"
                  class="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4"
                  @click="open">
            Reconnect
          </button>
          <button v-if="store.gameId"
                  class="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4"
                  @click="sendMessage">
            Send
          </button>
          <button v-if="status === 'OPEN' && !store.gameId"
                  class="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4"
                  @click="joinGame">
            Join_Game
          </button>
          <button v-if="status === 'OPEN' && store.gameId"
                  class="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4"
                  @click="handleClose">
            Leave
          </button>
          <button class="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-r-lg"
                  @click="clear">
            Clear
          </button>

        </div>
      </div>
    </main>
  </div>
</template>
<script setup>
import { useWebSocket, watchOnce } from '@vueuse/core'

const isSecure = location.protocol === "https:";
const url = (isSecure ? "wss://" : "ws://") + location.host + "/_ws";

const { status, data, send, open, close } = useWebSocket(`ws://${location.host}/_ws`)

const message = ref('')
const store = reactive({
  message: "",
  messages: [],
  gameId: "",
});

watch(data, (newValue) => {
  const { type = "", user = "system", message = "", gameId = "" } = JSON.parse(newValue)
  if (store.gameId === "")
    store.gameId = gameId;

  store.messages.push({
    text: message,
    formattedText: "",
    user: user,
    gameId: gameId,
    date: new Date().toLocaleString(),
  });

  if (type === "game_end") {
    store.gameId = "" // reset gameId
  }
})

function sendMessage() {
  if (!message.value) return
  store.messages.push({
    text: message.value,
    formattedText: "",
    user: 'You',
    date: new Date().toLocaleString(),
  });

  send(JSON.stringify({ type: 'game_chat', gameId: store.gameId, message: message.value }));

  message.value = ''
}

function joinGame() {
  send(JSON.stringify({ type: 'join_game' }));
}
function handleClose() {
  close()
  store.gameId = ""
}
function clear() {
  store.messages = []
}

</script>
