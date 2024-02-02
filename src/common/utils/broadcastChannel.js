import { ref, onMounted, onUnmounted } from "vue";

export function useBroadcastChannel(options = {}) {
  const { name } = options;
  const data = ref("");
  const isClosed = ref(false);
  const error = ref(null);
  const channel = ref(null);

  const post = (msg) => {
    if (channel.value) {
      channel.value.postMessage(msg);
    }
  };

  const close = () => {
    if (channel.value) {
      channel.value.close();
      isClosed.value = true;
    }
  };

  onMounted(() => {
    error.value = null;
    channel.value = new BroadcastChannel(name);

    channel.value.addEventListener("message", (event) => {
      data.value = event.data;
    });

    channel.value.addEventListener(
      "messageerror",
      (e) => {
        error.value = e;
      },
      { passive: true }
    );

    channel.value.addEventListener("close", () => {
      isClosed.value = true;
    });
  });

  onUnmounted(() => {
    close();
  });
  return {
    channel,
    data,
    post,
    close,
    error,
    isClosed,
  };
}
