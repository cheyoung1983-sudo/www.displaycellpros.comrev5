import React, { useEffect } from 'react';
import { BotMessageSquare } from 'lucide-react';

interface TriageAIWidgetProps {
  onOpenEstimator?: () => void;
  onOpenContact?: () => void;
}

export const TriageAIWidget: React.FC<TriageAIWidgetProps> = ({ onOpenContact }) => {
  const agentId = import.meta.env.VITE_ELEVENLABS_AGENT_ID;
  const isConfigured = agentId && agentId !== 'REPLACE_WITH_YOUR_ELEVENLABS_AGENT_ID';

  useEffect(() => {
    if (!isConfigured) return;

    // Dynamically load the ElevenLabs Conversational AI Widget script
    const script = document.createElement('script');
    script.src = 'https://elevenlabs.io/convai-widget/index.js';
    script.async = true;
    script.type = 'text/javascript';
    script.crossOrigin = 'anonymous';
    
    // Append to body
    document.body.appendChild(script);

    return () => {
      // Cleanup script on unmount
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [isConfigured]);

  if (!isConfigured) {
    const handleFallbackClick = () => {
      if (onOpenContact) {
        onOpenContact();
        return;
      }
      const contactEl = document.getElementById('contact');
      if (contactEl) {
        contactEl.scrollIntoView({ behavior: 'smooth' });
        // Optionally focus the first input
        setTimeout(() => {
          const firstInput = contactEl.querySelector('input');
          if (firstInput) firstInput.focus();
        }, 500);
      }
    };

    return (
      <div className="triage-widget-wrapper fixed bottom-5 right-5 z-[99999]">
        <button 
          onClick={handleFallbackClick}
          className="w-14 h-14 rounded-full bg-slate-900 border border-slate-700 shadow-xl shadow-cyan-900/20 flex items-center justify-center text-slate-400 hover:text-cyan-400 hover:border-cyan-500/50 transition-colors"
          title="Contact Intake"
        >
          <BotMessageSquare className="w-6 h-6" />
        </button>
      </div>
    );
  }

  return (
    <div className="triage-widget-wrapper fixed bottom-5 right-5 z-[99999]">
      {React.createElement('elevenlabs-convai', { 'agent-id': agentId })}
    </div>
  );
};

