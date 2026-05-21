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

  const [isConnected, setIsConnected] =
    useState(false);

  useEffect(() => {
    const token = Cookies.get("accessToken");

    console.log("SOCKET TOKEN:", token);

    if (!token) {
      console.log("SocketProvider: No access token found, skipping socket connection");
      return;
    }

    const socketInstance = io(
      process.env.NEXT_PUBLIC_API_URL ||
      "http://localhost:3003",
      {
        transports: ["websocket"],

        auth: {
          token,
        },

        withCredentials: true,

        reconnection: true,

        reconnectionAttempts: 5,

        reconnectionDelay: 1000,
      }
    );

    socketInstance.on("connect", () => {
      console.log(
        "Socket connected:",
        socketInstance.id
      );

      setIsConnected(true);
    });

    socketInstance.on("disconnect", (reason) => {
      console.log(
        "Socket disconnected:",
        reason
      );

      setIsConnected(false);
    });

    socketInstance.on(
      "connect_error",
      (error) => {
        console.error(
          "Socket connect error:",
          error.message
        );
      }
    );

    socketInstance.on("connected", (data) => {
      console.log(
        "Server connected event:",
        data
      );
    });

    setSocket(socketInstance);

    return () => {
      console.log("Cleaning socket");

      socketInstance.removeAllListeners();

      socketInstance.disconnect();
    };
  }, []);

  // Periodic Heartbeat ping every 20 seconds
  useEffect(() => {
    if (!socket || !isConnected) return;
    const interval = setInterval(() => {
      socket.emit("heartbeat");
    }, 20000);
    return () => clearInterval(interval);
  }, [socket, isConnected]);

  // User Activity Monitoring (Idle detection after 5 minutes)
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