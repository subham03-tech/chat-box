"use client";

import { useState,useEffect,useRef } from "react";
import axios from "axios";

export default function ChatBox() {
  const [messages, setMessages] = useState<{ role: string; text: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
 

  const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY; // 🔑 Store key in .env.local
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  

  const sendMessage = async () => {
    if (!input.trim()) return;

    // Add user message to UI
    const newMessages = [...messages, { role: "user", text: input }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await axios.post(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
        {
          contents: [
            {
              parts: [{ text: input }],
            },
          ],
        },
        {
          headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": GEMINI_API_KEY,
          },
        }
      );

      const botReply =
        res.data?.candidates?.[0]?.content?.parts?.[0]?.text || "No reply";

      setMessages([...newMessages, { role: "bot", text: botReply }]);
    } catch (error) {
      console.error(error);
      setMessages([
        ...newMessages,
        { role: "bot", text: "Error fetching response" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-indigo-900 via-gray-900 to-blue-950 text-white p-6">

      {/* Header */}
      <div className="text-center mb-4">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent drop-shadow-lg">
        ChatMate AI
        </h1>
        <p className="text-sm text-gray-400">Your personal AI assistant</p>
      </div>

      {/* Messages */}
      
      <div className="flex-1 overflow-y-auto bg-gray-800 rounded-xl p-6 shadow-inner space-y-4 border border-gray-700">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`p-3 rounded-lg max-w-lg ${
              msg.role === "user"
                ? "self-end bg-blue-600 text-white ml-auto"
                : "self-start bg-purple-600 text-white mr-auto"
            }`}
          >
            <span className="block text-xs mb-1  opacity-60">
              {msg.role === "user" ? "You" : " ChatMate AI"}
            </span>
            <p>{msg.text}</p>
          </div>
        ))}
        {loading && (
          <div className="text-yellow-400 italic text-sm"> AI is typing...</div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Field */}
      <div className="flex items-center gap-3 mt-6 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl px-4 py-3 shadow-xl focus-within:ring-2 focus-within:ring-cyan-400 transition-all duration-300">

        <input
          type="text"
          className={`flex-1 bg-transparent text-white placeholder-gray-400 outline-none ${
            input.trim() === "" ? "animate-pulse" : ""
          } focus:animate-none`}
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
          }}
          placeholder="Type your message..."
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />

        <button
          onClick={sendMessage}
          className="bg-gradient-to-br from-cyan-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:scale-105 hover:shadow-lg transition-all duration-200 flex items-center gap-2"
        >
          {/* Paper Plane Icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 12l14-7-7 14-2-5-5-2z"
            />
          </svg>
          Send
        </button>
      </div>
    </div>
  );
}