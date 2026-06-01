import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "../../supabase";

interface AuthContextType {
  user: User | null;
  isAuthReady: boolean;
  isLoggingIn: boolean;
  showFrameWarning: boolean;
  isAdmin: boolean;
  isSupabaseConfigured: boolean;
  handleLogin: () => Promise<void>;
  handleLogout: () => Promise<void>;
  setShowFrameWarning: (show: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showFrameWarning, setShowFrameWarning] = useState(false);

  const isAdmin = user?.email === "davidmv1985@gmail.com";
  const isSupabaseConfigured =
    !!(import.meta as any).env.VITE_SUPABASE_URL &&
    !!(import.meta as any).env.VITE_SUPABASE_ANON_KEY;

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error("Supabase session error:", error);
        if (error.message.includes("Refresh Token Not Found") || error.message.includes("Invalid Refresh Token")) {
          supabase.auth.signOut().catch(() => {}); // Attempt to clear the corrupt state silently
        }
      }
      setUser((session?.user as User) ?? null);
      setIsAuthReady(true);
      if (session && !error) {
        setIsLoggingIn(false);
      }
    }).catch((err) => {
      console.error("Supabase getSession catch error:", err);
      setIsAuthReady(true);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser((session?.user as User) ?? null);
      setIsAuthReady(true);
      if (session) {
        setIsLoggingIn(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      // Use popup ONLY when running in the AI Studio iframe (run.app)
      const isAIStudioIframe = window !== window.top && window.location.hostname.includes("run.app");

      if (!isAIStudioIframe) {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo: window.location.origin + window.location.pathname,
          },
        });
        if (error) throw error;
        return; // Page will redirect
      }

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin + window.location.pathname,
          skipBrowserRedirect: true,
        },
      });

      if (error) throw error;

      if (data?.url) {
        const popup = window.open(
          data.url,
          "oauth_popup",
          "width=600,height=700"
        );
        if (!popup) {
          setShowFrameWarning(true);
          setIsLoggingIn(false);
          return;
        }

        const checkPopup = setInterval(async () => {
          if (popup.closed) {
            clearInterval(checkPopup);
            setTimeout(() => {
              setIsLoggingIn(prev => { if (prev) return false; return prev; });
            }, 1000);
            return;
          }

          try {
            const popupUrl = popup.location.href;
            if (popupUrl && popupUrl.startsWith(window.location.origin)) {
              // Extract from hash (implicit flow)
              if (popupUrl.includes('#access_token=')) {
                const hash = new URL(popupUrl).hash.substring(1);
                const params = new URLSearchParams(hash);
                const access_token = params.get('access_token');
                const refresh_token = params.get('refresh_token');
                
                if (access_token && refresh_token) {
                  clearInterval(checkPopup);
                  popup.close();
                  await supabase.auth.setSession({ access_token, refresh_token });
                  setIsLoggingIn(false);
                }
              }
              // Extract from search (PKCE flow)
              else if (popupUrl.includes('?code=') || popupUrl.includes('&code=')) {
                const search = new URL(popupUrl).search;
                const params = new URLSearchParams(search);
                const code = params.get('code');
                
                if (code) {
                  clearInterval(checkPopup);
                  popup.close();
                  await supabase.auth.exchangeCodeForSession(code);
                  setIsLoggingIn(false);
                }
              }
            }
          } catch (e) {
            // Ignore Cross-Origin errors, normal while navigating Google
          }
        }, 500);
      }
    } catch (error) {
      console.error("Login failed", error);
      alert(
        "Error al iniciar sesión. Revisa la consola (F12) para ver el error técnico.",
      );
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthReady,
        isLoggingIn,
        showFrameWarning,
        isAdmin,
        isSupabaseConfigured,
        handleLogin,
        handleLogout,
        setShowFrameWarning,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
