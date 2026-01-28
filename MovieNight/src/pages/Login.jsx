import { useState } from "react";
import { supabase } from "../supabaseClient";
import { Box, Button, TextField, Stack, Typography, Paper } from "@mui/material";

export default function Login({ switchToSignup, continueAsGuest }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function login() {
    await supabase.auth.signInWithPassword({ email, password });
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#111827", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <Paper sx={{ p: 4, maxWidth: 400, width: "100%", bgcolor: "#1f2937" }}>
        <Typography variant="h4" sx={{ color: "white", textAlign: "center", mb: 3 }}>
          Login
        </Typography>

        <Stack spacing={2}>
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

          <Button variant="contained" sx={{ bgcolor: "#6366f1" }} onClick={login}>
            Login
          </Button>

          <Button variant="outlined" sx={{ color: "white", borderColor: "white" }} onClick={continueAsGuest}>
            Continue as Guest
          </Button>

          <Button variant="text" sx={{ color: "#93c5fd" }} onClick={switchToSignup}>
            Need an account?
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}
