import Login from "./login";
import Signup from "./Signup";

export default function AuthGate({ mode, switchMode, continueAsGuest }) {
  return mode === "login" ? (
    <Login switchToSignup={() => switchMode("signup")} continueAsGuest={continueAsGuest} />
  ) : (
    <Signup switchToLogin={() => switchMode("login")} />
  );
}
