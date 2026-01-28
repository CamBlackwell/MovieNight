import { useState } from "react";
import { supabase } from "../supabaseClient";
import { Box, Button, TextField, Stack, Typography, Paper } from "@mui/material";

export default function Signup({ switchToLogin }) {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  async function signup() {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin }
    });

    if (error || !data.user) return;

    await supabase
      .from("profiles")
      .insert({
        id: data.user.id,
        username,
        avatar_url: null,
        is_guest: false
      });

    await supabase.auth.signInWithPassword({
      email,
      password
    });
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#111827", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <Paper sx={{ p: 4, maxWidth: 400, width: "100%", bgcolor: "#1f2937" }}>
        <Typography variant="h4" sx={{ color: "white", textAlign: "center", mb: 3 }}>
          Create Account
        </Typography>

        <Stack spacing={2}>
          <TextField
            label="Username"
            onChange={(e) => setUsername(e.target.value)}
            InputProps={{ style: { color: "white" } }}
            InputLabelProps={{ style: { color: "#9ca3af" } }}
          />
          <TextField
            label="Email"
            onChange={(e) => setEmail(e.target.value)}
            InputProps={{ style: { color: "white" } }}
            InputLabelProps={{ style: { color: "#9ca3af" } }}
          />
          <TextField
            label="Password"
            type="password"
            onChange={(e) => setPassword(e.target.value)}
            InputProps={{ style: { color: "white" } }}
            InputLabelProps={{ style: { color: "#9ca3af" } }}
          />

          <Button variant="contained" sx={{ bgcolor: "#10b981" }} onClick={signup}>
            Create Account
          </Button>

          <Button variant="text" onClick={switchToLogin} sx={{ color: "#93c5fd" }}>
            Back to Login
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}
