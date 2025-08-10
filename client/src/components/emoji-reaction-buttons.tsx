import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface EmojiReaction {
  emoji: string;
  label: string;
  category: 'understanding' | 'emotion' | 'confidence' | 'engagement';
  color: string;
  description: string;
}

interface EmojiReactionButtonsProps {
  type: 'scenario' | 'feedback' | 'content' | 'achievement';
  contextId: string; // scenarioId, feedbackId, etc.
  onReaction?: (reaction: EmojiReaction) => void;
  showPersonalized?: boolean;
  className?: string;
  compact?: boolean;
}

// Predefined reaction sets for different learning contexts
const LEARNING_REACTIONS: Record<string, EmojiReaction[]> = {
  scenario: [
    { emoji: '💡', label: 'Insightful', category: 'understanding', color: 'bg-yellow-100 text-yellow-700', description: 'This gave me a new perspective' },
    { emoji: '😊', label: 'Confident', category: 'confidence', color: 'bg-green-100 text-green-700', description: 'I handled this well' },
    { emoji: '🤔', label: 'Thoughtful', category: 'understanding', color: 'bg-blue-100 text-blue-700', description: 'This made me think deeply' },
    { emoji: '😅', label: 'Challenging', category: 'emotion', color: 'bg-orange-100 text-orange-700', description: 'This was tough but valuable' },
    { emoji: '❤️', label: 'Empathetic', category: 'emotion', color: 'bg-pink-100 text-pink-700', description: 'I felt connected to the person' },
    { emoji: '🌟', label: 'Inspiring', category: 'engagement', color: 'bg-purple-100 text-purple-700', description: 'This motivated me to improve' }
  ],
  feedback: [
    { emoji: '👍', label: 'Helpful', category: 'engagement', color: 'bg-green-100 text-green-700', description: 'This feedback is useful' },
    { emoji: '🎯', label: 'Accurate', category: 'understanding', color: 'bg-blue-100 text-blue-700', description: 'Spot on assessment' },
    { emoji: '📈', label: 'Growth', category: 'confidence', color: 'bg-emerald-100 text-emerald-700', description: 'I can see my improvement' },
    { emoji: '🤝', label: 'Supportive', category: 'emotion', color: 'bg-amber-100 text-amber-700', description: 'This feels encouraging' },
    { emoji: '🔍', label: 'Detailed', category: 'understanding', color: 'bg-indigo-100 text-indigo-700', description: 'Good specific guidance' },
    { emoji: '⭐', label: 'Motivating', category: 'engagement', color: 'bg-yellow-100 text-yellow-700', description: 'This inspires me to continue' }
  ],
  content: [
    { emoji: '📚', label: 'Educational', category: 'understanding', color: 'bg-blue-100 text-blue-700', description: 'I learned something new' },
    { emoji: '🧠', label: 'Mind-opening', category: 'understanding', color: 'bg-purple-100 text-purple-700', description: 'This expanded my thinking' },
    { emoji: '🎨', label: 'Creative', category: 'engagement', color: 'bg-pink-100 text-pink-700', description: 'Interesting approach' },
    { emoji: '⚡', label: 'Energizing', category: 'engagement', color: 'bg-yellow-100 text-yellow-700', description: 'This got me excited' },
    { emoji: '🔗', label: 'Relevant', category: 'understanding', color: 'bg-green-100 text-green-700', description: 'Connects to my experience' },
    { emoji: '🚀', label: 'Ready to apply', category: 'confidence', color: 'bg-blue-100 text-blue-700', description: 'I want to try this' }
  ],
  achievement: [
    { emoji: '🎉', label: 'Proud', category: 'emotion', color: 'bg-yellow-100 text-yellow-700', description: 'I feel accomplished' },
    { emoji: '💪', label: 'Strong', category: 'confidence', color: 'bg-red-100 text-red-700', description: 'I feel more capable' },
    { emoji: '🌱', label: 'Growing', category: 'understanding', color: 'bg-green-100 text-green-700', description: 'I can see my progress' },
    { emoji: '🏆', label: 'Victorious', category: 'confidence', color: 'bg-amber-100 text-amber-700', description: 'This feels like a win' },
    { emoji: '🤗', label: 'Grateful', category: 'emotion', color: 'bg-pink-100 text-pink-700', description: 'Thankful for this opportunity' },
    { emoji: '🎯', label: 'Focused', category: 'engagement', color: 'bg-blue-100 text-blue-700', description: 'Clear on next steps' }
  ]
};

export function EmojiReactionButtons({
  type,
  contextId,
  onReaction,
  showPersonalized = true,
  className = "",
  compact = false
}: EmojiReactionButtonsProps) {
  const [selectedReaction, setSelectedReaction] = useState<EmojiReaction | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [userReactions, setUserReactions] = useState<Record<string, number>>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const reactions = LEARNING_REACTIONS[type] || LEARNING_REACTIONS.content;

  // Save reaction mutation
  const saveReactionMutation = useMutation({
    mutationFn: async (reaction: EmojiReaction) => {
      return await apiRequest('POST', '/api/reactions', {
        type,
        contextId,
        emoji: reaction.emoji,
        label: reaction.label,
        category: reaction.category,
        description: reaction.description
      });
    },
    onSuccess: (data, reaction) => {
      setUserReactions(prev => ({
        ...prev,
        [reaction.emoji]: (prev[reaction.emoji] || 0) + 1
      }));
      
      // Show personalized response
      if (showPersonalized) {
        toast({
          title: `${reaction.emoji} ${reaction.label}!`,
          description: getPersonalizedMessage(reaction),
          duration: 3000,
        });
      }
      
      onReaction?.(reaction);
    },
    onError: () => {
      toast({
        title: "Reaction not saved",
        description: "Your reaction couldn't be saved. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleReactionClick = (reaction: EmojiReaction) => {
    if (selectedReaction?.emoji === reaction.emoji) {
      // Deselect if clicking the same reaction
      setSelectedReaction(null);
      return;
    }

    setSelectedReaction(reaction);
    setIsAnimating(true);
    
    // Trigger animation and save
    setTimeout(() => setIsAnimating(false), 600);
    saveReactionMutation.mutate(reaction);
  };

  const getPersonalizedMessage = (reaction: EmojiReaction): string => {
    const messages = {
      understanding: [
        "Great insight! Your understanding is growing.",
        "You're developing deeper awareness.",
        "Excellent reflection on this learning moment."
      ],
      emotion: [
        "Your emotional awareness is a strength.",
        "It's wonderful that you're connecting emotionally.",
        "Your empathy is what makes great care workers."
      ],
      confidence: [
        "Your confidence is building beautifully!",
        "You should feel proud of your progress.",
        "This confidence will serve you well in care work."
      ],
      engagement: [
        "Your enthusiasm for learning shows!",
        "This kind of engagement leads to excellence.",
        "Your motivation is inspiring."
      ]
    };

    const categoryMessages = messages[reaction.category];
    return categoryMessages[Math.floor(Math.random() * categoryMessages.length)];
  };

  if (compact) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {reactions.slice(0, 4).map((reaction) => (
          <Button
            key={reaction.emoji}
            variant="ghost"
            size="sm"
            className={`p-2 h-8 w-8 rounded-full transition-all duration-300 hover-bounce ${
              selectedReaction?.emoji === reaction.emoji 
                ? 'bg-primary/20 scale-110' 
                : 'hover:scale-110'
            }`}
            onClick={() => handleReactionClick(reaction)}
            disabled={saveReactionMutation.isPending}
          >
            <span className="text-base">{reaction.emoji}</span>
          </Button>
        ))}
      </div>
    );
  }

  return (
    <Card className={`${className} transition-all duration-300`}>
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="text-center">
            <h4 className="font-semibold text-sm text-neutral-700 mb-1">
              How did this make you feel?
            </h4>
            <p className="text-xs text-neutral-500">
              Your reactions help us personalise your learning
            </p>
          </div>

          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {reactions.map((reaction, index) => (
              <div key={reaction.emoji} className="text-center">
                <Button
                  variant="ghost"
                  className={`w-full h-auto p-3 flex-col gap-1 transition-all duration-300 hover-lift hover-glow group ${
                    selectedReaction?.emoji === reaction.emoji 
                      ? 'bg-primary/10 border-primary/30 scale-105' 
                      : 'hover:bg-gray-50 hover:scale-105'
                  } ${isAnimating && selectedReaction?.emoji === reaction.emoji ? 'animate-pulse' : ''}`}
                  style={{ animationDelay: `${index * 50}ms` }}
                  onClick={() => handleReactionClick(reaction)}
                  disabled={saveReactionMutation.isPending}
                >
                  <span className={`text-2xl transition-transform duration-300 group-hover:scale-110 ${
                    selectedReaction?.emoji === reaction.emoji ? 'animate-bounce' : ''
                  }`}>
                    {reaction.emoji}
                  </span>
                  <span className="text-xs font-medium text-neutral-600 group-hover:text-primary">
                    {reaction.label}
                  </span>
                  {userReactions[reaction.emoji] && (
                    <Badge className="text-xs px-1 py-0 h-4 min-w-4 rounded-full bg-primary/20 text-primary">
                      {userReactions[reaction.emoji]}
                    </Badge>
                  )}
                </Button>
                
                {selectedReaction?.emoji === reaction.emoji && (
                  <div className="mt-2 p-2 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg fade-in-up">
                    <p className="text-xs text-neutral-600 italic">
                      "{reaction.description}"
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {selectedReaction && (
            <div className="text-center pt-2 border-t border-neutral-100">
              <p className="text-sm text-neutral-600 fade-in-up">
                Thanks for sharing your reaction! This helps us understand your learning journey.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Quick reaction component for inline use
export function QuickEmojiReaction({
  type,
  contextId,
  onReaction,
  className = ""
}: Omit<EmojiReactionButtonsProps, 'compact' | 'showPersonalized'>) {
  return (
    <EmojiReactionButtons
      type={type}
      contextId={contextId}
      onReaction={onReaction}
      compact={true}
      showPersonalized={false}
      className={className}
    />
  );
}

// Floating reaction component for scenarios
export function FloatingEmojiReaction({
  type,
  contextId,
  onReaction,
  position = 'bottom-right'
}: EmojiReactionButtonsProps & { position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const positionClasses = {
    'bottom-right': 'fixed bottom-6 right-6',
    'bottom-left': 'fixed bottom-6 left-6',
    'top-right': 'fixed top-6 right-6',
    'top-left': 'fixed top-6 left-6'
  };

  return (
    <div className={`${positionClasses[position]} z-50 transition-all duration-300`}>
      {isExpanded ? (
        <Card className="shadow-2xl hover:shadow-3xl transition-all duration-300 max-w-xs">
          <CardContent className="p-3">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-medium text-neutral-700">Quick reaction</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => setIsExpanded(false)}
              >
                <i className="fas fa-times text-xs"></i>
              </Button>
            </div>
            <EmojiReactionButtons
              type={type}
              contextId={contextId}
              onReaction={(reaction) => {
                onReaction?.(reaction);
                setIsExpanded(false);
              }}
              compact={true}
              showPersonalized={true}
            />
          </CardContent>
        </Card>
      ) : (
        <Button
          onClick={() => setIsExpanded(true)}
          className="rounded-full w-12 h-12 bg-primary hover:bg-primary/90 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover-lift hover-glow"
        >
          <span className="text-lg">😊</span>
        </Button>
      )}
    </div>
  );
}