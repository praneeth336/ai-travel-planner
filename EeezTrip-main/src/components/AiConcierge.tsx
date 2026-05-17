import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  X, 
  SendHorizontal, 
  RefreshCcw,
  MessageCircle,
  Zap
} from 'lucide-react';
import { useTripStore } from '../state/tripStore';

export function AiConcierge() {
  const { state, sendChatMessage, reviseTrip } = useTripStore();
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [state.chatHistory, state.chatLoading]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || state.chatLoading) return;
    const msg = inputValue;
    setInputValue('');
    await sendChatMessage(msg);
  };

  const handleApplyRevision = () => {
    const lastMsg = [...state.chatHistory].reverse().find(m => m.role === 'assistant');
    if (lastMsg) reviseTrip(lastMsg.content);
  };

  return (
    <div className="fixed bottom-8 right-8 z-[9999]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="absolute bottom-24 right-0 w-[400px] h-[600px] bg-white rounded-[32px] shadow-2xl border border-slate-100 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-slate-900 p-6 flex justify-between items-center text-white">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-cyan-400 to-blue-600 p-2 rounded-xl"><Zap size={18} fill="white" /></div>
                <div>
                  <h3 className="font-bold text-sm">Trip Concierge</h3>
                  <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"/><span className="text-[10px] opacity-70 font-bold uppercase">Online</span></div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="opacity-50 hover:opacity-100 transition-opacity"><X size={20}/></button>
            </div>

            {/* Chat Messages */}
            <div ref={scrollRef} className="flex-1 p-6 overflow-y-auto bg-slate-50 space-y-4">
              {state.chatHistory.length === 0 && (
                <div className="text-center py-10 px-6">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm text-slate-400"><Sparkles size={24}/></div>
                  <h4 className="text-slate-900 font-bold text-sm mb-1">How can I help today?</h4>
                  <p className="text-slate-500 text-xs">Ask me to add more stops, change the budget, or find local food spots.</p>
                </div>
              )}
              {state.chatHistory.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-slate-900 text-white rounded-br-none' : 'bg-white text-slate-800 border border-slate-100 rounded-bl-none'}`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {state.chatLoading && (
                <div className="bg-white p-3 rounded-2xl border border-slate-100 w-16 flex justify-center gap-1">
                  <div className="w-1 h-1 bg-slate-300 rounded-full animate-bounce"/>
                  <div className="w-1 h-1 bg-slate-300 rounded-full animate-bounce [animation-delay:0.2s]"/>
                  <div className="w-1 h-1 bg-slate-300 rounded-full animate-bounce [animation-delay:0.4s]"/>
                </div>
              )}
            </div>

            {/* Actions & Input */}
            <div className="p-6 bg-white border-t border-slate-100">
              {state.chatHistory.some(m => m.role === 'assistant') && (
                <button 
                  onClick={handleApplyRevision}
                  disabled={state.revising}
                  className="w-full mb-4 py-3 bg-indigo-50 text-indigo-700 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-indigo-100 transition-colors disabled:opacity-50"
                >
                  {state.revising ? <RefreshCcw size={14} className="animate-spin" /> : <RefreshCcw size={14} />}
                  Apply AI Suggestions
                </button>
              )}
              <form onSubmit={handleSend} className="flex gap-2">
                <input 
                  type="text" value={inputValue} onChange={e => setInputValue(e.target.value)} 
                  placeholder="Tell me what to change..." 
                  className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-slate-400 text-sm transition-all"
                />
                <button type="submit" disabled={!inputValue.trim() || state.chatLoading} className="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all disabled:opacity-30">
                  <SendHorizontal size={20} />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-2xl"
      >
        {isOpen ? <X size={28} /> : <MessageCircle size={28} />}
      </motion.button>
    </div>
  );
}
