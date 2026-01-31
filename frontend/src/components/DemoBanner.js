import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { AlertCircle, X } from 'lucide-react';

const DemoBanner = () => {
  const { isDemoMode } = useAuth();
  const [visible, setVisible] = React.useState(true);

  if (!isDemoMode || !visible) return null;

  return (
    <div data-testid="demo-banner" className="bg-accent/10 border-b border-accent/20 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-accent flex-shrink-0" />
          <div className="text-sm">
            <span className="font-medium text-accent">Demo Mode Active:</span>
            <span className="ml-2 text-foreground">
              Supabase not configured. You're viewing sample data. 
              Upload, save, and export features are disabled.
            </span>
            <a 
              href="#setup" 
              className="ml-2 underline font-medium text-primary hover:text-primary/80"
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
              }}
            >
              See setup instructions
            </a>
          </div>
        </div>
        <button
          onClick={() => setVisible(false)}
          className="text-muted-foreground hover:text-foreground transition-colors p-1"
          data-testid="close-demo-banner"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default DemoBanner;
