import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Terminal, Copy, Check } from 'lucide-react';
import GlassCard from './GlassCard';

interface AgentResponseCardProps {
  agentName: string;
  moduleName: string;
  response: any;
  isLoading?: boolean;
}

const AgentResponseCard: React.FC<AgentResponseCardProps> = ({
  agentName,
  moduleName,
  response,
  isLoading = false
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(response, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getModuleBadgeColor = () => {
    switch (moduleName.toUpperCase()) {
      case 'CAMPUS': return 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400';
      case 'LEARNING': return 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400';
      case 'CODING': return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400';
      case 'PLACEMENT': return 'bg-purple-500/10 border-purple-500/30 text-purple-400';
      case 'CAREER': return 'bg-amber-500/10 border-amber-500/30 text-amber-400';
      default: return 'bg-gray-500/10 border-gray-500/30 text-gray-400';
    }
  };

  // Render object as structured key-value panels
  const renderStructuredData = (data: any) => {
    if (!data) return null;
    
    // If it's a raw/markdown response
    if (data.raw) {
      return (
        <div className="text-gray-300 text-sm leading-relaxed whitespace-pre-line font-sans">
          {data.raw}
        </div>
      );
    }

    // Otherwise render standard agent JSON subfields recursively or via lists
    return (
      <div className="space-y-4">
        {Object.entries(data).map(([key, value]) => {
          if (key === 'raw') return null;

          const formattedKey = key
            .replace(/_/g, ' ')
            .replace(/\b\w/g, c => c.toUpperCase());

          if (Array.isArray(value)) {
            return (
              <div key={key} className="border-t border-nerox-border pt-3">
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{formattedKey}</h4>
                <ul className="list-disc pl-4 space-y-1.5 text-sm text-gray-200">
                  {value.map((item: any, idx: number) => (
                    <li key={idx}>
                      {typeof item === 'object' ? JSON.stringify(item) : item}
                    </li>
                  ))}
                </ul>
              </div>
            );
          }

          if (typeof value === 'object' && value !== null) {
            return (
              <div key={key} className="border-t border-nerox-border pt-3">
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{formattedKey}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  {Object.entries(value).map(([subK, subV]: any) => (
                    <div key={subK} className="bg-nerox-surface/30 p-2.5 rounded-lg border border-nerox-border">
                      <span className="text-xs text-gray-400 block uppercase font-mono">{subK.replace(/_/g, ' ')}</span>
                      <span className="text-gray-200 font-medium">{typeof subV === 'object' ? JSON.stringify(subV) : subV}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          }

          return (
            <div key={key} className="border-t border-nerox-border pt-3">
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">{formattedKey}</h4>
              <p className="text-sm text-gray-200 leading-relaxed font-sans">{String(value)}</p>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      <GlassCard className="p-5" glow={true}>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-nerox-border">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-nerox-indigo/20 text-nerox-indigo border border-nerox-indigo/30">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="text-sm font-semibold text-white font-grotesk">{agentName.replace(/_/g, ' ')} AGENT</span>
              <span className="text-[10px] text-gray-400 block tracking-widest font-mono uppercase">AI operating system response</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium border uppercase tracking-wider ${getModuleBadgeColor()}`}>
              {moduleName}
            </span>
            <button 
              onClick={handleCopy}
              className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-colors"
              title="Copy JSON Payload"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center gap-3 py-6 text-gray-400 text-sm">
            <Terminal className="w-4 h-4 animate-pulse text-nerox-indigo" />
            <span className="animate-pulse font-mono font-light">Compiling structured AI response stream...</span>
          </div>
        ) : (
          renderStructuredData(response)
        )}
      </GlassCard>
    </motion.div>
  );
};

export default AgentResponseCard;
