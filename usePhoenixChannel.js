import { ref, onMounted, onUnmounted } from "vue";
import { Socket } from "https://cdn.jsdelivr.net/npm/phoenix@1.7.0/priv/static/phoenix.mjs";

export function usePhoenixChannel(channelName) {
  const messages = ref([]);
  const newMessage = ref("");
  let channel = null;

  const sendMessage = () => {
    if (newMessage.value.trim() === "") return;
    channel.push("shout", { message: newMessage.value });
    newMessage.value = "";
  };

  const connectChannel = () => {
    const socket = new Socket("ws://localhost:4000/socket");
    socket.connect();

    channel = socket.channel(channelName, {});

    channel
      .join()
      .receive("ok", () => console.log(`Joined channel: ${channelName}`))
      .receive("error", (resp) => console.error(`Failed to join ${channelName}`, resp));

    channel.on("shout", (payload) => {
      messages.value.push(payload.message);
    });
  };

  onMounted(() => {
    connectChannel();
  });

  onUnmounted(() => {
    if (channel) channel.leave();
  });

  return {
    messages,
    newMessage,
    sendMessage,
  };
}
