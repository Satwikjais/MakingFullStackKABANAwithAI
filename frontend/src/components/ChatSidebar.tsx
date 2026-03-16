"use client";

import React, { useState } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatSidebarProps {
  userId: number;
  onBoardUpdate: () => void;
  open: boolean;
  onClose: () => void;
}

export const ChatSidebar = ({ userId, onBoardUpdate, open, onClose }: ChatSidebarProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const userMessage: Message = { role: "user", content: trimmed };
    const updatedHistory = [...messages, userMessage];

    setMessages(updatedHistory);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId,
          prompt: userMessage.content,
          history: updatedHistory,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const assistantMessage: Message = {
          role: "assistant",
          content: typeof data.message === "string" ? data.message : "(no response)",
        };
        setMessages(prev => [...prev, assistantMessage]);

        if (Array.isArray(data.actions) && data.actions.length > 0) {
          onBoardUpdate();
        }
      } else {
        const errorMessage: Message = {
          role: "assistant",
          content: `Error: ${data.detail || "Something went wrong"}`,
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      const errorMessage: Message = {
        role: "assistant",
        content: "Sorry, I couldn't connect to the AI service.",
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <aside
      className={`absolute right-0 top-0 h-full w-80 flex-shrink-0 border-l border-[var(--stroke)] bg-white/90 backdrop-blur flex flex-col transition-all duration-200 shadow-xl ${
        open ? "block" : "hidden"
      }`}
    >
      <div className="p-6 border-b border-[var(--stroke)]">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[var(--gray-text)]">
            AI Assistant
          </p>
          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded uppercase tracking-wider">
            Live
          </span>
        </div>
        <h2 className="font-display text-2xl font-semibold text-[var(--navy-dark)]">
          Chat
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-[var(--gray-text)] text-sm mt-8">
            Start a conversation to manage your cards with AI
          </div>
        )}
        {messages.map((message, index) => (
          <div key={index} className="space-y-2">
            {message.role === "user" && (
              <div className="text-xs font-semibold uppercase tracking-wider text-[var(--navy-dark)]">
                You
              </div>
            )}
            <div
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-lg px-4 py-3 text-sm leading-relaxed ${
                  message.role === "user"
                    ? "bg-[var(--primary-blue)] text-white rounded-br-none"
                    : "bg-gray-100 text-[var(--navy-dark)] rounded-bl-none"
                }`}
              >
                {message.content}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="space-y-2">
            <div className="text-xs font-semibold uppercase tracking-wider text-[var(--navy-dark)]">
              AI Assistant
            </div>
            <div className="bg-gray-100 rounded-lg rounded-bl-none px-4 py-3 text-sm text-[var(--navy-dark)]">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-[var(--stroke)]">
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask the assistant"
            className="flex-1 resize-none rounded-lg border border-[var(--stroke)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-blue)] placeholder-gray-400"
            rows={3}
            disabled={loading}
          />
        </div>
      </div>
    </aside>
  );
};