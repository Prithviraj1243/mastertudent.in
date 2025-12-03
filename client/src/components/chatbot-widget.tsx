import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  MessageCircle,
  X,
  Send,
  Loader,
  Sparkles,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  type: "user" | "bot";
  content: string;
  timestamp: number;
}

interface Suggestion {
  text: string;
}

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "bot",
      content:
        "👋 Hi! I'm your StudentNotesMarketplace assistant. How can I help you today?",
      timestamp: Date.now(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch suggestions on mount
  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const response = await fetch("/api/chatbot/suggestions");
        const data = await response.json();
        if (data.success) {
          setSuggestions(data.suggestions);
        }
      } catch (error) {
        console.error("Failed to fetch suggestions:", error);
      }
    };

    fetchSuggestions();
  }, []);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSendMessage = async (text: string = inputValue) => {
    if (!text.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: text,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chatbot/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: text }),
      });

      const data = await response.json();

      if (data.success) {
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: "bot",
          content: data.message,
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, botMessage]);
      } else {
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: "bot",
          content:
            "Sorry, I encountered an error. Please try again later.",
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "bot",
        content:
          "Sorry, I'm having trouble connecting. Please check your internet and try again.",
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-6 right-6 z-40 p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110",
          isOpen
            ? "bg-orange-500 hover:bg-orange-600"
            : "bg-orange-500 hover:bg-orange-600"
        )}
        aria-label="Toggle chat"
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <MessageCircle className="w-6 h-6 text-white" />
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-40 w-96 max-w-[calc(100vw-24px)] animate-in fade-in slide-in-from-bottom-4 duration-300">
          <Card className="bg-white border border-orange-200 shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-orange-500 p-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Sparkles className="w-5 h-5 animate-spin" />
                    <div className="absolute inset-0 bg-white/20 rounded-full animate-pulse" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Study Assistant</h3>
                    <p className="text-xs text-white/80">Powered by AI</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="hover:bg-white/20 p-1 rounded transition-colors"
                >
                  <ChevronDown className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages Container */}
            <div className="h-96 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300",
                    message.type === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  {message.type === "bot" && (
                    <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                  )}

                  <div
                    className={cn(
                      "max-w-xs lg:max-w-md px-4 py-3 rounded-lg",
                      message.type === "user"
                        ? "bg-orange-500 text-white rounded-br-none"
                        : "bg-gray-200 text-gray-800 rounded-bl-none border border-gray-300"
                    )}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-3 justify-start animate-in fade-in">
                  <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center flex-shrink-0">
                    <Loader className="w-4 h-4 text-white animate-spin" />
                  </div>
                  <div className="bg-gray-200 text-gray-800 px-4 py-3 rounded-lg rounded-bl-none border border-gray-300">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                      <div
                        className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      />
                      <div
                        className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Suggestions */}
            {messages.length === 1 && suggestions.length > 0 && (
              <div className="px-4 py-3 border-t border-gray-200 bg-gray-100">
                <p className="text-xs text-gray-600 mb-2 font-medium">
                  Quick questions:
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {suggestions.slice(0, 3).map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="text-left text-xs px-3 py-2 rounded bg-white hover:bg-orange-50 text-gray-700 hover:text-orange-600 transition-all duration-200 border border-gray-300 hover:border-orange-300"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <div className="flex gap-2">
                <Input
                  ref={inputRef}
                  type="text"
                  placeholder="Ask me anything..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && !isLoading) {
                      handleSendMessage();
                    }
                  }}
                  disabled={isLoading}
                  className="bg-gray-100 border-gray-300 text-gray-800 placeholder:text-gray-500 focus:border-orange-500 focus:ring-orange-500/20"
                />
                <Button
                  onClick={() => handleSendMessage()}
                  disabled={isLoading || !inputValue.trim()}
                  className="bg-orange-500 hover:bg-orange-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  size="icon"
                >
                  {isLoading ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}
