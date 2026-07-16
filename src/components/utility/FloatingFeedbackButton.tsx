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
    <div className="fixed left-4 bottom-4 z-50">
      <AnimatePresence>
        {!isExpanded ? (
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            onClick={() => setIsExpanded(true)}
            className="bg-primary text-white px-4 py-2 rounded-full shadow-lg hover:shadow-xl transition-shadow flex items-center gap-1 group"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <MessageSquare size={16} className="group-hover:rotate-12 transition-transform" />
            <span className="text-xs font-medium whitespace-nowrap">Feedback</span>
          </motion.button>
        ) : (
          <motion.div
            initial={{ opacity: 0, x: -20, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -20, scale: 0.9 }}
            className="bg-card border-2 border-primary/20 rounded-xl shadow-2xl p-4 w-64"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-lg">Have feedback or suggestions?</h3>
              <button
                onClick={() => setIsExpanded(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              We'd love to hear from you! Share your thoughts and help us improve.
            </p>
            <Button
              onClick={() => {
                onNavigate('feedback');
                setIsExpanded(false);
              }}
              className="w-full"
            >
              Share Your Feedback
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

