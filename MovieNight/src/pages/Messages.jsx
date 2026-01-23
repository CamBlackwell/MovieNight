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
    <div className="messages-container">
      <h1 className="messages-header">Messages</h1>

      <div className="messages-list">
        {messages.map((message) => (
          <div key={message.id} className="message-bubble">
            <strong>{message.sender}: </strong>{message.text}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="messages-inputBar">
        <input
          className="messages-input"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type a message..."
          onKeyDown={handleKeyPress}
        />
        <button className="messages-button" onClick={sendMessage}>
          Send
        </button>
      </div>
    </div>
  );
}
