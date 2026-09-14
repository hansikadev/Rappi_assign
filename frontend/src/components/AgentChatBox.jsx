import React, { useState } from 'react';
import { Send, Bot, User, Sparkles, MessageSquare } from 'lucide-react';

export default function AgentChatBox({ apiFetch }) {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'agent',
      text: 'Hello! I am your AI Purchasing Copilot. Ask me any custom question about warehouse inventory, demand forecasts, supplier limits, or purchase order adjustments!',
      time: 'Just now'
    }
  ]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!prompt.trim() || loading) return;

    const userText = prompt.trim();
    setPrompt('');
    const newMsg = { sender: 'user', text: userText, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setMessages((prev) => [...prev, newMsg]);
    setLoading(true);

    try {
      const res = await apiFetch('/api/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userText, provider: 'gemini' })
      });

      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [
          ...prev,
          {
            sender: 'agent',
            text: data.reply,
            time: data.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { sender: 'agent', text: 'Sorry, I encountered an issue consulting the ERP telemetry. Please try again.', time: 'Error' }
        ]);
      }
    } catch (err) {
      console.error('Chat error:', err);
      setMessages((prev) => [
        ...prev,
        { sender: 'agent', text: 'Network connection issue to agent backend.', time: 'Error' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel p-6 space-y-4">
      <div className="flex justify-between items-center pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-rappi-orange" />
          <h3 className="text-base font-bold text-white">Interactive Buyer Agent Copilot Chat</h3>
        </div>
        <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
          <Sparkles className="h-3.5 w-3.5 text-amber-400" />
          Ask Custom Purchasing Instructions
        </span>
      </div>

      {/* Message Stream */}
      <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-3 text-xs ${
              msg.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {msg.sender === 'agent' && (
              <div className="h-7 w-7 rounded-lg bg-rappi-orange/20 border border-rappi-orange/40 flex items-center justify-center text-rappi-orange shrink-0">
                <Bot className="h-4 w-4" />
              </div>
            )}

            <div
              className={`p-3.5 rounded-xl max-w-xl space-y-1 font-sans ${
                msg.sender === 'user'
                  ? 'bg-rappi-orange text-white rounded-tr-none'
                  : 'bg-slate-950/80 border border-slate-800 text-slate-200 rounded-tl-none'
              }`}
            >
              <p className="leading-relaxed">{msg.text}</p>
              <div className={`text-[10px] text-right font-mono ${msg.sender === 'user' ? 'text-white/70' : 'text-slate-500'}`}>
                {msg.time}
              </div>
            </div>

            {msg.sender === 'user' && (
              <div className="h-7 w-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0">
                <User className="h-4 w-4" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-slate-400 p-2">
            <div className="h-3 w-3 border-2 border-rappi-orange border-t-transparent rounded-full animate-spin" />
            <span>Agent consulting ERP telemetry & synthesizing recommendation...</span>
          </div>
        )}
      </div>

      {/* Input Box */}
      <form onSubmit={handleSend} className="flex items-center gap-2 pt-2 border-t border-slate-800">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ask the AI agent... e.g. 'What if we order 600 avocados instead?' or 'Check milk supplier capacity'"
          className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rappi-orange transition font-sans"
        />
        <button
          type="submit"
          disabled={loading || !prompt.trim()}
          className="px-4 py-2.5 bg-rappi-orange hover:bg-rappi-darkOrange text-white font-semibold text-xs rounded-xl shadow-lg shadow-rappi-orange/20 transition flex items-center gap-1.5 disabled:opacity-50"
        >
          <Send className="h-3.5 w-3.5" />
          Ask Agent
        </button>
      </form>
    </div>
  );
}
