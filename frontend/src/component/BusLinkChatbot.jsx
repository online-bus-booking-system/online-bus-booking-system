import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { 
  X, Send, Bot, User, ShieldCheck, 
  RefreshCw, ChevronRight, PhoneCall, Mail
} from 'lucide-react';
import './BusLinkChatbot.css';

const API_BASE_URL = 'http://localhost:8080/api/chat';

const QUICK_PROMPTS = [
  "How do I cancel my ticket?",
  "What is the luggage allowance?",
  "What if the operator cancels the bus?",
  "How long does a refund to Wallet take?",
  "How to register as a bus operator?"
];

const BusLinkChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'assistant',
      text: 'Hello! I am your BusLink **AI Assistant**. How can I help you with your bus travel, cancellations, luggage, or booking queries today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, loading, isOpen]);

  const cleanAnswerText = (text) => {
    if (!text) return '';
    let cleaned = text;
    if (cleaned.includes('Answer =>')) {
      cleaned = cleaned.split('Answer =>')[1].strip ? cleaned.split('Answer =>')[1].strip() : cleaned.split('Answer =>')[1];
    }
    return cleaned.trim();
  };

  const handleSendMessage = async (textToSend) => {
    const userQuery = textToSend || query.trim();
    if (!userQuery || loading) return;

    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text: userQuery,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setQuery('');
    setLoading(true);

    try {
      const formattedHistory = history.map(turn => ({
        userQuery: turn.userQuery,
        assistantResponse: turn.assistantResponse
      }));

      const payload = {
        query: userQuery,
        conversationHistory: formattedHistory,
        topK: 5
      };

      const response = await axios.post(API_BASE_URL, payload);
      const data = response.data;
      const cleanText = cleanAnswerText(data.answer);

      const botMessage = {
        id: Date.now() + 1,
        sender: 'assistant',
        text: cleanText,
        contextUsed: data.contextUsed,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, botMessage]);

      setHistory((prev) => {
        const updated = [...prev, { userQuery, assistantResponse: cleanText }];
        return updated.slice(-5);
      });

    } catch (error) {
      console.error('Chatbot API Error:', error);
      const errorMessage = {
        id: Date.now() + 1,
        sender: 'assistant',
        text: "I'm sorry, I couldn't find specific details for your query in our knowledge base. Please reach out to our Customer Support team below, and we'll be happy to assist you!",
        contextUsed: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: Date.now(),
        sender: 'assistant',
        text: 'Chat history reset. How else can I assist you today?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setHistory([]);
  };

  return (
    <div className="buslink-chatbot-wrapper">
      {/* Floating Action Button */}
      {!isOpen && (
        <button 
          className="chatbot-fab-btn shadow-lg"
          onClick={() => setIsOpen(true)}
          title="Ask AI Assistant"
        >
          <div className="fab-icon-pulse"></div>
          <Bot size={28} className="fab-icon" />
          <span className="fab-label">AI Assistant</span>
        </button>
      )}

      {/* Expandable Chat Window */}
      {isOpen && (
        <div className="chatbot-window card shadow-2xl animate-fade-in">
          {/* Header */}
          <div className="chatbot-header">
            <div className="flex items-center gap-3">
              <div className="bot-avatar-badge">
                <Bot size={20} className="text-amber-400" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base leading-tight">AI Assistant</h3>
                <p className="text-xs text-slate-300 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
                  BusLink Customer Support
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={handleClearChat} 
                className="header-btn" 
                title="Reset Chat History"
              >
                <RefreshCw size={16} />
              </button>
              <button 
                onClick={() => setIsOpen(false)} 
                className="header-btn" 
                title="Close Chat"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Messages Body */}
          <div className="chatbot-messages-body">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`chat-row ${msg.sender === 'user' ? 'user-row' : 'assistant-row'}`}
              >
                {msg.sender === 'assistant' && (
                  <div className="bot-msg-avatar">
                    <Bot size={16} />
                  </div>
                )}
                
                <div className={`chat-bubble ${msg.sender === 'user' ? 'user-bubble' : 'assistant-bubble'}`}>
                  <div className="bubble-text">
                    {msg.text.split('\n').map((line, idx) => (
                      <p key={idx} className="my-1">
                        {line}
                      </p>
                    ))}
                  </div>

                  {/* Support Fallback Card */}
                  {(msg.text.includes("couldn't find specific details") || msg.text.includes("does not contain enough information")) && (
                    <div className="support-fallback-card">
                      <div className="fallback-header">
                        <ShieldCheck size={16} className="text-amber-600" />
                        <span>Need Further Assistance?</span>
                      </div>
                      <p className="text-xs text-slate-600 mb-2">Our customer support team is available 24/7 to assist with your specific booking:</p>
                      <div className="flex gap-2">
                        <a href="mailto:support@buslink.in" className="fallback-btn email-btn">
                          <Mail size={12} /> Email Support
                        </a>
                        <a href="tel:18005555465" className="fallback-btn call-btn">
                          <PhoneCall size={12} /> 1800-BUS-LINK
                        </a>
                      </div>
                    </div>
                  )}

                  <span className="timestamp-label">{msg.timestamp}</span>
                </div>

                {msg.sender === 'user' && (
                  <div className="user-msg-avatar">
                    <User size={16} />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="chat-row assistant-row">
                <div className="bot-msg-avatar">
                  <Bot size={16} />
                </div>
                <div className="chat-bubble assistant-bubble loading-bubble">
                  <div className="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  <span className="text-xs text-slate-500 ml-2">Searching knowledge base...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompt Suggestions */}
          <div className="quick-prompts-bar">
            {QUICK_PROMPTS.map((promptText, idx) => (
              <button 
                key={idx} 
                className="prompt-chip"
                onClick={() => handleSendMessage(promptText)}
                disabled={loading}
              >
                <span>{promptText}</span>
                <ChevronRight size={12} />
              </button>
            ))}
          </div>

          {/* Input Form */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="chatbot-input-form"
          >
            <input 
              type="text" 
              className="chat-input-field"
              placeholder="Ask anything about BusLink policies, refunds..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={loading}
            />
            <button 
              type="submit" 
              className="chat-send-btn"
              disabled={!query.trim() || loading}
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default BusLinkChatbot;
