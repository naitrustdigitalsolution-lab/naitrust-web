import { useState } from 'react';
import { MessageSquare, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';

interface FloatingFeedbackButtonProps {
  onNavigate: (page: string) => void;
}

export function FloatingFeedbackButton({ onNavigate }: FloatingFeedbackButtonProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="fixed bottom-4 left-4 z-50 hidden sm:block">
      <AnimatePresence>
        {!isExpanded ? (
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            onClick={() => setIsExpanded(true)}
            className="group flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-white shadow-lg transition-shadow hover:shadow-xl sm:px-4 sm:py-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <MessageSquare size={14} className="transition-transform group-hover:rotate-12 sm:h-4 sm:w-4" />
            <span className="whitespace-nowrap text-[10px] font-medium sm:text-xs">Feedback</span>
          </motion.button>
        ) : (
          <motion.div
            initial={{ opacity: 0, x: -20, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -20, scale: 0.9 }}
            className="w-[calc(100vw-1.5rem)] max-w-56 rounded-xl border-2 border-primary/20 bg-card p-3 shadow-2xl sm:w-64 sm:max-w-none sm:p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold sm:text-lg">Have feedback or suggestions?</h3>
              <button
                onClick={() => setIsExpanded(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <p className="mb-3 text-xs text-muted-foreground sm:mb-4 sm:text-sm">
              We'd love to hear from you! Share your thoughts and help us improve.
            </p>
            <Button
              onClick={() => {
                onNavigate('feedback');
                setIsExpanded(false);
              }}
              size="sm"
              className="h-9 w-full text-xs sm:h-10 sm:text-sm"
            >
              Share Your Feedback
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
