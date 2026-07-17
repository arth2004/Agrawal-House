'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';

interface Message {
  sender: 'bot' | 'user';
  text: string;
}

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'bot',
      text: 'Namaste! Welcome to Agrawal House Ujjain. I am your virtual assistant. How can I help you today?',
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestions = [
    'How far is Mahakal Temple?',
    'What are the room rates?',
    'Is parking available?',
    'Check-in and Check-out timings',
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = (text: string) => {
    if (!text.trim()) return;

    // Add user message
    const userMsg: Message = { sender: 'user', text };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');

    // Generate bot response
    setTimeout(() => {
      const response = getBotResponse(text);
      setMessages((prev) => [...prev, { sender: 'bot', text: response }]);
    }, 600);
  };

  const getBotResponse = (query: string): string => {
    const cleanQuery = query.toLowerCase().trim();

    if (cleanQuery.includes('mahakal') || cleanQuery.includes('temple') || cleanQuery.includes('distance') || cleanQuery.includes('far') || cleanQuery.includes('walk') || cleanQuery.includes('how close')) {
      return 'Agrawal House is extremely close to the Mahakaleshwar Jyotirlinga Temple! It is located approximately 400 to 700 meters away, which is a very convenient 5 to 10-minute walk or a 2-minute drive. Very convenient for Bhasma Aarti attendance!';
    }

    if (cleanQuery.includes('room') || cleanQuery.includes('rate') || cleanQuery.includes('price') || cleanQuery.includes('cost') || cleanQuery.includes('family') || cleanQuery.includes('double') || cleanQuery.includes('stay') || cleanQuery.includes('rent')) {
      return 'We offer two premium room types:\n\n1. Family Room (Silver Category): Max 4 guests, base price is ₹3,500/night. Features high wood-beam ceilings and spacious layout.\n2. Double Room (Silver Category): Max 2 guests, base price is ₹2,500/night. Cozy layout with a queen bed.\n\nAll rooms are air-conditioned, clean, and feature attached modern bathrooms with geysers.';
    }

    if (cleanQuery.includes('parking') || cleanQuery.includes('car') || cleanQuery.includes('bike') || cleanQuery.includes('vehicle')) {
      return 'We do not have any parking facilities available at the property. But you can park your vehicle at the nearby parking area which is a government parking area just 400 meters away.';
    }

    if (cleanQuery.includes('check-in') || cleanQuery.includes('check-out') || cleanQuery.includes('timings') || cleanQuery.includes('time') || cleanQuery.includes('checkin') || cleanQuery.includes('checkout')) {
      return 'Our standard check-in time is 10:00 PM , and check-out time is 9:00 AM. If you require early check-in or late check-out for your journey, please let us know in your booking notes or call us directly.';
    }

    if (cleanQuery.includes('contact') || cleanQuery.includes('phone') || cleanQuery.includes('email') || cleanQuery.includes('call') || cleanQuery.includes('whatsapp') || cleanQuery.includes('number')) {
      return 'You can contact the owner, Pankaj Agrawal, directly:\n\n• Phone/WhatsApp: +91 7415160134, +91 9425094180\n• Email: agrawalhouse34@gmail.com';
    }

    if (cleanQuery.includes('address') || cleanQuery.includes('where') || cleanQuery.includes('location') || cleanQuery.includes('map') || cleanQuery.includes('route')) {
      return 'Our address is:\n27, Patwa Bakhal, Patni Bazar, Ujjain, Madhya Pradesh - 456001.\n\nWe are situated in the main heritage zone, close to Ram Ghat and local markets, making sightseeing extremely easy. Only 300–400 meters from the Mahakaleshwar Temple!';
    }

    if (cleanQuery.includes('breakfast') || cleanQuery.includes('food') || cleanQuery.includes('eat') || cleanQuery.includes('meal')) {
      return 'There are several excellent vegetarian restaurants and local eateries right around Patni Bazar, just a short walk away.';
    }

    if (cleanQuery.includes('book') || cleanQuery.includes('confirm') || cleanQuery.includes('reserve') || cleanQuery.includes('pay') || cleanQuery.includes('payment')) {
      return 'You can book your rooms directly on this website! Select your dates on the Rooms page, fill in your details, and select "Pay at Property" during checkout. There is no deposit required to book.';
    }

    if (cleanQuery.includes('hello') || cleanQuery.includes('hi') || cleanQuery.includes('hey') || cleanQuery.includes('namaste')) {
      return 'Namaste! How can I assist you with your stay or booking queries for Agrawal House Ujjain today?';
    }

    if (cleanQuery.includes('thanks') || cleanQuery.includes('thank you') || cleanQuery.includes('ok') || cleanQuery.includes('bye')) {
      return 'You are welcome! Thank you for using our chatbot. If you have any other questions, feel free to ask.';
    }

    // Default fallback
    return "I want to make sure you get the best information. You can reach out directly to the host, Pankaj Agrawal, at +91 7415160134 or submit an enquiry on our Enquiry page, and we will get back to you immediately!";
  };

  return (
    <>
      {/* Chatbot Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Open Chat Assistant"
        style={{
          position: 'fixed',
          bottom: '90px', // Raised slightly above the WhatsApp float
          right: '24px',
          backgroundColor: 'var(--primary)',
          color: '#FFFFFF',
          border: 'none',
          borderRadius: '50%',
          width: '56px',
          height: '56px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 4px 16px rgba(194, 65, 12, 0.35)',
          zIndex: 998,
          transition: 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), background-color 0.2s',
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.08)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        {isOpen ? <X size={24} style={{ color: '#FFFFFF' }} /> : <MessageCircle size={24} style={{ color: '#FFFFFF' }} />}
      </button>

      {/* Chat Dialog Panel */}
      {isOpen && (
        <div
          className="glassmorphism animate-fade-in"
          style={{
            position: 'fixed',
            bottom: '160px',
            right: '24px',
            width: 'calc(100% - 48px)',
            maxWidth: '360px',
            height: '460px',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-lg)',
            border: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            zIndex: 998,
            backgroundColor: 'rgba(255, 255, 255, 0.96)',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '16px 20px',
              backgroundColor: 'var(--primary)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#FFFFFF', letterSpacing: '0.02em' }}>
                Agrawal House Assistant
              </h3>
              <span style={{ fontSize: '0.75rem', opacity: 0.9, color: '#FFFFFF' }}>Online • Instant Answers</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#FFFFFF', opacity: 0.8 }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages Body */}
          <div
            style={{
              flex: 1,
              padding: '16px 20px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              backgroundColor: 'rgba(250, 248, 245, 0.6)',
            }}
            className="scrollbar-hide"
          >
            {messages.map((msg, index) => {
              const isBot = msg.sender === 'bot';
              return (
                <div
                  key={index}
                  style={{
                    alignSelf: isBot ? 'flex-start' : 'flex-end',
                    maxWidth: '85%',
                    backgroundColor: isBot ? '#FFFFFF' : 'var(--primary)',
                    color: isBot ? 'var(--text-primary)' : '#FFFFFF',
                    padding: '12px 16px',
                    borderRadius: isBot 
                      ? '0px var(--radius-md) var(--radius-md) var(--radius-md)' 
                      : 'var(--radius-md) var(--radius-md) 0px var(--radius-md)',
                    fontSize: '0.9rem',
                    lineHeight: '1.45',
                    boxShadow: isBot ? '0 1px 3px rgba(0,0,0,0.05)' : 'none',
                    whiteSpace: 'pre-wrap',
                    border: isBot ? '1px solid var(--border-color)' : 'none',
                  }}
                >
                  {msg.text}
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions Strip */}
          {messages.length === 1 && (
            <div
              style={{
                padding: '8px 16px 12px 16px',
                display: 'flex',
                gap: '8px',
                overflowX: 'auto',
                borderTop: '1px solid var(--border-color)',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
              }}
              className="scrollbar-hide"
            >
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => handleSendMessage(s)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-full)',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'rgba(250, 248, 245, 0.95)',
                    fontSize: '0.78rem',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--primary)';
                    e.currentTarget.style.color = 'var(--primary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-color)';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Message Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputValue);
            }}
            style={{
              padding: '12px 16px',
              borderTop: '1px solid var(--border-color)',
              backgroundColor: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <input
              type="text"
              placeholder="Ask about location, parking, rates..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              style={{
                flex: 1,
                padding: '10px 14px',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--border-color)',
                outline: 'none',
                fontSize: '0.88rem',
                backgroundColor: 'var(--bg-primary)',
              }}
            />
            <button
              type="submit"
              disabled={!inputValue.trim()}
              style={{
                backgroundColor: inputValue.trim() ? 'var(--primary)' : 'var(--border-color)',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '50%',
                width: '38px',
                height: '38px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: inputValue.trim() ? 'pointer' : 'default',
                transition: 'all 0.2s',
              }}
            >
              <Send size={16} style={{ color: '#FFFFFF' }} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
