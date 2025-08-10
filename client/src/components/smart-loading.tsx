import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SmartLoadingProps {
  type: 'ai-thinking' | 'scenario-loading' | 'feedback-analysis' | 'data-sync' | 'content-loading' | 'voice-processing';
  duration?: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showTips?: boolean;
}

const loadingMessages = {
  'ai-thinking': [
    "AI is carefully considering your response...",
    "Analysing your communication approach...",
    "Generating thoughtful feedback...",
    "Evaluating care techniques..."
  ],
  'scenario-loading': [
    "Preparing your training scenario...",
    "Setting up realistic care environment...",
    "Loading patient context and background...",
    "Initialising interactive simulation..."
  ],
  'feedback-analysis': [
    "Analysing your empathy and communication...",
    "Reviewing care approach and techniques...",
    "Generating personalised insights...",
    "Calculating skill assessments..."
  ],
  'data-sync': [
    "Syncing your progress...",
    "Updating training records...",
    "Saving your achievements...",
    "Backing up session data..."
  ],
  'content-loading': [
    "Loading training materials...",
    "Fetching latest scenarios...",
    "Preparing interactive content...",
    "Organising learning resources..."
  ],
  'voice-processing': [
    "Processing your voice input...",
    "Converting speech to text...",
    "Analysing your response...",
    "Preparing AI feedback..."
  ]
};

const loadingTips = {
  'ai-thinking': [
    "💡 Tip: Good care responses often start with acknowledging feelings",
    "🎯 Remember: Ask open questions to understand their perspective",
    "💙 Focus: Show empathy before moving to solutions",
    "🔍 Consider: What might they really need right now?"
  ],
  'scenario-loading': [
    "📚 Get ready to practise real-world care situations",
    "🎭 Remember: Stay in character during the simulation",
    "💬 Focus on natural, caring communication",
    "🎯 Each scenario builds specific care skills"
  ],
  'feedback-analysis': [
    "📊 Your progress is being carefully evaluated",
    "🎯 Feedback helps identify growth opportunities",
    "💪 Every interaction improves your skills",
    "📈 Track improvements over time"
  ],
  'data-sync': [
    "☁️ Your training data is safely stored",
    "📱 Access your progress from any device",
    "🔄 Automatic backups protect your achievements",
    "📊 Your learning journey is preserved"
  ],
  'content-loading': [
    "🎓 Fresh training content awaits",
    "📖 Scenarios updated with latest best practices",
    "🌟 New challenges to develop your skills",
    "🎯 Personalised content just for you"
  ],
  'voice-processing': [
    "🎤 Voice input makes training more natural",
    "💬 Speak as you would in real care situations",
    "🎯 Practice verbal communication skills",
    "🔊 Clear speech improves recognition accuracy"
  ]
};

const animations = {
  'ai-thinking': {
    icon: 'fas fa-brain',
    color: 'text-purple-500',
    bgColor: 'bg-purple-50',
    animation: 'pulse'
  },
  'scenario-loading': {
    icon: 'fas fa-play-circle',
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
    animation: 'bounce'
  },
  'feedback-analysis': {
    icon: 'fas fa-chart-line',
    color: 'text-green-500',
    bgColor: 'bg-green-50',
    animation: 'spin'
  },
  'data-sync': {
    icon: 'fas fa-cloud-upload-alt',
    color: 'text-cyan-500',
    bgColor: 'bg-cyan-50',
    animation: 'pulse'
  },
  'content-loading': {
    icon: 'fas fa-book-open',
    color: 'text-orange-500',
    bgColor: 'bg-orange-50',
    animation: 'bounce'
  },
  'voice-processing': {
    icon: 'fas fa-microphone',
    color: 'text-red-500',
    bgColor: 'bg-red-50',
    animation: 'pulse'
  }
};

const sizeClasses = {
  sm: {
    container: 'p-3',
    icon: 'w-8 h-8 text-lg',
    text: 'text-sm',
    tip: 'text-xs'
  },
  md: {
    container: 'p-4',
    icon: 'w-12 h-12 text-xl',
    text: 'text-base',
    tip: 'text-sm'
  },
  lg: {
    container: 'p-6',
    icon: 'w-16 h-16 text-2xl',
    text: 'text-lg',
    tip: 'text-base'
  }
};

export function SmartLoading({ 
  type, 
  duration = 3000, 
  className = "", 
  size = 'md',
  showTips = true 
}: SmartLoadingProps) {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);

  const messages = loadingMessages[type];
  const tips = loadingTips[type];
  const config = animations[type];
  const sizes = sizeClasses[size];

  useEffect(() => {
    const messageInterval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % messages.length);
    }, duration / messages.length);

    const tipInterval = setInterval(() => {
      setCurrentTipIndex((prev) => (prev + 1) % tips.length);
    }, duration / tips.length * 1.5);

    return () => {
      clearInterval(messageInterval);
      clearInterval(tipInterval);
    };
  }, [messages.length, tips.length, duration]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={`${config.bgColor} rounded-xl border ${sizes.container} ${className}`}
    >
      <div className="flex items-center gap-4">
        {/* Animated Icon */}
        <div className={`${sizes.icon} ${config.bgColor} rounded-full flex items-center justify-center flex-shrink-0`}>
          <motion.i 
            className={`${config.icon} ${config.color}`}
            animate={config.animation === 'spin' ? { rotate: 360 } : config.animation === 'pulse' ? { scale: [1, 1.1, 1] } : { y: [0, -4, 0] }}
            transition={config.animation === 'spin' ? { duration: 1, repeat: Infinity, ease: "linear" } : { duration: 1, repeat: Infinity }}
          />
        </div>

        <div className="flex-1 min-w-0">
          {/* Loading Message */}
          <AnimatePresence mode="wait">
            <motion.p
              key={currentMessageIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className={`font-medium ${config.color} ${sizes.text}`}
            >
              {messages[currentMessageIndex]}
            </motion.p>
          </AnimatePresence>

          {/* Loading Progress Dots */}
          <div className="flex gap-1 mt-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <motion.div
                key={i}
                className={`w-1.5 h-1.5 rounded-full ${config.color.replace('text-', 'bg-')}`}
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ 
                  duration: 0.8, 
                  repeat: Infinity,
                  delay: i * 0.2
                }}
              />
            ))}
          </div>

          {/* Contextual Tips */}
          {showTips && (
            <AnimatePresence mode="wait">
              <motion.div
                key={currentTipIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4, delay: 0.5 }}
                className={`mt-3 p-2 bg-white/70 rounded-lg border ${sizes.tip} text-gray-600`}
              >
                {tips[currentTipIndex]}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// Specialized loading components for common scenarios
export function AIThinkingLoader({ className = "", size = 'md' as const }) {
  return (
    <SmartLoading 
      type="ai-thinking" 
      className={className}
      size={size}
      duration={2500}
    />
  );
}

export function ScenarioLoadingSpinner({ className = "", size = 'lg' as const }) {
  return (
    <SmartLoading 
      type="scenario-loading" 
      className={className}
      size={size}
      duration={4000}
    />
  );
}

export function FeedbackAnalysisLoader({ className = "", size = 'md' as const }) {
  return (
    <SmartLoading 
      type="feedback-analysis" 
      className={className}
      size={size}
      duration={3500}
    />
  );
}

export function VoiceProcessingLoader({ className = "", size = 'sm' as const }) {
  return (
    <SmartLoading 
      type="voice-processing" 
      className={className}
      size={size}
      duration={2000}
      showTips={false}
    />
  );
}

export function FeedbackLoadingIndicator({ className = "", size = 'md' as const }) {
  return (
    <div className={`${className} flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200`}>
      <motion.div
        className="w-8 h-8 bg-gradient-to-r from-[#907AD6] to-[#7FDEFF] rounded-full flex items-center justify-center"
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      >
        <i className="fas fa-brain text-white text-sm"></i>
      </motion.div>
      <div className="flex-1">
        <motion.p 
          className="text-[#907AD6] font-medium"
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          Analysing your care approach...
        </motion.p>
        <div className="flex gap-1 mt-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-[#907AD6]"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ 
                duration: 0.8, 
                repeat: Infinity,
                delay: i * 0.3
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// Simple skeleton loaders for content
export function ContentSkeleton({ lines = 3, className = "" }) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <motion.div
          key={i}
          className="h-4 bg-gray-200 rounded animate-pulse"
          style={{ width: `${100 - (i * 10)}%` }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.1 }}
        />
      ))}
    </div>
  );
}

export function CardSkeleton({ className = "" }) {
  return (
    <div className={`p-4 border rounded-lg bg-white ${className}`}>
      <div className="animate-pulse">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2 mt-2"></div>
          </div>
        </div>
        <ContentSkeleton lines={2} />
      </div>
    </div>
  );
}