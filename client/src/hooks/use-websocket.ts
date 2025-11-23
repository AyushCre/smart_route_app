import { useEffect, useRef, useState } from "react";
import { queryClient } from "@/lib/queryClient";

export function useWebSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    try {
      // Use the same host and protocol as the current page
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const host = window.location.host; // This includes both hostname and port
      const wsUrl = `${protocol}//${host}/ws`;

      console.log("Attempting WebSocket connection to:", wsUrl);
      
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("WebSocket connected");
        setIsConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          
          if (message.type === "vehicle_update") {
            queryClient.invalidateQueries({ queryKey: ["/api/vehicles"] });
            queryClient.invalidateQueries({ queryKey: ["/api/vehicles/active"] });
            queryClient.invalidateQueries({ queryKey: ["/api/iot/sensors"] });
          }
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        setIsConnected(false);
      };

      ws.onclose = () => {
        console.log("WebSocket disconnected");
        setIsConnected(false);
      };
    } catch (error) {
      console.error("Failed to create WebSocket:", error);
    }

    return () => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close();
      }
    };
  }, []);

  return { isConnected };
}
