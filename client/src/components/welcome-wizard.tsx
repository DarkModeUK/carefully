import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface WizardStep {
  id: string;
  title: string;
  description: string;
  icon: string;
  component: React.ComponentType<any>;
}

interface WelcomeWizardProps {
  onComplete: () => void;
}

// Step 1: Welcome & Introduction
const WelcomeStep = ({ onNext }: { onNext: () => void }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 300);
  }, []);

  return (
    <div className={`text-center space-y-6 transition-all duration-700 ${isVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-8'}`}>
      <div className="relative">
        <div className="w-24 h-24 mx-auto bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mb-6 hover-bounce float-animation">
          <i className="fas fa-heart text-3xl text-white"></i>
        </div>
        <div className="absolute -top-2 -right-2 w-8 h-8 bg-accent rounded-full flex items-center justify-center hover-pulse">
          <span className="text-sm">✨</span>
        </div>
      </div>
      
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-neutral-800 fade-in-up">Welcome to Carefully!</h1>
        <p className="text-lg text-neutral-600 max-w-md mx-auto fade-in-left">
          Your personalised journey to becoming an exceptional care worker starts here
        </p>
        
        <div className="flex items-center justify-center gap-2 fade-in-right">
          <Badge className="bg-primary/10 text-primary border-primary/20 hover-bounce">
            <i className="fas fa-graduation-cap mr-1"></i>
            Interactive Training
          </Badge>
          <Badge className="bg-secondary/10 text-secondary border-secondary/20 hover-bounce">
            <i className="fas fa-brain mr-1"></i>
            AI-Powered
          </Badge>
          <Badge className="bg-accent/10 text-accent border-accent/20 hover-bounce">
            <i className="fas fa-users mr-1"></i>
            Human-Centred
          </Badge>
        </div>
      </div>

      <Button 
        onClick={onNext}
        size="lg"
        className="mt-8 bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 hover-lift hover-glow btn-press btn-ripple group"
      >
        Let's Get Started 
        <i className="fas fa-arrow-right ml-2 transition-transform duration-300 group-hover:translate-x-1"></i>
      </Button>
    </div>
  );
};

// Step 2: Role & Experience
const RoleStep = ({ onNext, formData, setFormData }: { onNext: () => void; formData: any; setFormData: (data: any) => void }) => {
  const roles = [
    { value: 'care_assistant', label: 'Care Assistant', icon: 'fas fa-hands-helping' },
    { value: 'senior_carer', label: 'Senior Carer', icon: 'fas fa-user-tie' },
    { value: 'nurse', label: 'Nurse', icon: 'fas fa-user-nurse' },
    { value: 'support_worker', label: 'Support Worker', icon: 'fas fa-heart' },
    { value: 'manager', label: 'Care Manager', icon: 'fas fa-clipboard-list' },
    { value: 'other', label: 'Other', icon: 'fas fa-user' }
  ];

  const experiences = [
    { value: 'new', label: 'New to Care (0-6 months)', color: 'bg-green-100 text-green-700' },
    { value: 'beginner', label: 'Beginner (6 months - 2 years)', color: 'bg-blue-100 text-blue-700' },
    { value: 'intermediate', label: 'Intermediate (2-5 years)', color: 'bg-amber-100 text-amber-700' },
    { value: 'experienced', label: 'Experienced (5+ years)', color: 'bg-purple-100 text-purple-700' }
  ];

  return (
    <div className="space-y-8 fade-in-up">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4 hover-wobble">
          <i className="fas fa-user-circle text-2xl text-primary"></i>
        </div>
        <h2 className="text-2xl font-bold text-neutral-800 mb-2">Tell us about yourself</h2>
        <p className="text-neutral-600">This helps us personalise your training experience</p>
      </div>

      <div className="space-y-6">
        <div>
          <Label className="text-base font-semibold mb-4 block">What's your role?</Label>
          <div className="grid grid-cols-2 gap-3">
            {roles.map((role, index) => (
              <Button
                key={role.value}
                variant={formData.role === role.value ? "default" : "outline"}
                className={`p-4 h-auto flex-col gap-2 transition-all duration-300 hover-lift stagger-item fade-in-up ${
                  formData.role === role.value ? 'bg-primary text-white hover-glow' : 'hover:border-primary hover:text-primary'
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
                onClick={() => setFormData({ ...formData, role: role.value })}
              >
                <i className={`${role.icon} text-lg`}></i>
                <span className="text-sm font-medium">{role.label}</span>
              </Button>
            ))}
          </div>
        </div>

        <div>
          <Label className="text-base font-semibold mb-4 block">Experience level?</Label>
          <div className="space-y-3">
            {experiences.map((exp, index) => (
              <Button
                key={exp.value}
                variant="outline"
                className={`w-full p-4 h-auto justify-start transition-all duration-300 hover-lift stagger-item fade-in-left ${
                  formData.experience === exp.value ? 'border-primary bg-primary/5 text-primary' : 'hover:border-primary'
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
                onClick={() => setFormData({ ...formData, experience: exp.value })}
              >
                <div className={`w-3 h-3 rounded-full mr-3 ${exp.color.split(' ')[0]} transition-transform duration-300 ${
                  formData.experience === exp.value ? 'scale-125' : ''
                }`}></div>
                {exp.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <Button 
        onClick={onNext}
        disabled={!formData.role || !formData.experience}
        className="w-full bg-primary hover:bg-primary/90 text-white py-3 rounded-xl font-semibold transition-all duration-300 hover-lift hover-glow btn-press disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Continue 
        <i className="fas fa-arrow-right ml-2"></i>
      </Button>
    </div>
  );
};

// Step 3: Learning Goals
const GoalsStep = ({ onNext, formData, setFormData }: { onNext: () => void; formData: any; setFormData: (data: any) => void }) => {
  const goals = [
    { value: 'communication', label: 'Improve Communication Skills', icon: 'fas fa-comments', color: 'text-blue-600' },
    { value: 'empathy', label: 'Build Empathy & Compassion', icon: 'fas fa-heart', color: 'text-red-600' },
    { value: 'dementia_care', label: 'Dementia Care Expertise', icon: 'fas fa-brain', color: 'text-purple-600' },
    { value: 'family_support', label: 'Family Communication', icon: 'fas fa-users', color: 'text-green-600' },
    { value: 'end_of_life', label: 'End of Life Care', icon: 'fas fa-dove', color: 'text-amber-600' },
    { value: 'safeguarding', label: 'Safeguarding Skills', icon: 'fas fa-shield-alt', color: 'text-orange-600' }
  ];

  const toggleGoal = (goalValue: string) => {
    const currentGoals = formData.goals || [];
    const newGoals = currentGoals.includes(goalValue)
      ? currentGoals.filter((g: string) => g !== goalValue)
      : [...currentGoals, goalValue];
    setFormData({ ...formData, goals: newGoals });
  };

  return (
    <div className="space-y-8 fade-in-up">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto bg-secondary/10 rounded-full flex items-center justify-center mb-4 hover-bounce">
          <i className="fas fa-target text-2xl text-secondary"></i>
        </div>
        <h2 className="text-2xl font-bold text-neutral-800 mb-2">What are your learning goals?</h2>
        <p className="text-neutral-600">Select all areas you'd like to focus on (choose at least 2)</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {goals.map((goal, index) => {
          const isSelected = (formData.goals || []).includes(goal.value);
          return (
            <div
              key={goal.value}
              className={`stagger-item fade-in-up transition-all duration-300 hover-lift cursor-pointer ${
                isSelected ? 'transform scale-105' : ''
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
              onClick={() => toggleGoal(goal.value)}
            >
              <Card className={`p-4 transition-all duration-300 hover:shadow-lg hover-glow ${
                isSelected ? 'border-primary bg-primary/5 shadow-md' : 'hover:border-primary/50'
              }`}>
                <CardContent className="p-0">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center transition-all duration-300 ${
                      isSelected ? 'bg-primary/10 hover-wobble' : ''
                    }`}>
                      <i className={`${goal.icon} ${goal.color} transition-transform duration-300 ${
                        isSelected ? 'scale-110' : ''
                      }`}></i>
                    </div>
                    <div className="flex-1">
                      <p className={`font-medium transition-colors duration-300 ${
                        isSelected ? 'text-primary' : 'text-neutral-800'
                      }`}>{goal.label}</p>
                    </div>
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-300 ${
                      isSelected ? 'border-primary bg-primary' : 'border-gray-300'
                    }`}>
                      {isSelected && <i className="fas fa-check text-xs text-white"></i>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>

      <Button 
        onClick={onNext}
        disabled={!formData.goals || formData.goals.length < 2}
        className="w-full bg-primary hover:bg-primary/90 text-white py-3 rounded-xl font-semibold transition-all duration-300 hover-lift hover-glow btn-press disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Continue 
        <i className="fas fa-arrow-right ml-2"></i>
      </Button>
    </div>
  );
};

// Step 4: Preferences
const PreferencesStep = ({ onNext, formData, setFormData }: { onNext: () => void; formData: any; setFormData: (data: any) => void }) => {
  return (
    <div className="space-y-8 fade-in-up">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto bg-accent/10 rounded-full flex items-center justify-center mb-4 hover-pulse">
          <i className="fas fa-cog text-2xl text-accent"></i>
        </div>
        <h2 className="text-2xl font-bold text-neutral-800 mb-2">Training Preferences</h2>
        <p className="text-neutral-600">Customise your learning experience</p>
      </div>

      <div className="space-y-6">
        <div className="fade-in-left">
          <Label className="text-base font-semibold mb-4 block">Preferred session length</Label>
          <Select value={formData.sessionLength} onValueChange={(value) => setFormData({ ...formData, sessionLength: value })}>
            <SelectTrigger className="w-full transition-all duration-300 hover:border-primary focus:border-primary">
              <SelectValue placeholder="Choose session length" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="short">Short sessions (5-10 minutes)</SelectItem>
              <SelectItem value="medium">Medium sessions (15-20 minutes)</SelectItem>
              <SelectItem value="long">Long sessions (30+ minutes)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="fade-in-right">
          <Label className="text-base font-semibold mb-4 block">Difficulty preference</Label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: 'gentle', label: 'Gentle', icon: 'fas fa-seedling', color: 'bg-green-100 text-green-700' },
              { value: 'balanced', label: 'Balanced', icon: 'fas fa-balance-scale', color: 'bg-blue-100 text-blue-700' },
              { value: 'challenging', label: 'Challenging', icon: 'fas fa-mountain', color: 'bg-red-100 text-red-700' }
            ].map((diff, index) => (
              <Button
                key={diff.value}
                variant={formData.difficulty === diff.value ? "default" : "outline"}
                className={`p-4 h-auto flex-col gap-2 transition-all duration-300 hover-lift stagger-item fade-in-up ${
                  formData.difficulty === diff.value ? 'bg-primary text-white' : 'hover:border-primary'
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
                onClick={() => setFormData({ ...formData, difficulty: diff.value })}
              >
                <i className={`${diff.icon} text-lg`}></i>
                <span className="text-sm font-medium">{diff.label}</span>
              </Button>
            ))}
          </div>
        </div>

        <div className="fade-in-up">
          <Label className="text-base font-semibold mb-4 block">Notification preferences</Label>
          <div className="space-y-3">
            {[
              { key: 'dailyReminders', label: 'Daily training reminders', icon: 'fas fa-bell' },
              { key: 'progressUpdates', label: 'Weekly progress updates', icon: 'fas fa-chart-line' },
              { key: 'achievements', label: 'Achievement notifications', icon: 'fas fa-trophy' }
            ].map((pref, index) => (
              <div key={pref.key} className={`stagger-item fade-in-up transition-all duration-300 hover-bounce`} style={{ animationDelay: `${index * 100}ms` }}>
                <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50">
                  <Checkbox
                    id={pref.key}
                    checked={formData.notifications?.[pref.key] || false}
                    onCheckedChange={(checked) => 
                      setFormData({ 
                        ...formData, 
                        notifications: { 
                          ...formData.notifications, 
                          [pref.key]: checked 
                        } 
                      })
                    }
                  />
                  <div className="flex items-center space-x-2">
                    <i className={`${pref.icon} text-neutral-500`}></i>
                    <Label htmlFor={pref.key} className="font-medium cursor-pointer">{pref.label}</Label>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Button 
        onClick={onNext}
        disabled={!formData.sessionLength || !formData.difficulty}
        className="w-full bg-primary hover:bg-primary/90 text-white py-3 rounded-xl font-semibold transition-all duration-300 hover-lift hover-glow btn-press disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Complete Setup 
        <i className="fas fa-check ml-2"></i>
      </Button>
    </div>
  );
};

// Step 5: Completion
const CompletionStep = ({ formData, onComplete }: { formData: any; onComplete: () => void }) => {
  const [isVisible, setIsVisible] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateProfileMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('PUT', '/api/user/profile', {
        role: formData.role,
        experienceLevel: formData.experience,
        learningGoals: formData.goals,
        preferences: {
          sessionLength: formData.sessionLength,
          difficulty: formData.difficulty,
          notifications: formData.notifications
        },
        onboardingCompleted: true
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      setTimeout(() => {
        onComplete();
      }, 2000);
    },
    onError: () => {
      toast({
        title: "Setup Error",
        description: "Failed to save your preferences. Please try again.",
        variant: "destructive",
      });
    }
  });

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 300);
    updateProfileMutation.mutate();
  }, []);

  return (
    <div className={`text-center space-y-6 transition-all duration-700 ${isVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-8'}`}>
      <div className="relative">
        <div className="w-24 h-24 mx-auto bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mb-6 hover-bounce celebration-animation">
          <i className="fas fa-check text-3xl text-white"></i>
        </div>
        <div className="absolute inset-0 w-24 h-24 mx-auto">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-accent rounded-full animate-ping"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${i * 200}ms`,
                animationDuration: '1s'
              }}
            />
          ))}
        </div>
      </div>
      
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-neutral-800 fade-in-up">You're all set!</h1>
        <p className="text-lg text-neutral-600 max-w-md mx-auto fade-in-left">
          Your personalised training journey begins now. Let's make care extraordinary together!
        </p>
        
        <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl p-4 fade-in-up">
          <p className="text-sm text-neutral-700 font-medium">
            Based on your preferences, we've created a personalised training plan just for you
          </p>
        </div>
      </div>

      {updateProfileMutation.isPending ? (
        <div className="flex items-center justify-center space-x-2">
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          <span className="text-sm text-neutral-600 ml-2">Setting up your profile...</span>
        </div>
      ) : (
        <div className="text-center fade-in-up">
          <div className="inline-flex items-center text-green-600 font-medium">
            <i className="fas fa-check-circle mr-2"></i>
            Profile setup complete!
          </div>
        </div>
      )}
    </div>
  );
};

export function WelcomeWizard({ onComplete }: WelcomeWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    role: '',
    experience: '',
    goals: [],
    sessionLength: '',
    difficulty: '',
    notifications: {}
  });

  const steps: WizardStep[] = [
    { id: 'welcome', title: 'Welcome', description: 'Introduction to Carefully', icon: 'fas fa-heart', component: WelcomeStep },
    { id: 'role', title: 'About You', description: 'Your role and experience', icon: 'fas fa-user', component: RoleStep },
    { id: 'goals', title: 'Learning Goals', description: 'What you want to achieve', icon: 'fas fa-target', component: GoalsStep },
    { id: 'preferences', title: 'Preferences', description: 'Customise your experience', icon: 'fas fa-cog', component: PreferencesStep },
    { id: 'complete', title: 'Complete', description: 'All set up!', icon: 'fas fa-check', component: CompletionStep }
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const CurrentStepComponent = steps[currentStep].component;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-secondary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress indicator */}
        <div className="mb-8 fade-in-up">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${
                  index <= currentStep 
                    ? 'bg-primary text-white hover-bounce' 
                    : 'bg-gray-200 text-gray-400'
                }`}>
                  <i className={`${step.icon} text-sm`}></i>
                </div>
                {index < steps.length - 1 && (
                  <div className={`h-0.5 w-12 mx-2 transition-all duration-500 ${
                    index < currentStep ? 'bg-primary' : 'bg-gray-200'
                  }`}></div>
                )}
              </div>
            ))}
          </div>
          <div className="text-center">
            <p className="text-sm text-neutral-500">
              Step {currentStep + 1} of {steps.length}: {steps[currentStep].title}
            </p>
          </div>
        </div>

        {/* Main wizard content */}
        <Card className="shadow-xl hover:shadow-2xl transition-all duration-500 hover-lift">
          <CardContent className="p-8">
            <CurrentStepComponent 
              onNext={nextStep}
              onComplete={onComplete}
              formData={formData}
              setFormData={setFormData}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}