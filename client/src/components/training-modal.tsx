import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Scenario } from "@shared/schema";

interface Message {
  role: 'user' | 'character';
  message: string;
  feedback?: any;
}

interface TrainingModalProps {
  scenario: Scenario | null;
  isOpen: boolean;
  onClose: () => void;
}

export function TrainingModal({ scenario, isOpen, onClose }: TrainingModalProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [timeRemaining, setTimeRemaining] = useState(0);
  const { toast } = useToast();

  const sendMessageMutation = useMutation({
    mutationFn: async (data: { message: string; conversationHistory: any[] }) => {
      const response = await apiRequest(
        "POST", 
        `/api/scenarios/${scenario?.id}/conversation`, 
        data
      );
      return response.json();
    },
    onSuccess: (data) => {
      // Add AI response to messages
      setMessages(prev => [
        ...prev,
        { role: 'character', message: data.aiResponse.message }
      ]);
      
      // Show feedback if available
      if (data.feedback) {
        toast({
          title: `Score: ${data.feedback.overallScore}/100`,
          description: data.feedback.feedback,
        });
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  });

  const startScenarioMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/scenarios/${scenario?.id}/start`);
      return response.json();
    },
    onSuccess: () => {
      // Initialize conversation with first AI message
      setMessages([
        { 
          role: 'character', 
          message: getInitialMessage(scenario?.category || '') 
        }
      ]);
      setTimeRemaining(scenario?.estimatedTime ? scenario.estimatedTime * 60 : 900); // Convert to seconds
    }
  });

  useEffect(() => {
    if (isOpen && scenario && messages.length === 0) {
      startScenarioMutation.mutate();
    }
  }, [isOpen, scenario]);

  useEffect(() => {
    if (timeRemaining > 0 && isOpen) {
      const timer = setTimeout(() => setTimeRemaining(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeRemaining, isOpen]);

  const handleSendMessage = () => {
    if (!currentMessage.trim() || !scenario) return;

    const userMessage = { role: 'user' as const, message: currentMessage };
    setMessages(prev => [...prev, userMessage]);

    const conversationHistory = [...messages, userMessage].map(m => ({
      role: m.role,
      message: m.message
    }));

    sendMessageMutation.mutate({
      message: currentMessage,
      conversationHistory
    });

    setCurrentMessage("");
  };

  const handleClose = () => {
    setMessages([]);
    setCurrentMessage("");
    setTimeRemaining(0);
    onClose();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!scenario) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-neutral-800">
            {scenario.title}
          </DialogTitle>
          <p className="text-sm text-neutral-500 mt-1">{scenario.description}</p>
        </DialogHeader>

        <div className="h-96 flex flex-col">
          {/* Scenario Context */}
          <div className="bg-blue-50 p-4 border-b border-neutral-200">
            <div className="flex items-start space-x-3">
              <div className="bg-primary bg-opacity-20 rounded-full p-2 flex-shrink-0">
                <i className="fas fa-info text-primary text-sm"></i>
              </div>
              <div>
                <h4 className="font-medium text-neutral-800 mb-1">Scenario Context</h4>
                <p className="text-sm text-neutral-600">{scenario.context}</p>
              </div>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className={`rounded-full h-8 w-8 flex items-center justify-center flex-shrink-0 ${
                  message.role === 'user' 
                    ? 'bg-primary text-white' 
                    : 'bg-gray-300 text-neutral-800'
                }`}>
                  <span className="text-xs font-medium">
                    {message.role === 'user' ? 'You' : 'MJ'}
                  </span>
                </div>
                <div className="flex-1">
                  <div className={`rounded-lg p-3 ${
                    message.role === 'user'
                      ? 'bg-primary bg-opacity-10'
                      : 'bg-neutral-100'
                  }`}>
                    <p className="text-sm text-neutral-800">{message.message}</p>
                  </div>
                  <p className="text-xs text-neutral-500 mt-1">
                    {message.role === 'user' ? 'Your Response' : 'Mrs. Johnson'}
                  </p>
                </div>
              </div>
            ))}

            {sendMessageMutation.isPending && (
              <div className="flex items-center space-x-2 text-neutral-500">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                <span className="text-sm">Generating response...</span>
              </div>
            )}
          </div>

          {/* Chat Input */}
          <div className="border-t border-neutral-200 p-4">
            <div className="flex space-x-3">
              <Input
                type="text"
                placeholder="Type your response..."
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1"
                disabled={sendMessageMutation.isPending}
              />
              <Button 
                onClick={handleSendMessage}
                disabled={!currentMessage.trim() || sendMessageMutation.isPending}
              >
                <i className="fas fa-paper-plane"></i>
              </Button>
            </div>
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center space-x-4 text-sm text-neutral-500">
                <span>
                  <i className="fas fa-clock mr-1"></i>
                  {formatTime(timeRemaining)} remaining
                </span>
                <span>
                  <i className="fas fa-comments mr-1"></i>
                  {messages.filter(m => m.role === 'user').length}/8 responses
                </span>
              </div>
              <Button variant="ghost" size="sm" onClick={handleClose}>
                End Session <i className="fas fa-stop ml-1"></i>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function getInitialMessage(category: string): string {
  const messages = {
    dementia_care: "Where is my husband? He should be here by now! I need to go home and make dinner for him!",
    family_communication: "I can't believe my sister wants to stop Mom's treatment. Doesn't she care about her at all?",
    medication_management: "I don't want to take these pills anymore. They make me feel dizzy and sick.",
    end_of_life: "The doctor says I don't have much time left. I'm scared... what's going to happen to me?",
    default: "I'm feeling worried and don't know what to do. Can you help me?"
  };
  
  return messages[category as keyof typeof messages] || messages.default;
}
