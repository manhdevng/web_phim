"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sparkles, Brain, Loader2, CheckCircle2, Info, MessageSquare, Send, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface MovieAIAssistantProps {
  description: string;
}

type Mode = "summary" | "chat";

const renderMessage = (text: string) => {
  // Regex pattern to match [text](url)
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  
  // First, we split the text into an array where odd indices are the matched links
  const parts = text.split(linkRegex);
  
  if (parts.length === 1) {
    // If no links, just handle bold **text**
    return <span dangerouslySetInnerHTML={{ __html: text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>') }} />;
  }

  const result = [];
  for (let i = 0; i < parts.length; i += 3) {
    // Normal text before link
    if (parts[i]) {
      result.push(<span key={`text-${i}`} dangerouslySetInnerHTML={{ __html: parts[i].replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>') }} />);
    }
    
    // Link text and url
    if (i + 1 < parts.length && i + 2 < parts.length) {
      const linkText = parts[i + 1];
      const linkUrl = parts[i + 2];
      result.push(
        <Link 
          href={linkUrl} 
          key={`link-${i}`}
          className="inline-flex items-center gap-1 mt-2 mb-1 px-4 py-2 bg-cinema-gold/20 border border-cinema-gold text-cinema-gold hover:bg-cinema-gold hover:text-black font-bold rounded-full transition-all duration-300 shadow-[0_0_15px_rgba(255,215,0,0.2)] hover:shadow-[0_0_20px_rgba(255,215,0,0.4)]"
        >
          {linkText.replace(/▶\s*/, '')} {/* We remove the play icon text and add our own or just keep it clean */}
        </Link>
      );
    }
  }
  return result;
};

export default function MovieAIAssistant({ description }: MovieAIAssistantProps) {
  const [mode, setMode] = useState<Mode>("summary");
  const [summary, setSummary] = useState<string | null>(null);
  const [chatMessage, setChatMessage] = useState("");
  const [messages, setMessages] = useState<{role: "user" | "assistant", content: string}[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAskAI = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/ai/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: description }),
      });
      
      const result = await response.json();
      
      if (result.summary_text) {
        setSummary(result.summary_text);
      } else if (result.error) {
        setError(`Lỗi AI: ${result.error}`);
      } else {
        setError("Không nhận được phản hồi từ AI.");
      }
    } catch (err: any) {
      setError(`Lỗi kết nối: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    const userMsg = chatMessage.trim();
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setChatMessage("");
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg }),
      });
      
      const result = await response.json();
      
      if (result.answer) {
        setMessages(prev => [...prev, { role: "assistant", content: result.answer }]);
      } else if (result.error) {
        setError(`Lỗi: ${result.error}`);
      }
    } catch (err: any) {
      setError(`Lỗi kết nối: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-8 p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl relative overflow-hidden group">
      {/* Background Glow Effect */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-cinema-gold/10 blur-[100px] group-hover:bg-cinema-gold/20 transition-all duration-700" />
      
      <div className="relative z-10 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cinema-gold/20 border border-cinema-gold/30">
              <Brain className="w-5 h-5 text-cinema-gold" />
            </div>
            <div>
              <h4 className="text-white font-bold flex items-center gap-2">
                Trợ lý AI PhimHayViet
                <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-white/40 uppercase tracking-tighter font-black">RAG Mode</span>
              </h4>
              <p className="text-xs text-white/40">
                {mode === "summary" ? "Sử dụng AI để hiểu sâu hơn về bộ phim này." : "Hỏi AI về bất kỳ phim nào trong toàn bộ kho phim."}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            {mode === "summary" ? (
              <button 
                onClick={() => setMode("chat")}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white border border-white/20 rounded-full text-xs font-medium hover:bg-white/20 transition-all"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                Hỏi về kho phim
              </button>
            ) : (
              <button 
                onClick={() => {
                  setMode("summary");
                }}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white border border-white/20 rounded-full text-xs font-medium hover:bg-white/20 transition-all"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Quay lại tóm tắt
              </button>
            )}

            {mode === "summary" && !summary && !isLoading && (
              <button 
                onClick={handleAskAI}
                className="flex items-center gap-2 px-4 py-2 bg-cinema-gold text-black rounded-full text-xs font-bold hover:scale-105 active:scale-95 transition-all shadow-lg shadow-cinema-gold/20"
              >
                <Sparkles className="w-3.5 h-3.5 fill-black" />
                Tóm tắt nhanh
              </button>
            )}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {mode === "summary" ? (
            isLoading ? (
              <motion.div 
                key="loading-summary"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col items-center py-6 gap-3"
              >
                <Loader2 className="w-8 h-8 text-cinema-gold animate-spin" />
                <p className="text-sm text-stone-400 italic">AI đang phân tích kịch bản...</p>
              </motion.div>
            ) : summary ? (
              <motion.div 
                key="summary-result"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="flex flex-col gap-3"
              >
                <div className="h-[1px] w-full bg-white/10" />
                <div className="flex gap-3">
                  <CheckCircle2 className="w-4 h-4 text-cinema-gold flex-shrink-0 mt-1" />
                  <p className="text-sm text-stone-300 leading-relaxed italic">
                    "{summary}"
                  </p>
                </div>
                <p className="text-[10px] text-white/20 mt-2 flex items-center gap-1">
                  <Info className="w-3 h-3" />
                  Kết quả tóm tắt dựa trên mô tả gốc từ kho phim PhimHayViet.
                </p>
              </motion.div>
            ) : error ? (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-red-400 mt-2 bg-red-400/10 p-2 rounded border border-red-400/20">
                {error}
              </motion.p>
            ) : null
          ) : (
            <motion.div 
              key="chat-mode"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col gap-4"
            >
              <div className="h-[1px] w-full bg-white/10" />
              
              {messages.length > 0 && (
                <div className="flex flex-col gap-4 max-h-[350px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                  {messages.map((msg, idx) => (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
                    >
                      <div className={`max-w-[85%] p-3 rounded-2xl ${msg.role === "user" ? "bg-cinema-gold text-black rounded-tr-sm" : "bg-white/10 text-stone-200 border border-white/10 rounded-tl-sm"}`}>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.role === "assistant" ? renderMessage(msg.content) : msg.content}</p>
                      </div>
                    </motion.div>
                  ))}
                  {isLoading && (
                     <div className="flex items-start">
                       <div className="max-w-[85%] p-3 rounded-2xl bg-white/10 border border-white/10 rounded-tl-sm flex gap-2 items-center">
                         <Loader2 className="w-4 h-4 text-cinema-gold animate-spin" />
                         <span className="text-sm text-stone-400">AI đang suy nghĩ...</span>
                       </div>
                     </div>
                  )}
                </div>
              )}

              <form onSubmit={handleChat} className="relative mt-2">
                <input 
                  type="text"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  placeholder="Bạn muốn tìm phim gì? (VD: Phim hành động của Tom Cruise...)"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-cinema-gold/50 transition-all pr-12"
                />
                <button 
                  type="submit"
                  disabled={isLoading || !chatMessage.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-cinema-gold text-black rounded-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>

              {error && (
                <p className="text-xs text-red-400 bg-red-400/10 p-2 rounded border border-red-400/20 mt-2">
                  {error}
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
