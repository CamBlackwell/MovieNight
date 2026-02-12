import { createContext, useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

export const AuthContext = createContext();

export default function AuthProvider({ children }) {
  const [activeUser, setActiveUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token_hash = params.get("token_hash");
    const type = params.get("type");

    if (token_hash) {
      supabase.auth.verifyOtp({
        token_hash,
        type: type || "email",
      }).then(({ error }) => {
        if (!error) {
          window.history.replaceState({}, document.title, "/");
        }
      });
    }

    supabase.auth.getClaims()
      .then(({ data: { claims } }) => {
        if (claims) {
          setActiveUser({ email: claims.email, id: claims.sub });
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Auth error:", error);
        setLoading(false);
      });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setActiveUser({ email: session.user.email, id: session.user.id });
      } else {
        setActiveUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const sendMagicLink = async (email) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });
    return { error };
  };

  const createGuest = async (name) => {
    setActiveUser({ email: `${name}@guest.local`, id: "guest" });
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setActiveUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        activeUser,
        loading,
        sendMagicLink,
        createGuest,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}