<template>
  <div class="h-screen flex flex-col justify-between">
    <main>
      <pre>
        status: {{ status }} | 
      </pre>
      <!-- Messages -->
      <div id="messages"
           class="flex-grow flex flex-col justify-end px-4 py-8">
        <div class="flex items-center mb-4"
             v-for="message in store.messages">
          <div class="flex flex-col">
            <p class="text-gray-500 mb-1 text-xs ml-10">{{ message.user }}</p>
            <div class="flex items-center">
              <img :src="'https://www.gravatar.com/avatar/' + encodeURIComponent(message.user + Math.random()) + '?s=512&d=monsterid'"
                   alt="Avatar"
                   class="w-8 h-8 rounded-full" />
              <div class="ml-2 bg-gray-800 rounded-lg p-2">
                <!-- <pre class="text-xs text-white">
                  {{ message }}
                </pre> -->
                <p v-if="message.formattedText"
                   class="overflow-x-scroll"
                   v-html="message.formattedText"></p>
                <p v-else
                   class="text-white">{{ message.text }}</p>
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
          <button class="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4"
                  @click="sendMessage">
            Send
          </button>
          <button class="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4"
                  @click="open">
            Reconnect
          </button>
          <button class="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4"
                  @click="send('ping')">
            Ping
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
import { useWebSocket } from '@vueuse/core'
const isSecure = location.protocol === "https:";
const url = (isSecure ? "wss://" : "ws://") + location.host + "/_ws";

// In prod: check if secure, then use wss://
// const { status, data, send, open, close } = useWebSocket(`ws://${location.host}/api/websocket`)
const { status, data, send, open, close } = useWebSocket(`ws://${location.host}/_ws`)

const store = reactive({
  message: "",
  messages: [],
});

watch(data, (newValue) => {
  console.log("data", newValue);
  if (typeof newValue === "string") {
    const { user = "system", message = "" } = newValue.startsWith("{")
      ? JSON.parse(newValue)
      : { message: newValue };

    store.messages.push({
      text: message,
      formattedText: "",
      user: user,
      date: new Date().toLocaleString(),
    });
  }
})

const message = ref('')

function sendMessage() {
  if (!message.value) return
  console.log("sendMessage", message.value);
  store.messages.push({
    text: message.value,
    formattedText: "",
    user: 'You',
    date: new Date().toLocaleString(),
  });
  send(message.value)
  message.value = ''
}

function clear() {
  store.messages = []
}

</script>
