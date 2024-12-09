import WebSocket from "ws";

let socket: WebSocket | null = null;
let isSocketOpen = false;
let messageQueue: string[] = [];
let subscribers: Record<string, (data: any) => void> = {};

// Lazy WebSocket initialization
const initializeWebSocket = () => {
  if (!socket) {
    socket = new WebSocket(
      `wss://ws.finnhub.io?token=${process.env.FINNHUB_API_KEY}`
    );

    socket.on("open", () => {
      console.log("WebSocket connection opened.");
      isSocketOpen = true;

      // Process queued messages
      while (messageQueue.length > 0) {
        const message = messageQueue.shift();
        if (message) {
          socket?.send(message);
        }
      }
    });

    socket.on("message", (message) => {
      const parsedMessage = JSON.parse(message.toString());
      if (parsedMessage.type === "trade") {
        parsedMessage.data.forEach((trade: any) => {
          console.log(trade);
          if (subscribers[trade.s]) {
            subscribers[trade.s](trade);
          }
        });
      }
    });

    socket.on("close", () => {
      console.log("WebSocket connection closed.");
      isSocketOpen = false;
      socket = null;
    });

    socket.on("error", (error) => {
      console.error("WebSocket error:", error);
    });
  }
};

export const subscribeToSymbol = (
  symbol: string,
  callback: (data: any) => void
) => {
  initializeWebSocket();

  subscribers[symbol] = callback;
  const message = JSON.stringify({ type: "subscribe", symbol });

  if (isSocketOpen && socket) {
    socket.send(message);
  } else {
    messageQueue.push(message);
  }
};

export const unsubscribeFromSymbol = (symbol: string) => {
  if (!socket) return;

  delete subscribers[symbol];
  const message = JSON.stringify({ type: "unsubscribe", symbol });

  if (isSocketOpen && socket) {
    socket.send(message);
  } else {
    messageQueue.push(message);
  }
};
