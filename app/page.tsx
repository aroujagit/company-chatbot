"use client";
import { useState } from "react";

export default function Home() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);

  const sendMessage = async () => {
    if (!question) return;

    const userMessage = { role: "user", text: question };
    setMessages(prev => [...prev, userMessage]);

    const res = await fetch("YOUR_N8N_WEBHOOK_URL", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ question })
    });

    const data = await res.json();

    const botMessage = { role: "bot", text: data.answer };

    setMessages(prev => [...prev, botMessage]);
    setQuestion("");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold mb-4">Premier consulting</h1>

      <div className="w-full max-w-xl border rounded p-4 h-96 overflow-y-auto mb-4">
        {messages.map((msg, i) => (
          <div key={i} className="mb-2">
            <b>{msg.role === "user" ? "You:" : "AI:"}</b> {msg.text}
          </div>
        ))}
      </div>

      <div className="flex w-full max-w-xl">
        <input
          className="flex-1 border p-2"
          value={question}
          onChange={e => setQuestion(e.target.value)}
          placeholder="Ask something..."
        />
        <button
          className="bg-black text-white px-4"
          onClick={sendMessage}
        >
          Send
        </button>
      </div>
    </div>
  );
}
