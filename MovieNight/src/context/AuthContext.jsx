import { createContext, useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { v4 as uuidv4 } from "uuid";

export const AuthContext = createContext();

export default function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [guest, setGuest] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedGuest = localStorage.getItem("guest_profile");
    if (storedGuest) setGuest(JSON.parse(storedGuest));

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session) loadProfile(data.session.user.id);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) loadProfile(session.user.id);
      else setProfile(null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  async function loadProfile(id) {
    const { data } = await supabase.from("profiles").select("*").eq("id", id).single();
    setProfile(data);
  }

  function createGuest(name = "Guest") {
    const guestProfile = {
      id: uuidv4(),
      username: name,
      avatar_url: null,
      is_guest: true
    };
    localStorage.setItem("guest_profile", JSON.stringify(guestProfile));
    setGuest(guestProfile);
  }

  function logout() {
    localStorage.removeItem("guest_profile");
    setGuest(null);
    supabase.auth.signOut();
  }

  const activeUser = session ? profile : guest;

  return (
    <AuthContext.Provider value={{ session, profile, guest, activeUser, loading, createGuest, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
