// NutriVision — AI Nutritionist Chatbot Page
import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Send, Bot, User, Sparkles, Trash2, ArrowRight,
  ShieldCheck, Lightbulb, MessageCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAppStore } from '../store/useAppStore';
import { sendChatMessage, createMessage, INITIAL_GREETING } from '../services/chatService';
import { QUICK_CHAT_SUGGESTIONS } from '../data/demoData';
import type { ChatMessage } from '../types';
import './ChatbotPage.css';

export function ChatbotPage() {
  const { chatMessages, addChatMessage, clearChat, userName } = useAppStore();
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize with greeting if empty
  useEffect(() => {
    if (chatMessages.length === 0) {
      addChatMessage(createMessage('assistant', INITIAL_GREETING));
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isTyping]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputValue.trim();
    if (!query || isTyping) return;

    const userMsg = createMessage('user', query);
    addChatMessage(userMsg);
    setInputValue('');
    setIsTyping(true);

    try {
      const responseText = await sendChatMessage(query);
      const botMsg = createMessage('assistant', responseText);
      addChatMessage(botMsg);
    } catch {
      toast.error('Unable to reach AI assistant. Please try again.');
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="chat-page">
      {/* Header */}
      <div className="chat-header">
        <div className="container">
          <div className="chat-header-row">
            <div className="chat-title-group">
              <div className="bot-avatar-main">
                <Bot size={24} />
                <span className="online-indicator"></span>
              </div>
              <div>
                <span className="badge badge-accent">
                  <Sparkles size={12} /> Clinical AI Nutritionist
                </span>
                <h1 className="chat-title">Ask NutriBot AI</h1>
                <p className="chat-subtitle">Evidence-based dietary advice, food queries, and personalized nutritional guidance.</p>
              </div>
            </div>

            <button
              className="btn btn-secondary btn-sm"
              onClick={() => { clearChat(); addChatMessage(createMessage('assistant', INITIAL_GREETING)); }}
              title="Clear conversation"
            >
              <Trash2 size={14} /> Clear History
            </button>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="chat-container-card">
          {/* Quick Prompt Chips */}
          <div className="quick-chips-wrapper">
            <span className="chips-label">
              <Lightbulb size={14} /> Suggested Questions:
            </span>
            <div className="chips-scroll">
              {QUICK_CHAT_SUGGESTIONS.map((chip, i) => (
                <button
                  key={i}
                  className="quick-chip-btn"
                  onClick={() => handleSendMessage(chip)}
                  disabled={isTyping}
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>

          {/* Messages Stream */}
          <div className="messages-stream">
            {chatMessages.map((msg) => (
              <motion.div
                key={msg.id}
                className={`message-row ${msg.role}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
              >
                <div className="message-avatar">
                  {msg.role === 'assistant' ? <Bot size={18} /> : <User size={18} />}
                </div>
                <div className="message-bubble">
                  <div className="message-sender-name">
                    {msg.role === 'assistant' ? 'NutriBot' : (userName || 'You')}
                  </div>
                  <div className="message-text">{msg.content}</div>
                  <span className="message-time">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </motion.div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="message-row assistant">
                <div className="message-avatar">
                  <Bot size={18} />
                </div>
                <div className="message-bubble typing-bubble">
                  <div className="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  <span className="typing-label">Analyzing nutritional knowledge base...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Box */}
          <div className="chat-input-bar">
            <input
              type="text"
              placeholder="Ask about foods, calories, meal suggestions, or nutrient sources..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isTyping}
              className="chat-input-field"
            />
            <button
              className="btn btn-primary chat-send-btn"
              onClick={() => handleSendMessage()}
              disabled={!inputValue.trim() || isTyping}
              id="send-chat-btn"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
