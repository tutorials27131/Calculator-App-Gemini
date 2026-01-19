
import React, { useState, useCallback, useEffect, useRef } from 'react';
import CalculatorButton from './components/CalculatorButton';
import { HistoryItem, Operation } from './types';
import { solveWithAi } from './services/geminiService';

const App: React.FC = () => {
  const [display, setDisplay] = useState('0');
  const [expression, setExpression] = useState('');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [aiInput, setAiInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [lastOperation, setLastOperation] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [pendingValue, setPendingValue] = useState<number | null>(null);

  const historyEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    historyEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [history]);

  const handleNumber = (num: string) => {
    if (waitingForOperand) {
      setDisplay(num);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? num : display + num);
    }
  };

  const handleOperator = (op: Operation) => {
    const inputValue = parseFloat(display);

    if (op === 'clear') {
      setDisplay('0');
      setExpression('');
      setPendingValue(null);
      setLastOperation(null);
      setWaitingForOperand(false);
      return;
    }

    if (op === 'percentage') {
      const result = (inputValue / 100).toString();
      setDisplay(result);
      return;
    }

    if (op === 'plusMinus') {
      setDisplay((inputValue * -1).toString());
      return;
    }

    if (pendingValue === null) {
      setPendingValue(inputValue);
    } else if (lastOperation) {
      const result = performCalculation(pendingValue, inputValue, lastOperation);
      setDisplay(String(result));
      setPendingValue(result);
    }

    setWaitingForOperand(true);
    setLastOperation(op);
    
    if (op !== '=') {
      setExpression(`${display} ${op}`);
    } else {
      if (pendingValue !== null && lastOperation) {
        const finalResult = performCalculation(pendingValue, inputValue, lastOperation);
        const newHistoryItem: HistoryItem = {
          id: Date.now().toString(),
          expression: `${pendingValue} ${lastOperation} ${inputValue}`,
          result: String(finalResult),
          timestamp: Date.now()
        };
        setHistory(prev => [...prev, newHistoryItem]);
        setExpression('');
        setPendingValue(null);
        setLastOperation(null);
      }
    }
  };

  const performCalculation = (a: number, b: number, op: string): number => {
    switch (op) {
      case '+': return a + b;
      case '-': return a - b;
      case '*': return a * b;
      case '/': return a / b;
      default: return b;
    }
  };

  const handleAiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiInput.trim()) return;

    setIsAiLoading(true);
    try {
      const { result, explanation } = await solveWithAi(aiInput);
      setDisplay(result);
      const newHistoryItem: HistoryItem = {
        id: Date.now().toString(),
        expression: aiInput,
        result: result,
        timestamp: Date.now(),
        isAiGenerated: true
      };
      setHistory(prev => [...prev, newHistoryItem]);
      setAiInput('');
    } catch (error) {
      alert("AI Calculation failed. Please try again.");
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-8 bg-slate-950">
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Calculator & AI Input */}
        <div className="lg:col-span-7 space-y-6">
          <header className="mb-4">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
              Gemini Smart Calc
            </h1>
            <p className="text-slate-400 text-sm">Advanced arithmetic + Natural Language AI reasoning.</p>
          </header>

          <div className="glass rounded-[2rem] p-6 shadow-2xl overflow-hidden relative">
            {/* Display Area */}
            <div className="text-right mb-6 h-32 flex flex-col justify-end">
              <div className="text-slate-500 text-lg font-medium h-8 overflow-hidden">
                {expression}
              </div>
              <div className="text-white text-6xl font-semibold tracking-tight overflow-x-auto whitespace-nowrap scrollbar-hide">
                {display}
              </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-4 gap-3">
              <CalculatorButton label="AC" onClick={() => handleOperator('clear')} variant="action" />
              <CalculatorButton label="+/-" onClick={() => handleOperator('plusMinus')} variant="action" />
              <CalculatorButton label="%" onClick={() => handleOperator('percentage')} variant="action" />
              <CalculatorButton label="÷" onClick={() => handleOperator('/')} variant="operator" />

              <CalculatorButton label="7" onClick={() => handleNumber('7')} />
              <CalculatorButton label="8" onClick={() => handleNumber('8')} />
              <CalculatorButton label="9" onClick={() => handleNumber('9')} />
              <CalculatorButton label="×" onClick={() => handleOperator('*')} variant="operator" />

              <CalculatorButton label="4" onClick={() => handleNumber('4')} />
              <CalculatorButton label="5" onClick={() => handleNumber('5')} />
              <CalculatorButton label="6" onClick={() => handleNumber('6')} />
              <CalculatorButton label="-" onClick={() => handleOperator('-')} variant="operator" />

              <CalculatorButton label="1" onClick={() => handleNumber('1')} />
              <CalculatorButton label="2" onClick={() => handleNumber('2')} />
              <CalculatorButton label="3" onClick={() => handleNumber('3')} />
              <CalculatorButton label="+" onClick={() => handleOperator('+')} variant="operator" />

              <CalculatorButton label="0" onClick={() => handleNumber('0')} className="col-span-2" />
              <CalculatorButton label="." onClick={() => handleNumber('.')} />
              <CalculatorButton label="=" onClick={() => handleOperator('=')} variant="special" />
            </div>
          </div>

          {/* AI Prompt Input */}
          <div className="glass rounded-2xl p-4 shadow-lg border-blue-500/20 border">
            <form onSubmit={handleAiSubmit} className="flex gap-2">
              <input 
                type="text" 
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                placeholder="Ask a word problem (e.g., '15% tip on $85.50')..."
                className="flex-1 bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                disabled={isAiLoading}
              />
              <button 
                type="submit"
                disabled={isAiLoading || !aiInput.trim()}
                className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl px-6 py-3 font-semibold transition-colors flex items-center justify-center min-w-[100px]"
              >
                {isAiLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  "Solve AI"
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right: History Panel */}
        <div className="lg:col-span-5 h-[400px] lg:h-[700px] flex flex-col">
          <div className="glass rounded-[2rem] p-6 shadow-xl flex-1 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                History
              </h2>
              <button 
                onClick={() => setHistory([])}
                className="text-xs text-slate-500 hover:text-red-400 transition-colors"
              >
                Clear All
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
              {history.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-2 opacity-50">
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <p>No calculations yet</p>
                </div>
              ) : (
                history.map((item) => (
                  <div 
                    key={item.id} 
                    className={`p-4 rounded-xl border ${item.isAiGenerated ? 'bg-blue-900/10 border-blue-500/20' : 'bg-slate-800/30 border-slate-700/50'} group hover:border-slate-500 transition-all`}
                    onClick={() => setDisplay(item.result)}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-xs text-slate-500 font-mono">
                        {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {item.isAiGenerated && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500 text-white font-bold uppercase tracking-wider">
                          AI
                        </span>
                      )}
                    </div>
                    <div className="text-slate-400 text-sm mb-1 truncate">{item.expression}</div>
                    <div className="text-white text-2xl font-semibold">= {item.result}</div>
                  </div>
                ))
              )}
              <div ref={historyEndRef} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
