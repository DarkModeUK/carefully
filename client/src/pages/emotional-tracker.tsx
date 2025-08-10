import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const emotionalDimensions = [
  {
    key: 'confidence',
    label: 'Confidence',
    description: 'How confident do you feel in your care abilities today?',
    icon: 'fas fa-thumbs-up',
    color: 'text-blue-600',
    lowText: 'Not confident',
    highText: 'Very confident'
  },
  {
    key: 'stress',
    label: 'Stress Level',
    description: 'How stressed or overwhelmed are you feeling?',
    icon: 'fas fa-exclamation-triangle',
    color: 'text-orange-600',
    lowText: 'Very calm',
    highText: 'Very stressed'
  },
  {
    key: 'empathy',
    label: 'Empathy Connection',
    description: 'How connected do you feel to your patients today?',
    icon: 'fas fa-heart',
    color: 'text-pink-600',
    lowText: 'Disconnected',
    highText: 'Deeply connected'
  },
  {
    key: 'resilience',
    label: 'Resilience',
    description: 'How well are you bouncing back from challenges?',
    icon: 'fas fa-shield-alt',
    color: 'text-green-600',
    lowText: 'Struggling',
    highText: 'Very resilient'
  }
];

export default function EmotionalTrackerPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State for new entry
  const [confidence, setConfidence] = useState([7]);
  const [stress, setStress] = useState([5]);
  const [empathy, setEmpathy] = useState([7]);
  const [resilience, setResilience] = useState([7]);
  const [notes, setNotes] = useState('');

  // Fetch emotional states history
  const { data: emotionalStates, isLoading } = useQuery({
    queryKey: ['/api/emotional-states'],
    enabled: !!user,
  });

  // Create emotional state mutation
  const createStateMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('POST', '/api/emotional-states', {
        confidence: confidence[0],
        stress: stress[0],
        empathy: empathy[0],
        resilience: resilience[0],
        notes: notes.trim()
      });
    },
    onSuccess: () => {
      toast({
        title: "Emotional state recorded",
        description: "Your daily emotional check-in has been saved successfully.",
      });
      setNotes('');
      // Reset sliders to neutral positions
      setConfidence([7]);
      setStress([5]);
      setEmpathy([7]);
      setResilience([7]);
      queryClient.invalidateQueries({ queryKey: ['/api/emotional-states'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save emotional state. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createStateMutation.mutate();
  };

  const getWellbeingScore = () => {
    // Calculate overall wellbeing (higher stress = lower score)
    const stressAdjusted = 10 - stress[0]; // Invert stress scale
    return Math.round((confidence[0] + stressAdjusted + empathy[0] + resilience[0]) / 4);
  };

  const getRecommendations = () => {
    const recommendations = [];
    
    if (confidence[0] <= 4) {
      recommendations.push({
        type: 'confidence',
        icon: 'fas fa-star',
        title: 'Build Confidence',
        suggestion: 'Try reviewing your recent successes or completing a quick skill-building exercise.'
      });
    }
    
    if (stress[0] >= 7) {
      recommendations.push({
        type: 'stress',
        icon: 'fas fa-leaf',
        title: 'Manage Stress',
        suggestion: 'Consider taking a short break, practicing deep breathing, or talking to a colleague.'
      });
    }
    
    if (empathy[0] <= 4) {
      recommendations.push({
        type: 'empathy',
        icon: 'fas fa-hands-helping',
        title: 'Reconnect',
        suggestion: 'Spend a few minutes really listening to a patient or reflect on why you chose care work.'
      });
    }
    
    if (resilience[0] <= 4) {
      recommendations.push({
        type: 'resilience',
        icon: 'fas fa-mountain',
        title: 'Build Resilience',
        suggestion: 'Practice self-compassion and remember that challenging days help you grow stronger.'
      });
    }
    
    return recommendations;
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <i className="fas fa-heart text-4xl text-gray-400 mb-4"></i>
            <h2 className="text-xl font-semibold mb-2">Login Required</h2>
            <p className="text-gray-600 mb-4">Please log in to track your emotional wellbeing.</p>
            <Button onClick={() => setLocation('/api/login')}>Log In</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Emotional Wellbeing Tracker</h1>
        <p className="text-gray-600">
          Monitor your emotional health and get personalised support recommendations for better care delivery.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Daily Check-in */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <i className="fas fa-clipboard-check text-[#907AD6]"></i>
                Daily Emotional Check-in
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-8">
                {emotionalDimensions.map((dimension) => {
                  const getValue = () => {
                    switch (dimension.key) {
                      case 'confidence': return confidence;
                      case 'stress': return stress;
                      case 'empathy': return empathy;
                      case 'resilience': return resilience;
                      default: return [7];
                    }
                  };
                  
                  const setValue = (value: number[]) => {
                    switch (dimension.key) {
                      case 'confidence': setConfidence(value); break;
                      case 'stress': setStress(value); break;
                      case 'empathy': setEmpathy(value); break;
                      case 'resilience': setResilience(value); break;
                    }
                  };
                  
                  return (
                    <div key={dimension.key} className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-full bg-gray-100 ${dimension.color}`}>
                          <i className={dimension.icon}></i>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{dimension.label}</h3>
                          <p className="text-sm text-gray-600 mb-4">{dimension.description}</p>
                          
                          <div className="space-y-3">
                            <Slider
                              value={getValue()}
                              onValueChange={setValue}
                              max={10}
                              min={1}
                              step={1}
                              className="w-full"
                            />
                            <div className="flex justify-between text-sm text-gray-500">
                              <span>{dimension.lowText}</span>
                              <span className="font-medium text-lg text-gray-900">
                                {getValue()[0]}/10
                              </span>
                              <span>{dimension.highText}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Notes (Optional)
                  </label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="How are you feeling today? Any specific challenges or wins you'd like to note?"
                    rows={3}
                  />
                </div>
                
                <Button 
                  type="submit" 
                  disabled={createStateMutation.isPending}
                  className="w-full bg-[#907AD6] hover:bg-[#7B6BC7] text-white"
                >
                  {createStateMutation.isPending ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>Saving...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-heart mr-2"></i>Record Today's Wellbeing
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Insights Sidebar */}
        <div className="space-y-6">
          {/* Current Wellbeing Score */}
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Overall Wellbeing</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="relative w-24 h-24 mx-auto mb-4">
                <div className="w-24 h-24 rounded-full border-8 border-gray-200 relative">
                  <div 
                    className="absolute inset-0 rounded-full border-8 border-[#7FDEFF]"
                    style={{
                      clipPath: `polygon(50% 50%, 50% 0%, ${50 + (getWellbeingScore() / 10) * 50}% 0%, ${50 + (getWellbeingScore() / 10) * 50}% 100%, 50% 100%)`
                    }}
                  ></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xl font-bold text-[#7FDEFF]">{getWellbeingScore()}</span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-600">out of 10</p>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle>Personalised Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              {getRecommendations().length === 0 ? (
                <div className="text-center py-4">
                  <i className="fas fa-thumbs-up text-3xl text-green-500 mb-3"></i>
                  <p className="text-sm text-gray-600">
                    You're doing great! Keep up the excellent work maintaining your emotional wellbeing.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {getRecommendations().map((rec, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-[#907AD6] text-white rounded-full text-sm">
                          <i className={rec.icon}></i>
                        </div>
                        <div>
                          <h4 className="font-medium text-sm">{rec.title}</h4>
                          <p className="text-xs text-gray-600 mt-1">{rec.suggestion}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Wellbeing Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start text-sm">
                <i className="fas fa-leaf mr-2"></i>5-minute mindfulness
              </Button>
              <Button variant="outline" className="w-full justify-start text-sm">
                <i className="fas fa-walking mr-2"></i>Take a short walk
              </Button>
              <Button variant="outline" className="w-full justify-start text-sm">
                <i className="fas fa-users mr-2"></i>Connect with colleague
              </Button>
              <Button variant="outline" className="w-full justify-start text-sm">
                <i className="fas fa-book mr-2"></i>Read success story
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent History */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Recent Check-ins</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : emotionalStates && emotionalStates.length === 0 ? (
            <div className="text-center py-8">
              <i className="fas fa-chart-line text-4xl text-gray-400 mb-4"></i>
              <h3 className="text-lg font-medium mb-2">No check-ins yet</h3>
              <p className="text-gray-600">
                Complete your first daily check-in above to start tracking your emotional wellbeing journey.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Sample history data */}
              {[
                { date: 'Today', confidence: 8, stress: 4, empathy: 9, resilience: 7, notes: 'Great day helping Mrs. Johnson with her recovery!' },
                { date: 'Yesterday', confidence: 6, stress: 7, empathy: 7, resilience: 6, notes: 'Challenging shift but learned a lot from difficult situations.' },
                { date: '2 days ago', confidence: 7, stress: 5, empathy: 8, resilience: 8, notes: 'Feeling more confident with new procedures.' }
              ].map((entry, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{entry.date}</span>
                    <span className="text-sm text-gray-600">
                      Overall: {Math.round((entry.confidence + (10 - entry.stress) + entry.empathy + entry.resilience) / 4)}/10
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-4 mb-2">
                    <div className="text-center">
                      <div className="text-xs text-gray-600">Confidence</div>
                      <div className="font-medium text-blue-600">{entry.confidence}/10</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-600">Stress</div>
                      <div className="font-medium text-orange-600">{entry.stress}/10</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-600">Empathy</div>
                      <div className="font-medium text-pink-600">{entry.empathy}/10</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-600">Resilience</div>
                      <div className="font-medium text-green-600">{entry.resilience}/10</div>
                    </div>
                  </div>
                  {entry.notes && (
                    <p className="text-sm text-gray-600 italic">"{entry.notes}"</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}