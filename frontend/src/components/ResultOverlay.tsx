import { motion } from 'motion/react';
import { Button } from './ui/button';

interface ResultOverlayProps {
  isCorrect: boolean;
  xpEarned: number;
  onContinue: () => void;
}

export function ResultOverlay({ isCorrect, xpEarned, onContinue }: ResultOverlayProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-6"
      onClick={onContinue}
    >
      <motion.div
        initial={{ scale: 0.8, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', damping: 15 }}
        className={`max-w-md w-full p-8 rounded-3xl border-4 shadow-2xl ${
          isCorrect
            ? 'bg-primary/95 border-primary text-primary-foreground'
            : 'bg-destructive/95 border-destructive text-destructive-foreground'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', damping: 10 }}
          className="text-center mb-6"
        >
          <div className="text-8xl mb-4">{isCorrect ? '🎉' : '🤔'}</div>
          <h2 className={isCorrect ? 'text-primary-foreground' : 'text-destructive-foreground'}>
            {isCorrect ? 'Excellent!' : 'Not Quite'}
          </h2>
        </motion.div>

        {/* XP Display */}
        {isCorrect && (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.3, type: 'spring', damping: 12 }}
            className="bg-primary-foreground/20 backdrop-blur-sm rounded-2xl p-6 mb-6 border-2 border-primary-foreground/30"
          >
            <div className="text-center">
              <div className="text-5xl mb-2">+{xpEarned}</div>
              <p className="text-sm text-primary-foreground/90">XP Earned</p>
            </div>
          </motion.div>
        )}

        {/* Message */}
        <p
          className={`text-center mb-6 ${
            isCorrect ? 'text-primary-foreground/90' : 'text-destructive-foreground/90'
          }`}
        >
          {isCorrect
            ? "Great job! You're becoming a mushroom expert!"
            : "Don't worry! Every mistake is a learning opportunity."}
        </p>

        {/* Continue Button */}
        <Button
          onClick={onContinue}
          className={`w-full h-14 rounded-2xl ${
            isCorrect
              ? 'bg-primary-foreground text-primary hover:bg-primary-foreground/90'
              : 'bg-destructive-foreground text-destructive hover:bg-destructive-foreground/90'
          }`}
        >
          Continue Learning
        </Button>
      </motion.div>
    </motion.div>
  );
}
