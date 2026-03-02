import React, { useState, useEffect } from 'react';
import { useTranslation } from '../i18n';
import { useVault } from '../context/VaultContext';

export const Generator: React.FC = () => {
  const { language } = useVault();
  const t = useTranslation(language);

  const [password, setPassword] = useState('');
  const [length, setLength] = useState(16);
  const [options, setOptions] = useState({
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
  });
  const [history, setHistory] = useState<string[]>([]);

  const generatePassword = () => {
    const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lower = "abcdefghijklmnopqrstuvwxyz";
    const nums = "0123456789";
    const syms = "!@#$%^&*()_+~`|}{[]:;?><,./-=";

    let chars = "";
    if (options.uppercase) chars += upper;
    if (options.lowercase) chars += lower;
    if (options.numbers) chars += nums;
    if (options.symbols) chars += syms;

    if (chars === "") return;

    let pass = "";
    for (let i = 0; i < length; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    setPassword(pass);
    addToHistory(pass);
  };

  const addToHistory = (pass: string) => {
    setHistory(prev => {
      const newHistory = [pass, ...prev];
      return newHistory.slice(0, 10); // Keep last 10
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  useEffect(() => {
    generatePassword();
  }, [length, options]);

  const calculateStrength = (pass: string) => {
    let score = 0;
    if (pass.length > 8) score += 1;
    if (pass.length > 12) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    return score;
  };

  const strength = calculateStrength(password);
  const strengthColor = strength < 3 ? 'bg-red-500' : strength < 4 ? 'bg-yellow-500' : 'bg-green-500';
  const strengthText = strength < 3 ? 'Weak' : strength < 4 ? 'Medium' : 'Strong';

  return (
    <main className="flex-1 overflow-y-auto rounded-2xl bg-white/50 border border-white/60 shadow-sm p-4 sm:p-5 scroll-smooth pb-24 lg:pb-6">
      <div className="max-w-4xl mx-auto flex flex-col gap-4">
        {/* Header */}
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Password Generator</h1>
          <p className="text-gray-500 text-xs mt-0.5 font-medium">Create strong, secure passwords instantly</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Main Generator Card */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {/* Display Area */}
            <div className="bg-white rounded-xl p-6 shadow-sm ring-1 ring-gray-100 flex flex-col items-center justify-center gap-3 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gray-100">
                <div className={`h-full transition-all duration-500 ${strengthColor}`} style={{ width: `${(strength / 5) * 100}%` }}></div>
              </div>

              <div className="text-center w-full py-2">
                <div className="text-2xl sm:text-3xl font-mono font-bold text-gray-900 break-all tracking-wider mb-1.5">
                  {password}
                </div>
                <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${strength < 3 ? 'bg-red-50 text-red-600' : strength < 4 ? 'bg-yellow-50 text-yellow-600' : 'bg-green-50 text-green-600'}`}>
                  <div className={`size-1.5 rounded-full ${strengthColor}`}></div>
                  {strengthText}
                </div>
              </div>

              <div className="flex items-center gap-2 mt-1">
                <button
                  onClick={() => copyToClipboard(password)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gray-900 text-white font-bold text-xs hover:bg-gray-800 transition-all shadow-lg shadow-gray-900/20 active:scale-95"
                >
                  <span className="material-symbols-outlined text-[16px]">content_copy</span>
                  Copy
                </button>
                <button
                  onClick={generatePassword}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white border border-gray-200 text-gray-700 font-bold text-xs hover:bg-gray-50 hover:text-primary hover:border-primary/30 transition-all active:scale-95"
                >
                  <span className="material-symbols-outlined text-[16px]">autorenew</span>
                  Regenerate
                </button>
              </div>
            </div>

            {/* Controls */}
            <div className="bg-white rounded-xl p-5 shadow-sm ring-1 ring-gray-100">
              <div className="space-y-5">
                {/* Length Slider */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Password Length</label>
                    <span className="text-sm font-bold text-primary font-mono bg-red-50 px-2.5 py-0.5 rounded-md border border-red-100">{length}</span>
                  </div>
                  <input
                    type="range"
                    min="8"
                    max="64"
                    value={length}
                    onChange={(e) => setLength(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <div className="flex justify-between text-[10px] text-gray-400 font-bold mt-1.5">
                    <span>8</span>
                    <span>32</span>
                    <span>64</span>
                  </div>
                </div>

                <div className="h-px bg-gray-100"></div>

                {/* Toggles */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { key: 'uppercase', label: 'Uppercase (A-Z)', icon: 'format_size' },
                    { key: 'lowercase', label: 'Lowercase (a-z)', icon: 'text_fields' },
                    { key: 'numbers', label: 'Numbers (0-9)', icon: '123' },
                    { key: 'symbols', label: 'Symbols (!@#)', icon: 'g_translate' },
                  ].map((opt) => (
                    <label key={opt.key} className="flex items-center justify-between p-2.5 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50 hover:border-primary/30 transition-all group">
                      <div className="flex items-center gap-2.5">
                        <div className="size-7 rounded-md bg-gray-100 flex items-center justify-center text-gray-500 group-hover:text-primary transition-colors">
                          <span className="material-symbols-outlined text-[16px]">{opt.icon}</span>
                        </div>
                        <span className="text-xs font-bold text-gray-700">{opt.label}</span>
                      </div>
                      <div className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={options[opt.key as keyof typeof options]}
                          onChange={(e) => setOptions({ ...options, [opt.key]: e.target.checked })}
                          className="sr-only peer"
                          disabled={Object.values(options).filter(Boolean).length === 1 && options[opt.key as keyof typeof options]}
                        />
                        <div className="w-7 h-4 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-primary"></div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* History Sidebar */}
          <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-100 h-fit overflow-hidden flex flex-col">
            <div className="p-3 border-b border-gray-100 bg-gray-50/50">
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[14px]">history</span>
                Recent History
              </h3>
            </div>
            <div className="divide-y divide-gray-50 max-h-[320px] overflow-y-auto custom-scrollbar">
              {history.map((pass, idx) => (
                <div key={idx} className="group flex items-center justify-between px-3 py-2 hover:bg-gray-50 transition-colors">
                  <span className="font-mono text-xs text-gray-600 truncate max-w-[140px]">{pass}</span>
                  <button
                    onClick={() => copyToClipboard(pass)}
                    className="text-gray-300 hover:text-primary p-1 rounded-md hover:bg-white transition-colors opacity-0 group-hover:opacity-100"
                    title="Copy"
                  >
                    <span className="material-symbols-outlined text-[14px]">content_copy</span>
                  </button>
                </div>
              ))}
              {history.length === 0 && (
                <div className="text-center py-8 text-gray-400 text-[10px] italic">
                  No history yet
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};
