import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { z } from "zod";

const recruiterOnboardingSchema = z.object({
  // Personal Information
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  jobTitle: z.string().min(1, "Job title is required"),
  yearsExperience: z.number().min(0).max(50),
  
  // Company Information
  companyName: z.string().min(1, "Company name is required"),
  companySize: z.string().min(1, "Company size is required"),
  industry: z.string().min(1, "Industry is required"),
  location: z.string().min(1, "Location is required"),
  
  // Recruitment Preferences
  primaryRoles: z.array(z.string()).min(1, "Select at least one role type"),
  recruitmentVolume: z.string().min(1, "Recruitment volume is required"),
  assessmentApproach: z.string().min(1, "Assessment approach is required"),
  
  // Goals and Objectives
  primaryGoals: z.array(z.string()).min(1, "Select at least one goal"),
  challengeAreas: z.array(z.string()).optional(),
  
  // Preferences
  communicationPreferences: z.object({
    emailUpdates: z.boolean().default(true),
    dashboardNotifications: z.boolean().default(true),
    weeklyReports: z.boolean().default(true)
  }).default({})
});

type RecruiterOnboardingForm = z.infer<typeof recruiterOnboardingSchema>;

const companySizes = [
  "1-10 employees",
  "11-50 employees",
  "51-200 employees", 
  "201-1000 employees",
  "1000+ employees"
];

const industries = [
  "Healthcare & Social Care",
  "Private Healthcare",
  "NHS Trust",
  "Care Home Chain",
  "Home Care Agency",
  "Recruitment Agency"
];

const careRoles = [
  "Care Workers",
  "Registered Nurses",
  "Senior Care Staff", 
  "Management Roles",
  "Support Workers",
  "Specialist Positions"
];

const recruitmentVolumes = [
  "1-5 hires per month",
  "6-15 hires per month",
  "16-30 hires per month",
  "30+ hires per month"
];

const assessmentApproaches = [
  "Quick screening (15-30 mins)",
  "Standard assessment (45-60 mins)",
  "Comprehensive evaluation (90+ mins)",
  "Custom approach"
];

const primaryGoals = [
  "Improve candidate quality",
  "Reduce time-to-hire",
  "Increase retention rates",
  "Standardize assessment process",
  "Better candidate experience",
  "Data-driven hiring decisions"
];

const challengeAreas = [
  "Finding qualified candidates",
  "Assessing soft skills",
  "Reducing turnover",
  "Candidate engagement",
  "Interview consistency",
  "Bias in hiring process"
];

const steps = [
  { id: 1, title: "Personal Info", description: "Tell us about yourself" },
  { id: 2, title: "Company Details", description: "Your organization information" },
  { id: 3, title: "Recruitment Preferences", description: "How you hire" },
  { id: 4, title: "Goals & Objectives", description: "What you want to achieve" },
  { id: 5, title: "Setup Complete", description: "Ready to start" }
];

export default function RecruiterOnboarding() {
  const [currentStep, setCurrentStep] = useState(1);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const form = useForm<RecruiterOnboardingForm>({
    resolver: zodResolver(recruiterOnboardingSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      jobTitle: "",
      yearsExperience: 0,
      companyName: "",
      companySize: "",
      industry: "",
      location: "",
      primaryRoles: [],
      recruitmentVolume: "",
      assessmentApproach: "",
      primaryGoals: [],
      challengeAreas: [],
      communicationPreferences: {
        emailUpdates: true,
        dashboardNotifications: true,
        weeklyReports: true
      }
    }
  });

  const completeOnboardingMutation = useMutation({
    mutationFn: async (data: RecruiterOnboardingForm) => {
      const response = await fetch('/api/onboarding/recruiter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error('Failed to complete onboarding');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Welcome to Carefully!",
        description: "Your recruiter profile has been set up successfully",
      });
      setLocation("/recruiter");
    },
    onError: (error: any) => {
      toast({
        title: "Setup Error",
        description: error.message || "Failed to complete setup",
        variant: "destructive"
      });
    }
  });

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = (data: RecruiterOnboardingForm) => {
    completeOnboardingMutation.mutate(data);
  };

  const progress = (currentStep / steps.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-neutral-800 mb-2">
            Welcome to Carefully
          </h1>
          <p className="text-neutral-600">
            Let's set up your recruiter profile to get you started
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-neutral-600">
              Step {currentStep} of {steps.length}
            </span>
            <span className="text-sm font-medium text-primary">
              {Math.round(progress)}% complete
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Indicator */}
        <div className="flex justify-center mb-8">
          <div className="flex space-x-4">
            {steps.map((step) => (
              <div
                key={step.id}
                className={`flex flex-col items-center ${
                  step.id === currentStep
                    ? "text-primary"
                    : step.id < currentStep
                    ? "text-green-600"
                    : "text-neutral-400"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step.id === currentStep
                      ? "bg-primary text-white"
                      : step.id < currentStep
                      ? "bg-green-600 text-white"
                      : "bg-neutral-200 text-neutral-400"
                  }`}
                >
                  {step.id < currentStep ? (
                    <i className="fas fa-check text-xs"></i>
                  ) : (
                    step.id
                  )}
                </div>
                <span className="text-xs mt-1 text-center hidden md:block">
                  {step.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Card>
              <CardHeader>
                <CardTitle>{steps[currentStep - 1].title}</CardTitle>
                <p className="text-sm text-neutral-600">
                  {steps[currentStep - 1].description}
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Step 1: Personal Information */}
                {currentStep === 1 && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
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
                      name="jobTitle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Job Title</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Senior Recruiter, Talent Acquisition Manager" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="yearsExperience"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Years of Recruitment Experience</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="0" 
                              max="50"
                              placeholder="0"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}

                {/* Step 2: Company Information */}
                {currentStep === 2 && (
                  <>
                    <FormField
                      control={form.control}
                      name="companyName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Your company name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="companySize"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Company Size</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select size" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {companySizes.map((size) => (
                                  <SelectItem key={size} value={size}>{size}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="industry"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Industry</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select industry" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {industries.map((industry) => (
                                  <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location</FormLabel>
                          <FormControl>
                            <Input placeholder="City, Country or Region" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}

                {/* Step 3: Recruitment Preferences */}
                {currentStep === 3 && (
                  <>
                    <FormField
                      control={form.control}
                      name="primaryRoles"
                      render={() => (
                        <FormItem>
                          <FormLabel>What roles do you primarily recruit for? (Select all that apply)</FormLabel>
                          <div className="grid grid-cols-2 gap-3 mt-3">
                            {careRoles.map((role) => (
                              <FormField
                                key={role}
                                control={form.control}
                                name="primaryRoles"
                                render={({ field }) => {
                                  return (
                                    <FormItem
                                      key={role}
                                      className="flex flex-row items-start space-x-3 space-y-0"
                                    >
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value?.includes(role)}
                                          onCheckedChange={(checked) => {
                                            return checked
                                              ? field.onChange([...field.value, role])
                                              : field.onChange(
                                                  field.value?.filter(
                                                    (value) => value !== role
                                                  )
                                                )
                                          }}
                                        />
                                      </FormControl>
                                      <FormLabel className="text-sm font-normal cursor-pointer">
                                        {role}
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

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="recruitmentVolume"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Monthly Hiring Volume</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select volume" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {recruitmentVolumes.map((volume) => (
                                  <SelectItem key={volume} value={volume}>{volume}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="assessmentApproach"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Preferred Assessment Length</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select approach" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {assessmentApproaches.map((approach) => (
                                  <SelectItem key={approach} value={approach}>{approach}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </>
                )}

                {/* Step 4: Goals and Objectives */}
                {currentStep === 4 && (
                  <>
                    <FormField
                      control={form.control}
                      name="primaryGoals"
                      render={() => (
                        <FormItem>
                          <FormLabel>What are your primary recruitment goals? (Select all that apply)</FormLabel>
                          <div className="grid grid-cols-1 gap-3 mt-3">
                            {primaryGoals.map((goal) => (
                              <FormField
                                key={goal}
                                control={form.control}
                                name="primaryGoals"
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
                      name="challengeAreas"
                      render={() => (
                        <FormItem>
                          <FormLabel>What are your main recruitment challenges? (Optional)</FormLabel>
                          <div className="grid grid-cols-1 gap-3 mt-3">
                            {challengeAreas.map((challenge) => (
                              <FormField
                                key={challenge}
                                control={form.control}
                                name="challengeAreas"
                                render={({ field }) => {
                                  return (
                                    <FormItem
                                      key={challenge}
                                      className="flex flex-row items-start space-x-3 space-y-0"
                                    >
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value?.includes(challenge)}
                                          onCheckedChange={(checked) => {
                                            return checked
                                              ? field.onChange([...(field.value || []), challenge])
                                              : field.onChange(
                                                  field.value?.filter(
                                                    (value) => value !== challenge
                                                  )
                                                )
                                          }}
                                        />
                                      </FormControl>
                                      <FormLabel className="text-sm font-normal cursor-pointer">
                                        {challenge}
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

                    <div>
                      <FormLabel className="text-base font-medium">Communication Preferences</FormLabel>
                      <div className="space-y-3 mt-3">
                        <FormField
                          control={form.control}
                          name="communicationPreferences.emailUpdates"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <FormLabel className="text-sm font-normal cursor-pointer">
                                Email updates about new features and improvements
                              </FormLabel>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="communicationPreferences.dashboardNotifications"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <FormLabel className="text-sm font-normal cursor-pointer">
                                Dashboard notifications for candidate activity
                              </FormLabel>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="communicationPreferences.weeklyReports"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <FormLabel className="text-sm font-normal cursor-pointer">
                                Weekly summary reports of recruitment activity
                              </FormLabel>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Step 5: Complete */}
                {currentStep === 5 && (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <i className="fas fa-check text-green-600 text-2xl"></i>
                    </div>
                    <h3 className="text-xl font-semibold text-neutral-800 mb-2">
                      Setup Complete!
                    </h3>
                    <p className="text-neutral-600 mb-6">
                      Your recruiter profile is ready. You can now start managing candidates and assessments.
                    </p>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="text-center">
                        <i className="fas fa-users text-primary text-lg mb-2 block"></i>
                        <p className="font-medium">Manage Candidates</p>
                        <p className="text-neutral-500">Add and track candidates</p>
                      </div>
                      <div className="text-center">
                        <i className="fas fa-clipboard-check text-primary text-lg mb-2 block"></i>
                        <p className="font-medium">Monitor Assessments</p>
                        <p className="text-neutral-500">Track progress and results</p>
                      </div>
                      <div className="text-center">
                        <i className="fas fa-chart-bar text-primary text-lg mb-2 block"></i>
                        <p className="font-medium">View Analytics</p>
                        <p className="text-neutral-500">Recruitment insights</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation */}
                <div className="flex justify-between pt-6">
                  {currentStep > 1 && currentStep < 5 && (
                    <Button type="button" variant="outline" onClick={prevStep}>
                      Previous
                    </Button>
                  )}
                  
                  {currentStep < 4 && (
                    <Button type="button" onClick={nextStep} className="ml-auto">
                      Continue
                    </Button>
                  )}
                  
                  {currentStep === 4 && (
                    <Button type="button" onClick={nextStep} className="ml-auto">
                      Review & Complete
                    </Button>
                  )}
                  
                  {currentStep === 5 && (
                    <Button 
                      type="submit" 
                      disabled={completeOnboardingMutation.isPending}
                      className="ml-auto"
                    >
                      {completeOnboardingMutation.isPending ? "Setting up..." : "Get Started"}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </form>
        </Form>
      </div>
    </div>
  );
}