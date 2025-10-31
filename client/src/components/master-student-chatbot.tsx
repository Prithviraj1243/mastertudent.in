import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, X, Bot, User, Lightbulb, Minimize2, Maximize2, GraduationCap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface ChatbotProps {
  className?: string;
}

const MasterStudentChatbot: React.FC<ChatbotProps> = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm MasterStudent AI, your intelligent study companion. I can help you with study tips, subject explanations, exam preparation, and academic guidance. How can I assist you today? 🎓",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Fetch suggestions when component mounts
    fetchSuggestions();
  }, []);

  const fetchSuggestions = async () => {
    try {
      const response = await fetch('http://localhost:5001/chat/suggestions');
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.suggestions || []);
      }
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
    }
  };

  const sendMessage = async (messageText?: string) => {
    const text = messageText || inputMessage.trim();
    if (!text) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5001/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: text,
          history: messages.slice(-10).map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'assistant',
            content: msg.text
          }))
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: data.response,
          sender: 'bot',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMessage]);
      } else {
        throw new Error('Failed to get response');
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, I'm having trouble connecting right now. Please try again later!",
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!isOpen) {
    return (
      <div className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 ${className}`}>
        <motion.button
          onClick={() => setIsOpen(true)}
          className="group relative bg-gradient-to-br from-orange-500 via-red-500 to-orange-600 hover:from-orange-400 hover:via-red-400 hover:to-orange-500 text-white p-3 sm:p-4 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
        >
          {/* MasterStudent Logo */}
          <div className="relative w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center">
            <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-white drop-shadow-lg" />
          </div>
          
          {/* Notification Badge */}
          <motion.div 
            className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center shadow-lg"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <MessageCircle className="w-2 h-2 sm:w-2.5 sm:h-2.5" />
          </motion.div>
          
          {/* Tooltip */}
          <div className="absolute bottom-full right-full mr-3 mb-1 px-3 py-2 bg-slate-800 text-white text-xs sm:text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap shadow-xl">
            <span className="bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 bg-clip-text text-transparent font-bold">MasterStudent</span> AI Assistant
            <div className="absolute top-1/2 left-full transform -translate-y-1/2 border-4 border-transparent border-l-slate-800"></div>
          </div>
        </motion.button>
      </div>
    );
  }

  return (
    <div className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 ${className}`}>
      <AnimatePresence>
        <motion.div 
          className={`bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200/50 transition-all duration-300 ${
            isMinimized 
              ? 'w-72 sm:w-80 h-16' 
              : 'w-80 sm:w-96 h-80 sm:h-96 md:h-[28rem]'
          }`}
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-3 sm:p-4 bg-gradient-to-br from-orange-500 via-red-500 to-orange-600 text-white rounded-t-2xl">
            <div className="flex items-center space-x-3">
              {/* MasterStudent Logo */}
              <div className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center bg-white/20 shadow-lg">
                <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-white drop-shadow-lg" />
              </div>
              <div>
                <h3 className="font-bold text-sm sm:text-base bg-gradient-to-r from-white to-orange-100 bg-clip-text text-transparent">
                  MasterStudent
                </h3>
                <p className="text-xs sm:text-sm text-orange-100 font-medium">
                  ⚡ AI Study Assistant
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2">
              <motion.button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 sm:p-2 hover:bg-white/20 rounded-lg transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {isMinimized ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
              </motion.button>
              <motion.button
                onClick={() => setIsOpen(false)}
                className="p-1.5 sm:p-2 hover:bg-white/20 rounded-lg transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X size={14} />
              </motion.button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages */}
              <div className="h-48 sm:h-56 md:h-64 overflow-y-auto p-3 sm:p-4 space-y-3 bg-gradient-to-b from-slate-50/50 to-white/50">
                {messages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className={`flex items-start space-x-2 max-w-[85%] sm:max-w-[80%] ${
                      message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                    }`}>
                      <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-xs shadow-md ${
                        message.sender === 'user' 
                          ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white' 
                          : 'bg-gradient-to-br from-orange-500 via-red-500 to-orange-600 text-white'
                      }`}>
                        {message.sender === 'user' ? (
                          <User size={12} />
                        ) : (
                          <GraduationCap size={12} />
                        )}
                      </div>
                      <div className={`px-3 sm:px-4 py-2 sm:py-3 rounded-xl text-xs sm:text-sm shadow-lg ${
                        message.sender === 'user'
                          ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-sm'
                          : 'bg-white text-slate-800 rounded-bl-sm border border-slate-200'
                      }`}>
                        <p className="font-medium leading-relaxed">{message.text}</p>
                        <p className={`text-xs mt-1.5 font-medium ${
                          message.sender === 'user' ? 'text-blue-100' : 'text-slate-500'
                        }`}>
                          {formatTime(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
                
                {isLoading && (
                  <motion.div 
                    className="flex justify-start"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 sm:w-7 sm:h-7 bg-gradient-to-br from-orange-500 via-red-500 to-orange-600 text-white rounded-full flex items-center justify-center shadow-md">
                        <GraduationCap size={12} />
                      </div>
                      <div className="bg-white border border-slate-200 px-3 py-2 rounded-xl rounded-bl-sm shadow-lg">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Suggestions */}
              {messages.length === 1 && suggestions.length > 0 && (
                <div className="px-3 sm:px-4 pb-2">
                  <div className="flex items-center space-x-1 mb-2">
                    <Lightbulb size={14} className="text-orange-500" />
                    <span className="text-xs sm:text-sm text-slate-600 font-medium">Quick questions:</span>
                  </div>
                  <div className="space-y-1.5">
                    {suggestions.slice(0, 3).map((suggestion, index) => (
                      <motion.button
                        key={index}
                        onClick={() => sendMessage(suggestion)}
                        className="block w-full text-left text-xs sm:text-sm bg-gradient-to-r from-orange-50 to-red-50 hover:from-orange-100 hover:to-red-100 px-3 py-2 rounded-lg transition-all duration-200 text-orange-800 font-medium border border-orange-200 hover:border-orange-300 shadow-sm hover:shadow-md"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {suggestion}
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input */}
              <div className="p-3 sm:p-4 border-t border-slate-200 bg-white/80 backdrop-blur-sm">
                <div className="flex items-center space-x-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask MasterStudent anything..."
                    className="flex-1 px-3 sm:px-4 py-2 sm:py-3 border-2 border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm sm:text-base font-medium text-slate-900 bg-white shadow-sm transition-all duration-200"
                    disabled={isLoading}
                  />
                  <motion.button
                    onClick={() => sendMessage()}
                    disabled={!inputMessage.trim() || isLoading}
                    className="p-2 sm:p-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:from-slate-400 disabled:to-slate-500 disabled:cursor-not-allowed text-white rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Send size={16} className="sm:w-5 sm:h-5" />
                  </motion.button>
                </div>
              </div>
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default MasterStudentChatbot;
