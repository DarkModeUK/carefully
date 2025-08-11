import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { z } from "zod";

const personalProfileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().optional(),
  linkedinProfile: z.string().optional(),
  yearsExperience: z.number().min(0).max(50),
  specializations: z.array(z.string()).default([]),
  bio: z.string().optional()
});

const companyProfileSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  companySize: z.string().min(1, "Company size is required"),
  industry: z.string().min(1, "Industry is required"),
  website: z.string().optional(),
  description: z.string().optional(),
  location: z.string().min(1, "Location is required"),
  recruitmentFocus: z.array(z.string()).min(1, "Select at least one recruitment focus"),
  assessmentPreferences: z.object({
    prioritySkills: z.array(z.string()).default([]),
    assessmentTypes: z.array(z.string()).default([]),
    candidateScreening: z.string().default("standard")
  }).default({})
});

type PersonalProfile = z.infer<typeof personalProfileSchema>;
type CompanyProfile = z.infer<typeof companyProfileSchema>;

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

const recruitmentFocusOptions = [
  "Care Workers",
  "Registered Nurses", 
  "Senior Care Staff",
  "Management Roles",
  "Specialist Positions",
  "Support Workers"
];

const skillPriorities = [
  "Communication Skills",
  "Empathy & Compassion",
  "Problem Solving",
  "Cultural Sensitivity",
  "Medication Management",
  "Dementia Care",
  "End of Life Care",
  "Safeguarding"
];

const assessmentTypes = [
  "Scenario-based Testing",
  "Skills Assessment",
  "Behavioral Interview",
  "Cultural Fit Assessment",
  "Technical Knowledge Test"
];

export default function RecruiterProfile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("personal");

  const { data: profile } = useQuery({
    queryKey: ['/api/recruiter/profile'],
    initialData: {
      personal: {
        firstName: (user as any)?.firstName || "",
        lastName: (user as any)?.lastName || "",
        email: (user as any)?.email || "",
        phone: "",
        linkedinProfile: "",
        yearsExperience: 0,
        specializations: [],
        bio: ""
      },
      company: {
        companyName: "",
        companySize: "",
        industry: "",
        website: "",
        description: "",
        location: "",
        recruitmentFocus: [],
        assessmentPreferences: {
          prioritySkills: [],
          assessmentTypes: [],
          candidateScreening: "standard"
        }
      }
    }
  });

  const personalForm = useForm<PersonalProfile>({
    resolver: zodResolver(personalProfileSchema),
    defaultValues: profile?.personal
  });

  const companyForm = useForm<CompanyProfile>({
    resolver: zodResolver(companyProfileSchema),
    defaultValues: profile?.company
  });

  const updatePersonalMutation = useMutation({
    mutationFn: async (data: PersonalProfile) => {
      const response = await fetch('/api/recruiter/profile/personal', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error('Failed to update personal profile');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Profile Updated",
        description: "Personal profile has been updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/recruiter/profile'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update personal profile",
        variant: "destructive"
      });
    }
  });

  const updateCompanyMutation = useMutation({
    mutationFn: async (data: CompanyProfile) => {
      const response = await fetch('/api/recruiter/profile/company', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error('Failed to update company profile');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Company Profile Updated", 
        description: "Company profile has been updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/recruiter/profile'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update company profile",
        variant: "destructive"
      });
    }
  });

  const onSubmitPersonal = (data: PersonalProfile) => {
    updatePersonalMutation.mutate(data);
  };

  const onSubmitCompany = (data: CompanyProfile) => {
    updateCompanyMutation.mutate(data);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-800 mb-2">Recruiter Profile</h1>
        <p className="text-neutral-600">Manage your personal and company recruitment profiles</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="personal">Personal Profile</TabsTrigger>
          <TabsTrigger value="company">Company Profile</TabsTrigger>
        </TabsList>

        {/* Personal Profile Tab */}
        <TabsContent value="personal">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <i className="fas fa-user text-primary"></i>
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...personalForm}>
                <form onSubmit={personalForm.handleSubmit(onSubmitPersonal)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={personalForm.control}
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
                      control={personalForm.control}
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={personalForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="your.email@company.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={personalForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Your phone number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={personalForm.control}
                      name="linkedinProfile"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>LinkedIn Profile (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="https://linkedin.com/in/yourname" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={personalForm.control}
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
                  </div>

                  <FormField
                    control={personalForm.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Professional Bio (Optional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Tell us about your recruitment experience and approach..."
                            rows={4}
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    disabled={updatePersonalMutation.isPending}
                    className="w-full md:w-auto"
                  >
                    {updatePersonalMutation.isPending ? "Updating..." : "Update Personal Profile"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Company Profile Tab */}
        <TabsContent value="company">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <i className="fas fa-building text-primary"></i>
                Company Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...companyForm}>
                <form onSubmit={companyForm.handleSubmit(onSubmitCompany)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={companyForm.control}
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
                    
                    <FormField
                      control={companyForm.control}
                      name="website"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Website (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="https://yourcompany.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={companyForm.control}
                      name="companySize"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company Size</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select company size" />
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
                      control={companyForm.control}
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
                    control={companyForm.control}
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

                  <FormField
                    control={companyForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Description (Optional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Brief description of your company and values..."
                            rows={3}
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Separator />

                  <div>
                    <h4 className="text-lg font-medium mb-4">Recruitment Preferences</h4>
                    
                    <div className="space-y-6">
                      <FormField
                        control={companyForm.control}
                        name="recruitmentFocus"
                        render={() => (
                          <FormItem>
                            <FormLabel>Recruitment Focus (Select all that apply)</FormLabel>
                            <div className="grid grid-cols-2 gap-3 mt-3">
                              {recruitmentFocusOptions.map((focus) => (
                                <FormField
                                  key={focus}
                                  control={companyForm.control}
                                  name="recruitmentFocus"
                                  render={({ field }) => {
                                    return (
                                      <FormItem
                                        key={focus}
                                        className="flex flex-row items-start space-x-3 space-y-0"
                                      >
                                        <FormControl>
                                          <input
                                            type="checkbox"
                                            checked={field.value?.includes(focus)}
                                            onChange={(checked) => {
                                              return checked.target.checked
                                                ? field.onChange([...field.value, focus])
                                                : field.onChange(
                                                    field.value?.filter(
                                                      (value) => value !== focus
                                                    )
                                                  )
                                            }}
                                            className="mt-1"
                                          />
                                        </FormControl>
                                        <FormLabel className="text-sm font-normal cursor-pointer">
                                          {focus}
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
                        control={companyForm.control}
                        name="assessmentPreferences.candidateScreening"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Candidate Screening Approach</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select screening approach" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="quick">Quick Screening (15-30 mins)</SelectItem>
                                <SelectItem value="standard">Standard Assessment (45-60 mins)</SelectItem>
                                <SelectItem value="comprehensive">Comprehensive Evaluation (90+ mins)</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    disabled={updateCompanyMutation.isPending}
                    className="w-full md:w-auto"
                  >
                    {updateCompanyMutation.isPending ? "Updating..." : "Update Company Profile"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Profile Summary */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <i className="fas fa-id-card text-primary"></i>
            Profile Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">Personal Details</h4>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Name:</span> {personalForm.getValues('firstName')} {personalForm.getValues('lastName')}</p>
                <p><span className="font-medium">Email:</span> {personalForm.getValues('email')}</p>
                <p><span className="font-medium">Experience:</span> {personalForm.getValues('yearsExperience')} years</p>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-3">Company Details</h4>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Company:</span> {companyForm.getValues('companyName') || 'Not specified'}</p>
                <p><span className="font-medium">Industry:</span> {companyForm.getValues('industry') || 'Not specified'}</p>
                <p><span className="font-medium">Size:</span> {companyForm.getValues('companySize') || 'Not specified'}</p>
              </div>
            </div>
          </div>
          
          {companyForm.getValues('recruitmentFocus')?.length > 0 && (
            <div className="mt-4">
              <h4 className="font-medium mb-2">Recruitment Focus</h4>
              <div className="flex flex-wrap gap-2">
                {companyForm.getValues('recruitmentFocus').map((focus) => (
                  <Badge key={focus} variant="secondary">{focus}</Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}