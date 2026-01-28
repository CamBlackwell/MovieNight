import { useState, useRef, useEffect } from "react";
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Stack,
  Avatar,
  Divider,
  Fade,
  IconButton,
} from "@mui/material";
import PhotoCamera from "@mui/icons-material/PhotoCamera";
import { supabase } from "../supabaseClient.js";

export default function Message({ username }) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);
  const [profile, setProfile] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    loadProfile();
    loadMessages();
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel("public:messages")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (payload) => {
        setMessages((p) => [...p, { ...payload.new, status: "sent" }]);
      })
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function loadProfile() {
    const { data } = await supabase.from("profiles").select("*").eq("username", username).single();
    if (data) {
      setProfile(data);
    } else {
      const { data: created } = await supabase
        .from("profiles")
        .insert({ username })
        .select()
        .single();
      setProfile(created);
    }
  }

  async function uploadAvatar(file) {
    const fileName = `${profile.id}-${Date.now()}.png`;
    const { error } = await supabase.storage.from("avatars").upload(fileName, file);
    if (error) return;
    const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(fileName);
    const url = urlData.publicUrl;
    await supabase.from("profiles").update({ avatar_url: url }).eq("id", profile.id);
    setProfile((p) => ({ ...p, avatar_url: url }));
  }

  async function sendMessage() {
    if (!inputText.trim() || sending) return;
    setSending(true);

    const optimistic = {
      id: "temp-" + Math.random().toString(36).slice(2),
      sender: username,
      text: inputText.trim(),
      avatar_url: profile?.avatar_url || null,
      created_at: new Date().toISOString(),
      status: "sending",
    };

    setMessages((p) => [...p, optimistic]);
    setInputText("");

    const { data, error } = await supabase
      .from("messages")
      .insert({
        sender: username,
        text: optimistic.text,
        avatar_url: profile?.avatar_url || null,
        profile_id: profile?.id,
      })
      .select();

    setSending(false);

    if (error) {
      setMessages((p) => p.map((m) => (m.id === optimistic.id ? { ...m, status: "error" } : m)));
      return;
    }

    setMessages((p) => p.map((m) => (m.id === optimistic.id ? { ...data[0], status: "sent" } : m)));
  }

  async function loadMessages() {
    const { data } = await supabase.from("messages").select("*").order("created_at", { ascending: true });
    setMessages(data.map((m) => ({ ...m, status: "sent" })));
  }

  function formatTime(d) {
    return new Date(d).toLocaleTimeString("en-AU", { hour: "numeric", minute: "2-digit" });
  }

  function isNewDay(a, b) {
    if (!b) return true;
    const x = new Date(a);
    const y = new Date(b);
    return x.getDate() !== y.getDate() || x.getMonth() !== y.getMonth() || x.getFullYear() !== y.getFullYear();
  }

  function dateLabel(d) {
    const x = new Date(d);
    const now = new Date();
    const y = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
    if (x.toDateString() === now.toDateString()) return "Today";
    if (x.toDateString() === y.toDateString()) return "Yesterday";
    return x.toLocaleDateString("en-AU", { day: "2-digit", month: "short", year: "numeric" });
  }

  return (
    <Box sx={{ height: "100%", p: 3, display: "flex", flexDirection: "column", bgcolor: "#111827" }}>
      <Typography variant="h4" sx={{ mb: 2, fontWeight: "bold", color: "white" }}>Messages</Typography>

      <Paper elevation={3} sx={{ flex: 1, p: 2, overflowY: "auto", borderRadius: 3, bgcolor: "#1f2937" }}>
        <Stack spacing={2}>
          {messages.map((m, i) => {
            const prev = messages[i - 1];
            const showDate = isNewDay(m.created_at, prev?.created_at);

            return (
              <Fade in key={m.id}>
                <Box>
                  {showDate && (
                    <Box sx={{ textAlign: "center", my: 2 }}>
                      <Divider sx={{ "&::before, &::after": { borderColor: "#4b5563" } }}>
                        <Typography sx={{ color: "#9ca3af", fontSize: "0.85rem" }}>{dateLabel(m.created_at)}</Typography>
                      </Divider>
                    </Box>
                  )}

                  <Stack direction="row" spacing={1} sx={{ justifyContent: m.sender === username ? "flex-end" : "flex-start" }}>
                    {m.sender !== username && (
                      <Avatar src={m.avatar_url || null} sx={{ width: 36, height: 36, bgcolor: "#4b5563" }}>
                        {m.sender[0]}
                      </Avatar>
                    )}

                    <Paper
                      sx={{
                        p: 1.5,
                        bgcolor: m.sender === username ? "#6366f1" : "#374151",
                        maxWidth: "70%",
                        borderRadius: 3,
                      }}
                    >
                      <Typography sx={{ fontSize: "0.8rem", color: "#d1d5db" }}>{m.sender}</Typography>
                      <Typography sx={{ color: m.sender === username ? "white" : "#e5e7eb" }}>{m.text}</Typography>
                      <Typography sx={{ mt: 0.5, fontSize: "0.7rem", color: "#cbd5e1", opacity: 0.7, textAlign: "right" }}>
                        {m.status === "sending" ? "Sending…" : m.status === "error" ? "Failed" : formatTime(m.created_at)}
                      </Typography>
                    </Paper>

                    {m.sender === username && (
                      <Avatar src={profile?.avatar_url || null} sx={{ width: 36, height: 36, bgcolor: "#6366f1" }}>
                        {username[0]}
                      </Avatar>
                    )}
                  </Stack>
                </Box>
              </Fade>
            );
          })}
          <div ref={bottomRef} />
        </Stack>
      </Paper>

      <Stack direction="row" spacing={1.5} sx={{ mt: 2 }}>
        <IconButton component="label" sx={{ bgcolor: "#374151", width: 48, height: 48, borderRadius: 2 }}>
          <PhotoCamera sx={{ color: "white" }} />
          <input type="file" hidden accept="image/*" onChange={(e) => uploadAvatar(e.target.files[0])} />
        </IconButton>

        <TextField
          fullWidth
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type a message…"
          variant="outlined"
          sx={{
            bgcolor: "#374151",
            borderRadius: 2,
            input: { color: "white" },
            "& .MuiOutlinedInput-notchedOutline": { borderColor: "#4b5563" },
          }}
        />

        <Button
          variant="contained"
          onClick={sendMessage}
          disabled={sending}
          sx={{
            bgcolor: sending ? "#4b5563" : "#6366f1",
            px: 3,
            borderRadius: 2,
            textTransform: "none",
          }}
        >
          {sending ? "…" : "Send"}
        </Button>
      </Stack>
    </Box>
  );
}
