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

const ldManagerOnboardingSchema = z.object({
  // Personal Information
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  jobTitle: z.string().min(1, "Job title is required"),
  yearsExperience: z.number().min(0).max(50),
  
  // Organization Information
  organizationName: z.string().min(1, "Organization name is required"),
  organizationType: z.string().min(1, "Organization type is required"),
  teamSize: z.string().min(1, "Team size is required"),
  department: z.string().min(1, "Department is required"),
  
  // Learning & Development Focus
  ldResponsibilities: z.array(z.string()).min(1, "Select at least one responsibility"),
  trainingAreas: z.array(z.string()).min(1, "Select at least one training area"),
  learningApproach: z.string().min(1, "Learning approach is required"),
  
  // Goals and Metrics
  primaryObjectives: z.array(z.string()).min(1, "Select at least one objective"),
  successMetrics: z.array(z.string()).min(1, "Select at least one metric"),
  currentChallenges: z.array(z.string()).optional(),
  
  // Platform Preferences
  platformUsage: z.object({
    trainingDelivery: z.string().min(1, "Training delivery preference is required"),
    reportingFrequency: z.string().min(1, "Reporting frequency is required"),
    analyticsDepth: z.string().min(1, "Analytics preference is required")
  }),
  
  // Communication
  communicationPreferences: z.object({
    trainingUpdates: z.boolean().default(true),
    performanceAlerts: z.boolean().default(true),
    monthlyReports: z.boolean().default(true),
    strategicInsights: z.boolean().default(true)
  }).default({})
});

type LDManagerOnboardingForm = z.infer<typeof ldManagerOnboardingSchema>;

const organizationTypes = [
  "Healthcare Provider",
  "Care Home Group",
  "Home Care Agency", 
  "NHS Trust",
  "Private Hospital",
  "Training Organization",
  "Government Agency"
];

const teamSizes = [
  "1-10 staff members",
  "11-25 staff members",
  "26-50 staff members",
  "51-100 staff members",
  "100+ staff members"
];

const departments = [
  "Learning & Development",
  "Human Resources",
  "Clinical Education",
  "Quality & Compliance",
  "Operations",
  "Training Department"
];

const ldResponsibilities = [
  "Training program design",
  "Skills assessment & evaluation",
  "Compliance training management",
  "Performance improvement",
  "Career development planning",
  "Team coaching & mentoring",
  "Learning technology management"
];

const trainingAreas = [
  "Clinical skills training",
  "Soft skills development", 
  "Compliance & regulations",
  "Communication skills",
  "Leadership development",
  "Customer service",
  "Health & safety training"
];

const learningApproaches = [
  "Blended learning (online + in-person)",
  "Primarily online/digital",
  "Primarily in-person/classroom",
  "Self-paced learning",
  "Scenario-based training"
];

const primaryObjectives = [
  "Improve staff competency levels",
  "Reduce training time and costs",
  "Increase training engagement",
  "Standardize training delivery",
  "Track learning progress effectively",
  "Improve retention rates",
  "Meet compliance requirements"
];

const successMetrics = [
  "Training completion rates",
  "Skills assessment scores",
  "Employee satisfaction scores",
  "Time to competency",
  "Retention rates",
  "Compliance audit results",
  "Performance improvements"
];

const currentChallenges = [
  "Limited training time",
  "Engaging remote learners",
  "Measuring training effectiveness",
  "Scaling training programs",
  "Budget constraints",
  "Technology adoption",
  "Keeping content updated"
];

const trainingDeliveryOptions = [
  "Self-paced modules",
  "Scheduled group sessions", 
  "Just-in-time training",
  "Mixed approach"
];

const reportingFrequencies = [
  "Real-time dashboards",
  "Weekly summaries",
  "Monthly reports",
  "Quarterly reviews"
];

const analyticsDepths = [
  "High-level overview",
  "Detailed analytics",
  "Advanced insights with recommendations"
];

const steps = [
  { id: 1, title: "Personal Info", description: "Tell us about yourself" },
  { id: 2, title: "Organization", description: "Your organization details" },
  { id: 3, title: "L&D Focus", description: "Your training responsibilities" },
  { id: 4, title: "Goals & Metrics", description: "What you want to achieve" },
  { id: 5, title: "Platform Setup", description: "How you'll use the platform" },
  { id: 6, title: "Setup Complete", description: "Ready to start" }
];

export default function LDManagerOnboarding() {
  const [currentStep, setCurrentStep] = useState(1);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const form = useForm<LDManagerOnboardingForm>({
    resolver: zodResolver(ldManagerOnboardingSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      jobTitle: "",
      yearsExperience: 0,
      organizationName: "",
      organizationType: "",
      teamSize: "",
      department: "",
      ldResponsibilities: [],
      trainingAreas: [],
      learningApproach: "",
      primaryObjectives: [],
      successMetrics: [],
      currentChallenges: [],
      platformUsage: {
        trainingDelivery: "",
        reportingFrequency: "",
        analyticsDepth: ""
      },
      communicationPreferences: {
        trainingUpdates: true,
        performanceAlerts: true,
        monthlyReports: true,
        strategicInsights: true
      }
    }
  });

  const completeOnboardingMutation = useMutation({
    mutationFn: async (data: LDManagerOnboardingForm) => {
      const response = await fetch('/api/onboarding/ld-manager', {
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
        description: "Your L&D manager profile has been set up successfully",
      });
      setLocation("/ld-manager");
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

  const onSubmit = (data: LDManagerOnboardingForm) => {
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
            Let's set up your L&D manager profile to get you started
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
          <div className="flex space-x-2">
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
                <span className="text-xs mt-1 text-center hidden lg:block">
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
                            <Input placeholder="e.g., L&D Manager, Training Director, Head of Learning" {...field} />
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
                          <FormLabel>Years of L&D Experience</FormLabel>
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

                {/* Step 2: Organization Information */}
                {currentStep === 2 && (
                  <>
                    <FormField
                      control={form.control}
                      name="organizationName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Organization Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Your organization name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="organizationType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Organization Type</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {organizationTypes.map((type) => (
                                  <SelectItem key={type} value={type}>{type}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="teamSize"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Team Size</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select size" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {teamSizes.map((size) => (
                                  <SelectItem key={size} value={size}>{size}</SelectItem>
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
                      name="department"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Department</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select department" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {departments.map((dept) => (
                                <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}

                {/* Step 3: L&D Focus */}
                {currentStep === 3 && (
                  <>
                    <FormField
                      control={form.control}
                      name="ldResponsibilities"
                      render={() => (
                        <FormItem>
                          <FormLabel>What are your main L&D responsibilities? (Select all that apply)</FormLabel>
                          <div className="grid grid-cols-1 gap-3 mt-3">
                            {ldResponsibilities.map((responsibility) => (
                              <FormField
                                key={responsibility}
                                control={form.control}
                                name="ldResponsibilities"
                                render={({ field }) => {
                                  return (
                                    <FormItem
                                      key={responsibility}
                                      className="flex flex-row items-start space-x-3 space-y-0"
                                    >
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value?.includes(responsibility)}
                                          onCheckedChange={(checked) => {
                                            return checked
                                              ? field.onChange([...field.value, responsibility])
                                              : field.onChange(
                                                  field.value?.filter(
                                                    (value) => value !== responsibility
                                                  )
                                                )
                                          }}
                                        />
                                      </FormControl>
                                      <FormLabel className="text-sm font-normal cursor-pointer">
                                        {responsibility}
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
                      name="trainingAreas"
                      render={() => (
                        <FormItem>
                          <FormLabel>Which training areas do you focus on? (Select all that apply)</FormLabel>
                          <div className="grid grid-cols-1 gap-3 mt-3">
                            {trainingAreas.map((area) => (
                              <FormField
                                key={area}
                                control={form.control}
                                name="trainingAreas"
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
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="learningApproach"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Preferred Learning Approach</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select approach" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {learningApproaches.map((approach) => (
                                <SelectItem key={approach} value={approach}>{approach}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}

                {/* Step 4: Goals and Metrics */}
                {currentStep === 4 && (
                  <>
                    <FormField
                      control={form.control}
                      name="primaryObjectives"
                      render={() => (
                        <FormItem>
                          <FormLabel>What are your primary L&D objectives? (Select all that apply)</FormLabel>
                          <div className="grid grid-cols-1 gap-3 mt-3">
                            {primaryObjectives.map((objective) => (
                              <FormField
                                key={objective}
                                control={form.control}
                                name="primaryObjectives"
                                render={({ field }) => {
                                  return (
                                    <FormItem
                                      key={objective}
                                      className="flex flex-row items-start space-x-3 space-y-0"
                                    >
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value?.includes(objective)}
                                          onCheckedChange={(checked) => {
                                            return checked
                                              ? field.onChange([...field.value, objective])
                                              : field.onChange(
                                                  field.value?.filter(
                                                    (value) => value !== objective
                                                  )
                                                )
                                          }}
                                        />
                                      </FormControl>
                                      <FormLabel className="text-sm font-normal cursor-pointer">
                                        {objective}
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
                      name="successMetrics"
                      render={() => (
                        <FormItem>
                          <FormLabel>How do you measure training success? (Select all that apply)</FormLabel>
                          <div className="grid grid-cols-1 gap-3 mt-3">
                            {successMetrics.map((metric) => (
                              <FormField
                                key={metric}
                                control={form.control}
                                name="successMetrics"
                                render={({ field }) => {
                                  return (
                                    <FormItem
                                      key={metric}
                                      className="flex flex-row items-start space-x-3 space-y-0"
                                    >
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value?.includes(metric)}
                                          onCheckedChange={(checked) => {
                                            return checked
                                              ? field.onChange([...field.value, metric])
                                              : field.onChange(
                                                  field.value?.filter(
                                                    (value) => value !== metric
                                                  )
                                                )
                                          }}
                                        />
                                      </FormControl>
                                      <FormLabel className="text-sm font-normal cursor-pointer">
                                        {metric}
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
                      name="currentChallenges"
                      render={() => (
                        <FormItem>
                          <FormLabel>What are your current L&D challenges? (Optional)</FormLabel>
                          <div className="grid grid-cols-1 gap-3 mt-3">
                            {currentChallenges.map((challenge) => (
                              <FormField
                                key={challenge}
                                control={form.control}
                                name="currentChallenges"
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
                  </>
                )}

                {/* Step 5: Platform Setup */}
                {currentStep === 5 && (
                  <>
                    <FormField
                      control={form.control}
                      name="platformUsage.trainingDelivery"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>How do you prefer to deliver training?</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select delivery method" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {trainingDeliveryOptions.map((option) => (
                                <SelectItem key={option} value={option}>{option}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="platformUsage.reportingFrequency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>How often would you like to receive reports?</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select frequency" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {reportingFrequencies.map((frequency) => (
                                <SelectItem key={frequency} value={frequency}>{frequency}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="platformUsage.analyticsDepth"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>What level of analytics do you prefer?</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select analytics depth" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {analyticsDepths.map((depth) => (
                                <SelectItem key={depth} value={depth}>{depth}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div>
                      <FormLabel className="text-base font-medium">Communication Preferences</FormLabel>
                      <div className="space-y-3 mt-3">
                        <FormField
                          control={form.control}
                          name="communicationPreferences.trainingUpdates"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <FormLabel className="text-sm font-normal cursor-pointer">
                                Updates about new training content and features
                              </FormLabel>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="communicationPreferences.performanceAlerts"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <FormLabel className="text-sm font-normal cursor-pointer">
                                Alerts for significant performance changes
                              </FormLabel>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="communicationPreferences.monthlyReports"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <FormLabel className="text-sm font-normal cursor-pointer">
                                Monthly training effectiveness reports
                              </FormLabel>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="communicationPreferences.strategicInsights"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <FormLabel className="text-sm font-normal cursor-pointer">
                                Strategic insights and recommendations
                              </FormLabel>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Step 6: Complete */}
                {currentStep === 6 && (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <i className="fas fa-check text-green-600 text-2xl"></i>
                    </div>
                    <h3 className="text-xl font-semibold text-neutral-800 mb-2">
                      Setup Complete!
                    </h3>
                    <p className="text-neutral-600 mb-6">
                      Your L&D manager profile is ready. You can now start managing team performance and learning analytics.
                    </p>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="text-center">
                        <i className="fas fa-chart-line text-primary text-lg mb-2 block"></i>
                        <p className="font-medium">Team Performance</p>
                        <p className="text-neutral-500">Track team progress</p>
                      </div>
                      <div className="text-center">
                        <i className="fas fa-graduation-cap text-primary text-lg mb-2 block"></i>
                        <p className="font-medium">Learning Paths</p>
                        <p className="text-neutral-500">Create training programs</p>
                      </div>
                      <div className="text-center">
                        <i className="fas fa-analytics text-primary text-lg mb-2 block"></i>
                        <p className="font-medium">Advanced Analytics</p>
                        <p className="text-neutral-500">Data-driven insights</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation */}
                <div className="flex justify-between pt-6">
                  {currentStep > 1 && currentStep < 6 && (
                    <Button type="button" variant="outline" onClick={prevStep}>
                      Previous
                    </Button>
                  )}
                  
                  {currentStep < 5 && (
                    <Button type="button" onClick={nextStep} className="ml-auto">
                      Continue
                    </Button>
                  )}
                  
                  {currentStep === 5 && (
                    <Button type="button" onClick={nextStep} className="ml-auto">
                      Review & Complete
                    </Button>
                  )}
                  
                  {currentStep === 6 && (
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