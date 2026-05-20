import { useState, useEffect } from "react";

export function useNetworkState() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );

  useEffect(() => {
    const checkNetwork = async () => {
      if (!navigator.onLine) {
        setIsOnline(false);
        return;
      }
      try {
        await fetch("/ping.txt", { method: "HEAD", cache: "no-store", headers: { 'Cache-Control': 'no-cache' } });
        setIsOnline(true);
      } catch (error) {
        setIsOnline(false);
      }
    };

    const handleOnline = () => checkNetwork();
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Active polling every 5 seconds to catch "lie" online statuses 
    // (e.g. captive portal or dead router, which navigator.onLine misses)
    const interval = setInterval(checkNetwork, 5000);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearInterval(interval);
    };
  }, []);

  return isOnline;
}
