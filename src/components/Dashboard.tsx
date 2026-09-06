import { useState, useRef, useEffect } from 'react';
import { User } from 'firebase/auth';
import { Sparkles, Save, Download, Loader2, CheckCircle2, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { saveConcept } from '../lib/firebase';
import { exportToPDF } from '../lib/pdf';

interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export function Dashboard({ user }: { user: User }) {
  const [theme, setTheme] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [content, setContent] = useState<string | null>(null);
  const [twists, setTwists] = useState<string | null>(null);
  const [loadingTwists, setLoadingTwists] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!theme.trim()) return;
    
    setLoading(true);
    setError(null);
    setContent(null);
    setTwists(null);
    setSaved(false);
    setChatHistory([]);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme, uid: user.uid })
      });

      
      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          
          let errorData = null;
          try {
             const text = await response.text();
             errorData = JSON.parse(text);
          } catch(e) {}
          throw new Error(errorData?.error || (response.status === 429 ? 'Rate limit exceeded. Please wait a minute.' : 'Failed to complete request'));

        } else {
          // If it failed and isn't JSON, it's likely a 504 HTML error from the proxy
          if (response.status === 504) {
             throw new Error("The server took too long to respond. Please try again.");
          }
          throw new Error(`Server error: ${response.status}`);
        }
      }
      
      
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server returned an invalid response (not JSON). Please try again.");
      }
      
      let data;
      try {
        const textResponse = await response.text();
        data = JSON.parse(textResponse);
      } catch (parseError) {
        if (response.status === 429 || response.status === 503 || response.status === 504) {
          throw new Error("The AI model is experiencing high demand or rate limits. Please try again later.");
        }
        throw new Error("Server returned an invalid response. This usually happens during a network proxy timeout.");
      }



      setContent(data.content);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateTwists = async () => {
    if (!content) return;
    
    setLoadingTwists(true);
    setError(null);

    try {
      const response = await fetch('/api/generate-twists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ concept: content, uid: user.uid })
      });

      
      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          
          let errorData = null;
          try {
             const text = await response.text();
             errorData = JSON.parse(text);
          } catch(e) {}
          throw new Error(errorData?.error || (response.status === 429 ? 'Rate limit exceeded. Please wait a minute.' : 'Failed to complete request'));

        } else {
          // If it failed and isn't JSON, it's likely a 504 HTML error from the proxy
          if (response.status === 504) {
             throw new Error("The server took too long to respond. Please try again.");
          }
          throw new Error(`Server error: ${response.status}`);
        }
      }
      
      
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server returned an invalid response (not JSON). Please try again.");
      }
      
      let data;
      try {
        const textResponse = await response.text();
        data = JSON.parse(textResponse);
      } catch (parseError) {
        if (response.status === 429 || response.status === 503 || response.status === 504) {
          throw new Error("The AI model is experiencing high demand or rate limits. Please try again later.");
        }
        throw new Error("Server returned an invalid response. This usually happens during a network proxy timeout.");
      }



      setTwists(data.content);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred generating twists');
    } finally {
      setLoadingTwists(false);
    }
  };

  const handleSave = async () => {
    if (!content) return;
    
    setSaving(true);
    setError(null);
    try {
      await saveConcept({
        userId: user.uid,
        theme,
        content,
        ...(twists ? { twists } : {})
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError('Failed to save concept');
    } finally {
      setSaving(false);
    }
  };

  const handleExportPDF = async () => {
    if (!contentRef.current) return;
    
    try {
      await exportToPDF(
        contentRef.current, 
        `Concept-${theme.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.pdf`
      );
    } catch (err) {
      console.error('PDF generation failed', err);
      setError('Failed to export PDF');
    }
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !content) return;
    
    const userMessage = chatInput.trim();
    setChatInput('');
    
    const newHistory: ChatMessage[] = [...chatHistory, { role: 'user', parts: [{ text: userMessage }] }];
    setChatHistory(newHistory);
    setChatLoading(true);
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ concept: content, history: chatHistory, message: userMessage, uid: user.uid })
      });
      
      
      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          
          let errorData = null;
          try {
             const text = await response.text();
             errorData = JSON.parse(text);
          } catch(e) {}
          throw new Error(errorData?.error || (response.status === 429 ? 'Rate limit exceeded. Please wait a minute.' : 'Failed to complete request'));

        } else {
          // If it failed and isn't JSON, it's likely a 504 HTML error from the proxy
          if (response.status === 504) {
             throw new Error("The server took too long to respond. Please try again.");
          }
          throw new Error(`Server error: ${response.status}`);
        }
      }
      
      
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server returned an invalid response (not JSON). Please try again.");
      }
      
      let data;
      try {
        const textResponse = await response.text();
        data = JSON.parse(textResponse);
      } catch (parseError) {
        if (response.status === 429 || response.status === 503 || response.status === 504) {
          throw new Error("The AI model is experiencing high demand or rate limits. Please try again later.");
        }
        throw new Error("Server returned an invalid response. This usually happens during a network proxy timeout.");
      }



      setChatHistory([...newHistory, { role: 'model', parts: [{ text: data.content }] }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during chat');
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="space-y-12 print:space-y-0">
      <div className="bg-white p-8 md:p-12 border border-[#1a1a1a] print:hidden">
        <h2 className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400 mb-8">Project Inputs</h2>
        
        <form onSubmit={handleGenerate} className="space-y-8">
          <div>
            <label htmlFor="theme" className="block text-[10px] uppercase mb-4 font-bold italic text-[#1a1a1a]">Core Thematic String</label>
            <textarea
              id="theme"
              rows={4}
              className="w-full px-4 py-4 border border-gray-200 text-sm focus:outline-none focus:border-[#1a1a1a] resize-none font-serif placeholder-gray-400"
              placeholder="e.g. Memory as a currency in a drowned city..."
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              disabled={loading}
            />
          </div>
          
          <button
            type="submit"
            disabled={loading || !theme.trim()}
            className="w-full flex items-center justify-center gap-3 bg-[#1a1a1a] text-white text-[10px] uppercase tracking-[0.3em] font-bold py-4 hover:bg-[#333] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {loading ? 'Initializing...' : 'Initialize Gemini'}
          </button>
        </form>
        
        {error && (
          <div className="mt-6 p-4 text-[10px] uppercase tracking-widest font-bold text-red-600 bg-red-50 border border-red-200">
            {error}
          </div>
        )}
      </div>

      <AnimatePresence>
        {content && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-[#1a1a1a] overflow-hidden print:border-none print:m-0 print:p-0"
          >
            <div className="border-b border-[#1a1a1a] px-8 py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#f9f9f9] print:hidden">
              <div className="flex items-center gap-4 flex-1">
                <span className="text-[11px] uppercase tracking-[0.4em] text-gray-400 font-bold">Project Outline</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleExportPDF}
                  className="flex items-center gap-2 border border-[#1a1a1a] px-4 py-2 text-[10px] uppercase tracking-widest font-bold bg-white text-[#1a1a1a] hover:bg-gray-50 transition-colors"
                >
                  <Download className="h-3 w-3" />
                  Export PDF
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || saved}
                  className={`flex items-center gap-2 px-4 py-2 text-[10px] uppercase tracking-widest font-bold transition-colors ${saved ? 'bg-green-600 border border-green-600 text-white' : 'bg-[#1a1a1a] border border-[#1a1a1a] text-white hover:bg-[#333]'} disabled:opacity-50`}
                >
                  {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : saved ? <CheckCircle2 className="h-3 w-3" /> : <Save className="h-3 w-3" />}
                  {saved ? 'Saved' : 'Save to Cloud'}
                </button>
              </div>
            </div>
            
            <div className="p-8 md:p-16 overflow-x-auto bg-[#fdfcfb] print:p-0 print:bg-white">
              <div ref={contentRef} className="prose prose-slate max-w-[65ch] mx-auto prose-headings:font-serif prose-headings:text-[#1a1a1a] prose-p:font-serif prose-p:text-gray-700 prose-p:leading-relaxed prose-a:text-[#1a1a1a] prose-strong:font-sans prose-strong:uppercase prose-strong:tracking-wide prose-strong:text-xs print:max-w-none">
                <ReactMarkdown>{content}</ReactMarkdown>
                
                {twists && (
                  <div className="mt-12 border-t border-[#1a1a1a] pt-12">
                    <h3 className="text-[10px] uppercase tracking-[0.4em] text-gray-400 font-bold mb-8 text-center">Plot Twists</h3>
                    <ReactMarkdown>{twists}</ReactMarkdown>
                  </div>
                )}
              </div>
              
              {!twists && (
                <div className="mt-12 flex justify-center border-t border-gray-200 pt-8 print:hidden">
                  <button
                    onClick={handleGenerateTwists}
                    disabled={loadingTwists}
                    className="flex items-center gap-3 border border-[#1a1a1a] bg-white text-[#1a1a1a] text-[10px] uppercase tracking-[0.3em] font-bold py-3 px-6 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loadingTwists ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                    {loadingTwists ? 'Generating Twists...' : 'Generate Plot Twists'}
                  </button>
                </div>
              )}
            </div>

            {/* Co-Writer Chat Section */}
            <div className="border-t border-[#1a1a1a] bg-white p-8 print:hidden">
              <h3 className="text-[10px] uppercase tracking-[0.4em] font-bold text-gray-400 mb-6 flex items-center gap-2">
                <Sparkles className="h-3 w-3" /> Co-Writer Chat
              </h3>
              
              <div className="space-y-4 mb-4 max-h-[400px] overflow-y-auto">
                {chatHistory.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-4 ${msg.role === 'user' ? 'bg-[#1a1a1a] text-white' : 'bg-gray-50 border border-gray-200 text-[#1a1a1a]'} prose prose-sm prose-p:leading-relaxed prose-a:text-inherit`}>
                      <ReactMarkdown>{msg.parts[0].text}</ReactMarkdown>
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-50 border border-gray-200 p-4">
                      <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              <form onSubmit={handleChatSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask Gemini to refine the plot, expand a character, etc..."
                  className="flex-1 px-4 py-3 border border-[#1a1a1a] text-sm focus:outline-none focus:ring-1 focus:ring-[#1a1a1a]"
                  disabled={chatLoading}
                />
                <button
                  type="submit"
                  disabled={chatLoading || !chatInput.trim()}
                  className="bg-[#1a1a1a] text-white px-6 flex items-center justify-center hover:bg-[#333] transition-colors disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
