import { useState, useRef, useEffect } from "react";
import "./Messages.css";
import { supabase } from "../supabaseClient.js";

export default function Message() {
  const [messages, setMessages] = useState([]);

  const [inputText, setInputText] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage() {
    if (!inputText.trim()) return;

    const newMessage = {
      sender: "User",
      text: inputText.trim(),
    };

    const { data, error } = await supabase
      .from("messages")
      .insert(newMessage)
      .select()

    if (error) {
      console.error("Error sending message:", error);
      return;
    }

    setMessages(prev => [...prev, data[0]]);
    setInputText("");
  }

  useEffect(() => {
    loadMessages();
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel("public:messages")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          setMessages((prev) => [...prev, payload.new]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function loadMessages() {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .order("created_at", { ascending: true });
      
    if (error) {
      console.error("Error loading messages:", error);
      return;
    }
    setMessages(data);
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
