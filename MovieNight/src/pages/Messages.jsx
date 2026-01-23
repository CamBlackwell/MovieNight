import { useState, useRef, useEffect } from "react";
import "./Messages.css";

export default function Message() {
  const [messages, setMessages] = useState([
    { id: 1, sender: "system", text: "Welcome to MovieNight!" }
  ]);

  const [inputText, setInputText] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function sendMessage() {
    if (!inputText.trim()) return;

    const newMessage = {
      id: Date.now(),
      sender: "user",
      text: inputText.trim()
    };

    setMessages([...messages, newMessage]);
    setInputText("");
  }

  function handleKeyPress(e) {
    if (e.key === "Enter") sendMessage();
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Messages</h1>

      <div style={styles.messageList}>
        {messages.map((message) => (
          <div key={message.id} style={styles.messageBubble}>
            <strong>{message.sender}: </strong>{message.text}
          </div>
        ))}

        <div ref={bottomRef} />
      </div>

      <div style={styles.inputBar}>
        <input
          style={styles.input}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type a message..."
          onKeyDown={handleKeyPress}
        />
        <button style={styles.sendButton} onClick={sendMessage}>
          Send
        </button>
      </div>
    </div>
  );


}const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    padding: "1rem"
  },
  header: {
    margin: 0,
    marginBottom: "1rem"
  },
  messageList: {
    flex: 1,
    overflowY: "auto",
    padding: "1rem",
    borderRadius: "6px",
    background: "#1f2937"
  },
  messageBubble: {
    background: "#374151",
    padding: "0.75rem 1rem",
    borderRadius: "8px",
    marginBottom: "0.5rem",
    color: "white"
  },
  inputBar: {
    display: "flex",
    gap: "0.5rem",
    marginTop: "1rem"
  },
  input: {
    flex: 1,
    padding: "0.75rem",
    borderRadius: "8px",
    border: "1px solid #555",
    outline: "none"
  },
  sendButton: {
    padding: "0.75rem 1.25rem",
    borderRadius: "8px",
    border: "none",
    background: "#4f46e5",
    color: "white",
    cursor: "pointer"
  }
};
