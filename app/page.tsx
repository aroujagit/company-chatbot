"use client";
import { useState, useRef } from "react";

interface Message {
  role: "user" | "assistant";
  text: string;
  sources?: string[];
}

export default function Home() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
const sendMessage = async () => {
  console.log("🔵 sendMessage called");
  console.log("  - question:", question);
  console.log("  - isLoading:", isLoading);
  console.log("  - messages length:", messages.length);

  if (!question.trim() || isLoading) {
    console.log("❌ Early exit: no question or already loading");
    return;
  }

  const currentQuestion = question.trim();
  console.log("✅ Processing question:", currentQuestion);
  
  // Get history from current messages (last 2 exchanges = 4 messages)
  const historyMessages = messages.slice(-4);
  console.log("📜 History messages (last 4):", historyMessages);
  
  const history = historyMessages.map(msg => ({
    role: msg.role,
    content: msg.text
  }));
  console.log("📤 History for API:", history);

  // Add user message to UI and clear input
  const userMessage: Message = { role: "user", text: currentQuestion };
  console.log("👤 Adding user message:", userMessage);
  
  setMessages(prev => {
    console.log("  - setMessages (user) previous length:", prev.length);
    const newMessages = [...prev, userMessage];
    console.log("  - new messages length:", newMessages.length);
    return newMessages;
  });
  
  setQuestion("");
  console.log("🧹 Cleared input");
  
  setIsLoading(true);
  console.log("⏳ isLoading set to true");
  
  setTimeout(() => {
    console.log("📜 Scrolling to bottom (user message)");
    scrollToBottom();
  }, 100);

  try {
    const url = "http://localhost:5678/webhook-test/chat";
    const payload = {
      body: {
        question: currentQuestion,
        history: history
      }
    };
    console.log("🌐 Sending fetch to:", url);
    console.log("📦 Payload:", JSON.stringify(payload, null, 2));
    
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    
    console.log("📡 Response status:", res.status);
    console.log("📡 Response headers:", Object.fromEntries(res.headers.entries()));
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error("❌ HTTP error body:", errorText);
      throw new Error(`HTTP error ${res.status}: ${errorText}`);
    }
    
    const data = await res.json();
    console.log("✅ API response data:", data);
    
    const botMessage: Message = {
      role: "assistant",
      text: data.answer || "Sorry, no answer received.",
      sources: data.sources || []
    };
    console.log("🤖 Bot message:", botMessage);
    
    setMessages(prev => {
      console.log("  - setMessages (bot) previous length:", prev.length);
      const newMessages = [...prev, botMessage];
      console.log("  - new messages length:", newMessages.length);
      return newMessages;
    });
  } catch (error) {
    console.error("🔥 Fetch error:", error);
    const errorMessage: Message = {
      role: "assistant",
      text: `Error occurred. You can still visit our website bellow:
      https://premiere-consulting.tn
      `,
      sources: ["https://premiere-consulting.tn"]
    };
    setMessages(prev => [...prev, errorMessage]);
  } finally {
    console.log("🏁 Finally: setting isLoading to false");
    setIsLoading(false);
    setTimeout(() => {
      console.log("📜 Scrolling to bottom (after response)");
      scrollToBottom();
    }, 100);
  }
};

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-white">
      <img 
        src="/images/logo.png" 
        alt="Premier Consulting Logo" 
        className="w-24 h-24 mb-4"
      />
      <h1 className="text-2xl font-bold mb-4 text-gray-800">Premier consulting</h1>

      <div className="w-full max-w-xl border border-gray-700 rounded-2xl p-6 h-96 overflow-y-auto mb-4 bg-black shadow-xl">
        {messages.map((msg, i) => (
          <div key={i} className={`mb-4 p-3 rounded-xl ${
            msg.role === "user" 
              ? "bg-blue-900 ml-8 text-right" 
              : "bg-gray-800 mr-8"
          }`}>
            <div className={`font-semibold text-sm ${
              msg.role === "user" ? "text-blue-300" : "text-gray-300"
            }`}>
              {msg.role === "user" ? "You:" : "AI:"}
            </div>
            <div className="text-white mt-1">{msg.text}</div>
            {msg.sources && msg.sources.length > 0 && (
              <div className="mt-2 text-xs text-gray-400">
                Sources: {msg.sources.map((source, idx) => (
                  <a 
                    key={idx}
                    href={source}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 underline ml-1"
                  >
                    [{idx + 1}]
                  </a>
                ))}
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="mb-4 p-3 rounded-xl bg-gray-800 mr-8">
            <div className="font-semibold text-sm text-gray-300">AI:</div>
            <div className="text-white mt-1 flex items-center">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
              <span className="ml-2 text-gray-400 text-sm">Thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex w-full max-w-xl gap-2">
        <input
          className={`flex-1 border border-gray-600 bg-gray-900 text-white rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent placeholder-gray-400 ${
            isLoading ? "opacity-50 cursor-not-allowed" : ""
          }`}
          value={question}
          onChange={e => setQuestion(e.target.value)}
          placeholder="Ask something..."
          onKeyPress={e => e.key === 'Enter' && !isLoading && sendMessage()}
          disabled={isLoading}
        />
        <button
          className={`px-6 py-3 rounded-full font-medium transition-colors ${
            isLoading 
              ? "bg-gray-400 text-gray-200 cursor-not-allowed" 
              : "bg-blue-600 text-white hover:bg-blue-500 cursor-pointer"
          }`}
          onClick={sendMessage}
          disabled={isLoading}
        >
          {isLoading ? "..." : "Send"}
        </button>
      </div>
    </div>
  );
}