import { supabase } from "../../supabase";

// Get or create a session ID for this browser tab
const getSessionId = () => {
  let sessionId = sessionStorage.getItem("phantom_fantasy_session");
  if (!sessionId) {
    sessionId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    sessionStorage.setItem("phantom_fantasy_session", sessionId);
  }
  return sessionId;
};

export const trackEvent = async (eventName: string, eventData: any = {}) => {
  try {
    const sessionId = getSessionId();
    const isAdmin = localStorage.getItem("admin_analytics_exclude") === "true";
    await supabase.from("analytics_events").insert([
      {
        event_name: eventName,
        event_data: { ...eventData, is_admin: isAdmin },
        session_id: sessionId,
      },
    ]);
  } catch (err) {
    // Fail silently if table doesn't exist or other network errors
    console.warn("Analytics event failed", err);
  }
};
