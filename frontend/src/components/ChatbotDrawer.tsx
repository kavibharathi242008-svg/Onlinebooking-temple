import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../utils/api';
import { MessageSquare, X, Send, Bot, User, Sparkles, HelpCircle } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  text_tamil?: string;
  suggestedActions?: string[];
  timestamp: string;
}

interface ChatbotDrawerProps {
  templeId?: string;
  currentTempleId?: string;
  isOpen?: boolean;
  onToggle?: () => void;
}

export const ChatbotDrawer: React.FC<ChatbotDrawerProps> = ({ templeId, currentTempleId, isOpen: controlledIsOpen, onToggle }) => {
  const activeTempleId = currentTempleId || templeId;
  const { t, language } = useLanguage();
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
  const toggleOpen = onToggle || (() => setInternalIsOpen(!internalIsOpen));
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: 'Vanakkam! 🙏 I am your Temple Dharisanam & Crowd Assistant. How can I help you today?',
      text_tamil: 'வணக்கம்! 🙏 நான் உங்கள் தரிசன மற்றும் கூட்ட மேலாண்மை உதவியாளர். உங்களுக்கு எவ்வாறு உதவ முடியும்?',
      suggestedActions: [
        'How can I book dharisanam?',
        'What is Paid Dharisanam?',
        'Can I book offline?',
        'Which slot has less crowd?'
      ],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setIsTyping(true);

    try {
      const response = await api.sendChatMessage(text, templeId);
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: response.reply,
        text_tamil: response.reply_tamil,
        suggestedActions: response.suggestedActions,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: 'Unable to process query right now. Please reach our 24/7 Helpline at 1800-425-4555.',
        text_tamil: 'தற்போது தகவலைப் பெற முடியவில்லை. 1800-425-4555 என்ற எண்ணைத் தொடர்பு கொள்ளவும்.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Floating Launcher Button */}
      <button
        onClick={toggleOpen}
        className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white p-3.5 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center gap-2 group border-2 border-amber-300"
        title="AI Temple Assistant"
      >
        <MessageSquare className="w-6 h-6 group-hover:scale-110 transition-transform" />
        <span className="hidden sm:inline text-xs font-bold pr-1">
          {language === 'ta' ? 'உதவி பாட்' : 'Ask Dharisanam AI'}
        </span>
      </button>

      {/* Slide-in Chat Drawer */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 sm:right-6 z-50 w-[94vw] sm:w-[400px] h-[520px] max-h-[80vh] bg-white rounded-2xl shadow-2xl border border-amber-300 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-700 to-amber-800 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Bot className="w-5 h-5 text-amber-200" />
              </div>
              <div>
                <h3 className="font-bold text-sm">
                  {language === 'ta' ? 'தரிசன AI உதவி பாட்' : 'Dharisanam AI Assistant'}
                </h3>
                <p className="text-[11px] text-amber-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>Online • Tamil & English</span>
                </p>
              </div>
            </div>
            <button
              onClick={toggleOpen}
              className="p-1 rounded-lg hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
            {messages.map(msg => {
              const isBot = msg.sender === 'bot';
              return (
                <div
                  key={msg.id}
                  className={`flex gap-2.5 ${isBot ? 'justify-start' : 'justify-end'}`}
                >
                  {isBot && (
                    <div className="w-7 h-7 rounded-full bg-amber-600 text-white flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                      AI
                    </div>
                  )}

                  <div className={`max-w-[82%] space-y-1.5`}>
                    <div
                      className={`p-3 rounded-2xl text-xs leading-relaxed ${
                        isBot
                          ? 'bg-white text-slate-800 border border-slate-200 shadow-sm rounded-tl-sm'
                          : 'bg-amber-600 text-white font-medium rounded-tr-sm'
                      }`}
                    >
                      <p>
                        {isBot && language === 'ta' && msg.text_tamil
                          ? msg.text_tamil
                          : msg.text}
                      </p>
                      {isBot && language === 'ta' && msg.text_tamil && (
                        <p className="text-[10px] text-slate-500 mt-1 pt-1 border-t border-slate-100 font-sans">
                          {msg.text}
                        </p>
                      )}
                    </div>

                    {/* Quick reply pills */}
                    {isBot && msg.suggestedActions && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {msg.suggestedActions.map((action, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSend(action)}
                            className="bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-semibold px-2.5 py-1 rounded-full transition-colors"
                          >
                            {action}
                          </button>
                        ))}
                      </div>
                    )}

                    <span className="text-[9px] text-slate-400 block px-1">
                      {msg.timestamp}
                    </span>
                  </div>

                  {!isBot && (
                    <div className="w-7 h-7 rounded-full bg-slate-700 text-white flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );
            })}

            {isTyping && (
              <div className="flex gap-2 items-center text-xs text-slate-400 pl-9">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce" />
                  <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
                <span>Checking temple database...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick FAQ shortcut pills */}
          <div className="px-3 py-1.5 bg-white border-t border-slate-200 flex items-center gap-1 overflow-x-auto text-[10px]">
            <span className="text-slate-400 font-semibold uppercase shrink-0">Quick:</span>
            <button
              onClick={() => handleSend('What is Free Dharisanam?')}
              className="shrink-0 bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full"
            >
              Free Dharisanam
            </button>
            <button
              onClick={() => handleSend('What is Paid Dharisanam?')}
              className="shrink-0 bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full"
            >
              Paid Dharisanam
            </button>
            <button
              onClick={() => handleSend('Where is the temple?')}
              className="shrink-0 bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full"
            >
              Location
            </button>
          </div>

          {/* Input form */}
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder={t.chatPlaceholder}
              className="flex-1 text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500 bg-slate-50"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="bg-amber-600 hover:bg-amber-700 text-white p-2.5 rounded-xl transition-colors disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
