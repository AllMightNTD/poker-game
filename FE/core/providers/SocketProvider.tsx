"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import Cookies from "js-cookie";
import { io, Socket } from "socket.io-client";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const token = Cookies.get("accessToken");

    console.log("SOCKET TOKEN:", token);

    if (!token) {
      console.log("SocketProvider: No access token found, skipping socket connection");
      return;
    }

    const socketInstance = io(
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:3003",
      {
        transports: ["websocket"],
        auth: {
          token,
        },
        withCredentials: true,
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 10000,
        randomizationFactor: 0.5,
      }
    );

    socketInstance.on("connect", () => {
      console.log(`[${new Date().toISOString()}] Socket connected:`, socketInstance.id);
      setIsConnected(true);
    });

    socketInstance.on("disconnect", (reason) => {
      console.error(`[${new Date().toISOString()}] Socket disconnected. Reason: ${reason}`);
      if (reason === "io server disconnect") {
        // the disconnection was initiated by the server, you need to reconnect manually
        socketInstance.connect();
      }
      setIsConnected(false);
    });

    socketInstance.io.on("reconnect_attempt", (attempt) => {
      console.warn(`[${new Date().toISOString()}] Socket reconnecting... Attempt: ${attempt}`);
    });

    socketInstance.io.on("reconnect", (attempt) => {
      console.log(`[${new Date().toISOString()}] Socket successfully reconnected after ${attempt} attempts`);
    });

    socketInstance.on("connect_error", (error) => {
      console.error(`[${new Date().toISOString()}] Socket connect error:`, error.message);
    });

    socketInstance.on("connected", (data) => {
      console.log("Server connected event:", data);
    });

    setSocket(socketInstance);

    return () => {
      console.log("Cleaning socket");
      socketInstance.removeAllListeners();
      socketInstance.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!socket || !isConnected) return;
    const interval = setInterval(() => {
      socket.emit("heartbeat");
    }, 20000);
    return () => clearInterval(interval);
  }, [socket, isConnected]);

  useEffect(() => {
    if (!socket || !isConnected) return;

    let isIdle = false;
    let timeout: NodeJS.Timeout;

    const resetIdleTimeout = () => {
      clearTimeout(timeout);
      
      if (isIdle) {
        isIdle = false;
        socket.emit("user_idle", { is_idle: false });
      }

      timeout = setTimeout(() => {
        isIdle = true;
        socket.emit("user_idle", { is_idle: true });
      }, 5 * 60 * 1000); // 5 minutes
    };

    resetIdleTimeout();

    const events = ["mousemove", "keydown", "scroll", "touchstart", "click"];
    events.forEach((event) => {
      window.addEventListener(event, resetIdleTimeout);
    });

    return () => {
      clearTimeout(timeout);
      events.forEach((event) => {
        window.removeEventListener(event, resetIdleTimeout);
      });
    };
  }, [socket, isConnected]);

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
