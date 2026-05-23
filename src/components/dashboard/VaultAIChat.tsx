import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Send, Bot, User, CornerDownLeft, Loader2, ArrowRight } from 'lucide-react';
import type { Transaction, WalletSummary } from '@/types';
import { formatCurrency } from '@/utils/format';

interface VaultAIChatProps {
  transactions: Transaction[];
  summary: WalletSummary | null;
  activeSection: string;
  onNavigateSection: (section: string) => void;
}

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: Date;
  suggestions?: string[];
}

export function VaultAIChat({ transactions, summary }: VaultAIChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: "Hi there! I'm **VaultAI**, your personal financial assistant. I analyze your spending habits, card limits, and recurring bills to give you smart predictions.\n\nAsk me anything or choose a quick option below!",
      timestamp: new Date(),
      suggestions: [
        'How much did I spend on food?',
        'Predict my end-of-month balance',
        'Show largest expenses',
        'Can I save more this month?',
      ],
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}-user`,
      sender: 'user',
      text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate AI computing response with real transaction data
    setTimeout(() => {
      const responseText = generateAIResponse(text.toLowerCase());
      const aiMessage: Message = {
        id: `msg-${Date.now()}-ai`,
        sender: 'ai',
        text: responseText,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1200);
  };

  const generateAIResponse = (query: string): string => {
    // 1. How much spent on food
    if (query.includes('food') || query.includes('eat') || query.includes('coffee') || query.includes('restaurant')) {
      const foodTxs = transactions.filter(
        (t) =>
          t.type === 'debit' &&
          t.status === 'completed' &&
          (t.category === 'Food & Groceries' || t.category === 'Food & Drinks' || t.category === 'Dining Out')
      );
      const totalFood = foodTxs.reduce((sum, t) => sum + t.amount, 0);

      if (foodTxs.length === 0) {
        return "I couldn't find any completed food transactions in your history yet! Try adding a dining out or grocery transaction.";
      }

      const breakdown = foodTxs
        .slice(0, 4)
        .map((t) => `- **${formatCurrency(t.amount)}** at *${t.description}*`)
        .join('\n');

      return `You spent a total of **${formatCurrency(
        totalFood
      )}** on groceries, dining out, and coffee recently. \n\nHere are some of your recent transactions:\n${breakdown}\n\n💡 *VaultAI Tip: Reducing coffee and restaurant dining by 12% would save you about $24/month.*`;
    }

    // 2. Predict month end balance
    if (query.includes('predict') || query.includes('forecast') || query.includes('month-end') || query.includes('balance')) {
      const currentBalance = summary?.balance ?? 0;
      const predictedEnd = currentBalance - 280; // simulate a month-end trend

      return `Based on your average spending velocity ($110.00/day) and recurring subscription schedules:\n\n- Current Balance: **${formatCurrency(
        currentBalance
      )}**\n- Predicted End-of-Month: **${formatCurrency(
        predictedEnd
      )}**\n\n⚠️ *At your current spending rate, you may exceed your dining out budget in **6 days**. Try moving $300 to VaultSavings to secure 5.2% APY.*`;
    }

    // 3. Show largest expenses
    if (query.includes('large') || query.includes('expensive') || query.includes('biggest') || query.includes('highest')) {
      const debits = transactions.filter((t) => t.type === 'debit').sort((a, b) => b.amount - a.amount);

      if (debits.length === 0) {
        return "I couldn't find any debit transactions to analyze!";
      }

      const topExpenses = debits
        .slice(0, 3)
        .map((t, idx) => `${idx + 1}. **${t.description}**: **${formatCurrency(t.amount)}** (${t.category || 'Other'})`)
        .join('\n');

      return `Your top 3 largest transactions are:\n\n${topExpenses}\n\n⚠️ Note: The transaction of **$340.00** at Stripe Merchant was declined/failed. If this was not authorized by you, please freeze your card in the **Wallet** tab immediately.`;
    }

    // 4. Can I save more
    if (query.includes('save') || query.includes('savings') || query.includes('yield') || query.includes('budget')) {
      return `Yes! Here are three tailored recommendations to boost your savings this month:\n\n- **Cancel unused subscriptions**: Cancel OpenAI ChatGPT or Spotify premium if not in regular use (potential savings: **$32/month**).\n- **High Yield Savings**: Move **$300** to VaultSavings to unlock **5.2% APY**.\n- **Limit Dining**: Set a spend limit on your card (you can adjust this in the Wallet tab to cap monthly bills).`;
    }

    // Keyword lookups for mock transactions
    const foundTx = transactions.find(t => query.includes(t.description.toLowerCase()));
    if (foundTx) {
      return `I found a matching transaction! On **${new Date(foundTx.created_at).toLocaleDateString()}**, you had a **${foundTx.type}** of **${formatCurrency(foundTx.amount)}** for **${foundTx.description}** (Status: *${foundTx.status}*).`;
    }

    // Fallback
    return "I'm not sure how to answer that custom query yet! \n\nI can analyze your spending if you ask things like:\n- *'How much did I spend on food?'*\n- *'What are my largest expenses?'*\n- *'Predict my balance'*\n- *'Give me savings recommendations'*";
  };

  const renderText = (text: string) => {
    // Basic Markdown formatting helper
    return text.split('\n').map((line, i) => {
      let content = line;
      // Bold **text**
      content = content.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-bold">$1</strong>');
      // Italic *text*
      content = content.replace(/\*(.*?)\*/g, '<em class="text-slate-300 italic">$1</em>');
      
      return (
        <p
          key={i}
          className="text-xs sm:text-sm text-slate-300 leading-relaxed min-h-[1.25rem]"
          dangerouslySetInnerHTML={{ __html: content || '&nbsp;' }}
        />
      );
    });
  };

  return (
    <>
      {/* Bottom Right Floating AI Toggle Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-650 text-white font-bold px-4 py-3 rounded-full flex items-center gap-2 shadow-lg shadow-purple-900/30 border border-purple-500/20"
        >
          <Sparkles className="h-4 w-4 animate-pulse text-yellow-300" />
          <span className="text-xs tracking-wider">Ask VaultAI</span>
        </motion.button>
      </div>

      {/* Slide-in Chat Drawer Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Dark Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black z-40"
            />

            {/* Chat Container */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3, ease: 'easeOut' }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-slate-950 border-l border-slate-900 shadow-2xl flex flex-col z-50"
            >
              {/* Drawer Header */}
              <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center justify-center text-white">
                    <Bot className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                      VaultAI Assistant
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                    </h3>
                    <p className="text-[10px] text-slate-400">Financial Intelligence Hub</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Chat Message area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-3 max-w-[85%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
                  >
                    {/* Avatar */}
                    <div
                      className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-xs font-bold ${
                        msg.sender === 'ai'
                          ? 'bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-purple-500/30 text-purple-400'
                          : 'bg-blue-600 text-white'
                      }`}
                    >
                      {msg.sender === 'ai' ? <Bot className="h-3.5 w-3.5" /> : <User className="h-3.5 w-3.5" />}
                    </div>

                    {/* Bubble Content */}
                    <div className="space-y-3">
                      <div
                        className={`rounded-2xl p-3.5 border ${
                          msg.sender === 'ai'
                            ? 'bg-slate-900 border-slate-800/80 rounded-tl-none shadow-lg'
                            : 'bg-[#7C3AED] border-[#7C3AED] text-white rounded-tr-none shadow-md shadow-purple-950/20'
                        }`}
                      >
                        {msg.sender === 'ai' ? (
                          <div className="space-y-1.5">{renderText(msg.text)}</div>
                        ) : (
                          <p className="text-xs sm:text-sm leading-normal">{msg.text}</p>
                        )}
                      </div>

                      {/* Suggestions Chips (AI welcome only) */}
                      {msg.suggestions && (
                        <div className="flex flex-wrap gap-2 pt-1.5">
                          {msg.suggestions.map((s) => (
                            <button
                              key={s}
                              onClick={() => handleSend(s)}
                              className="text-[11px] font-semibold text-purple-300 bg-purple-500/10 hover:bg-purple-500 hover:text-white border border-purple-500/20 px-2.5 py-1 rounded-full transition-all duration-250 flex items-center gap-1 group"
                            >
                              {s}
                              <ArrowRight className="h-3 w-3 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Simulated typing indicator */}
                {isTyping && (
                  <div className="flex gap-3 max-w-[80%]">
                    <div className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-purple-500/30 text-purple-400">
                      <Bot className="h-3.5 w-3.5" />
                    </div>
                    <div className="bg-slate-900 border border-slate-800/80 rounded-2xl rounded-tl-none p-3.5 flex items-center gap-2">
                      <Loader2 className="h-3.5 w-3.5 text-purple-400 animate-spin" />
                      <span className="text-xs text-slate-400 font-medium">VaultAI is analyzing data...</span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input drawer foot */}
              <div className="p-4 bg-slate-900 border-t border-slate-800">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSend(input);
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about food spend, savings yield, etc..."
                    className="flex-1 bg-slate-950 border border-slate-800 p-2.5 text-xs sm:text-sm rounded-xl text-slate-200 placeholder:text-slate-500 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all font-medium"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || isTyping}
                    className="p-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-40 disabled:hover:bg-purple-600 text-white transition-all flex items-center justify-center"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </form>
                <div className="flex items-center gap-1 mt-2 text-[10px] text-slate-500">
                  <CornerDownLeft className="h-3 w-3" />
                  <span>Press Enter to submit query</span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
