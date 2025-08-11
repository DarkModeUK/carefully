import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { careWorkerOnboardingSchema, type CareWorkerOnboarding } from "@shared/schema";

const experienceLevels = [
  { value: "entry", label: "Entry Level (0-1 years)", description: "New to care work" },
  { value: "intermediate", label: "Intermediate (1-3 years)", description: "Some experience in care" },
  { value: "experienced", label: "Experienced (3-5 years)", description: "Solid care experience" },
  { value: "expert", label: "Expert (5+ years)", description: "Extensive care expertise" }
];

const workSettings = [
  { value: "residential", label: "Residential Care Home" },
  { value: "home_care", label: "Home Care" },
  { value: "day_center", label: "Day Center" },
  { value: "hospital", label: "Hospital/Healthcare Setting" },
  { value: "community", label: "Community Care" }
];

const learningGoalOptions = [
  "Improve communication with residents",
  "Handle challenging behaviors effectively",
  "Develop empathy and compassion skills",
  "Learn medication management",
  "Master dementia care techniques",
  "Build confidence in difficult conversations",
  "Understand safeguarding procedures",
  "Enhance professionalism",
  "Improve family communication",
  "Develop cultural sensitivity"
];

const focusAreaOptions = [
  "Dementia Care",
  "Family Communication",
  "Medication Management",
  "End of Life Care",
  "Safeguarding",
  "Conflict Resolution",
  "Emergency Response",
  "Documentation Skills"
];

export default function CareWorkerOnboarding() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const totalSteps = 4;

  const form = useForm<CareWorkerOnboarding>({
    resolver: zodResolver(careWorkerOnboardingSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      experienceLevel: "intermediate",
      workSetting: "residential",
      specializations: [],
      learningGoals: [],
      previousTraining: false,
      trainingPreferences: {
        preferredDifficulty: "adaptive",
        focusAreas: [],
        sessionDuration: 15
      }
    }
  });

  const mutation = useMutation({
    mutationFn: async (data: CareWorkerOnboarding) => {
      const response = await apiRequest('/api/onboarding/care-worker', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Welcome to Carefully!",
        description: "Your care worker profile has been set up successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      setLocation('/');
    },
    onError: (error: any) => {
      toast({
        title: "Setup Error",
        description: error.message || "Failed to complete setup. Please try again.",
        variant: "destructive",
      });
    }
  });

  const onSubmit = (data: CareWorkerOnboarding) => {
    mutation.mutate(data);
  };

  const nextStep = () => {
    if (step < totalSteps) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-neutral-800 mb-2">Welcome to Carefully!</h2>
              <p className="text-neutral-600">Let's set up your care worker profile</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your first name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your last name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="experienceLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Experience Level</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your experience level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {experienceLevels.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          <div>
                            <div className="font-medium">{level.label}</div>
                            <div className="text-sm text-neutral-500">{level.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="workSetting"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Primary Work Setting</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your work setting" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {workSettings.map((setting) => (
                        <SelectItem key={setting.value} value={setting.value}>
                          {setting.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold text-neutral-800 mb-2">Learning Goals</h2>
              <p className="text-neutral-600">What would you like to improve through training?</p>
            </div>

            <FormField
              control={form.control}
              name="learningGoals"
              render={() => (
                <FormItem>
                  <FormLabel>Select your learning goals (choose at least 1)</FormLabel>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                    {learningGoalOptions.map((goal) => (
                      <FormField
                        key={goal}
                        control={form.control}
                        name="learningGoals"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={goal}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(goal)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, goal])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== goal
                                          )
                                        )
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="text-sm font-normal cursor-pointer">
                                {goal}
                              </FormLabel>
                            </FormItem>
                          )
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="previousTraining"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      I have completed similar training before
                    </FormLabel>
                    <p className="text-sm text-neutral-500">
                      This helps us tailor the experience to your needs
                    </p>
                  </div>
                </FormItem>
              )}
            />
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold text-neutral-800 mb-2">Training Preferences</h2>
              <p className="text-neutral-600">Customize your learning experience</p>
            </div>

            <FormField
              control={form.control}
              name="trainingPreferences.preferredDifficulty"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preferred Training Difficulty</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select difficulty level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner - Start with basics</SelectItem>
                      <SelectItem value="intermediate">Intermediate - Standard scenarios</SelectItem>
                      <SelectItem value="advanced">Advanced - Complex situations</SelectItem>
                      <SelectItem value="adaptive">Adaptive - Adjusts to your performance</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="trainingPreferences.focusAreas"
              render={() => (
                <FormItem>
                  <FormLabel>Areas of Focus (optional)</FormLabel>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    {focusAreaOptions.map((area) => (
                      <FormField
                        key={area}
                        control={form.control}
                        name="trainingPreferences.focusAreas"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={area}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(area)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, area])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== area
                                          )
                                        )
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="text-sm font-normal cursor-pointer">
                                {area}
                              </FormLabel>
                            </FormItem>
                          )
                        }}
                      />
                    ))}
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="trainingPreferences.sessionDuration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preferred Session Duration: {field.value} minutes</FormLabel>
                  <FormControl>
                    <Slider
                      min={5}
                      max={60}
                      step={5}
                      value={[field.value]}
                      onValueChange={(value) => field.onChange(value[0])}
                      className="w-full"
                    />
                  </FormControl>
                  <div className="flex justify-between text-xs text-neutral-500 mt-1">
                    <span>5 min</span>
                    <span>60 min</span>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold text-neutral-800 mb-2">Ready to Start!</h2>
              <p className="text-neutral-600">Review your preferences and begin your care training journey</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Your Profile Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <strong>Name:</strong> {form.getValues('firstName')} {form.getValues('lastName')}
                </div>
                <div>
                  <strong>Experience:</strong> {experienceLevels.find(l => l.value === form.getValues('experienceLevel'))?.label}
                </div>
                <div>
                  <strong>Work Setting:</strong> {workSettings.find(s => s.value === form.getValues('workSetting'))?.label}
                </div>
                <div>
                  <strong>Learning Goals:</strong> {form.getValues('learningGoals').length} selected
                </div>
                <div>
                  <strong>Session Duration:</strong> {form.getValues('trainingPreferences.sessionDuration')} minutes
                </div>
              </CardContent>
            </Card>

            <div className="bg-primary/10 p-4 rounded-lg">
              <h3 className="font-semibold text-primary mb-2">What happens next?</h3>
              <ul className="text-sm space-y-1">
                <li>• Personalized scenario recommendations based on your goals</li>
                <li>• AI-powered feedback tailored to your experience level</li>
                <li>• Progress tracking across key care skills</li>
                <li>• Access to role-play simulations for real-world practice</li>
              </ul>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-secondary/5 py-12">
      <div className="max-w-2xl mx-auto px-4">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-neutral-600">Step {step} of {totalSteps}</span>
            <span className="text-sm text-neutral-500">{Math.round((step / totalSteps) * 100)}% complete</span>
          </div>
          <div className="w-full bg-neutral-200 rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        <Card>
          <CardContent className="p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {renderStepContent()}

                <div className="flex justify-between pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    disabled={step === 1}
                  >
                    Previous
                  </Button>

                  {step < totalSteps ? (
                    <Button type="button" onClick={nextStep}>
                      Next
                    </Button>
                  ) : (
                    <Button type="submit" disabled={mutation.isPending}>
                      {mutation.isPending ? "Setting up..." : "Complete Setup"}
                    </Button>
                  )}
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}