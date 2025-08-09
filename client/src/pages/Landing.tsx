import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          {/* Hero Section */}
          <div className="mb-16">
            <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Welcome to <span className="text-[#907AD6]">Carefully</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              AI-powered training platform for care workers. Practice real-world scenarios 
              through interactive role-play simulations and build confidence with personalised feedback.
            </p>
            <Button 
              onClick={() => window.location.href = '/api/login'}
              size="lg"
              className="bg-[#907AD6] hover:bg-[#7C66C4] text-white px-8 py-3 text-lg"
            >
              Sign In to Get Started
            </Button>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <Card className="border-2 border-gray-100 dark:border-gray-700">
              <CardHeader>
                <div className="w-12 h-12 bg-[#907AD6] rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <i className="fas fa-brain text-white text-xl"></i>
                </div>
                <CardTitle className="text-[#2C2A4A] dark:text-white">AI-Powered Training</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 dark:text-gray-300">
                  Practise with intelligent AI characters that respond naturally to your care approaches and communication style.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-2 border-gray-100 dark:border-gray-700">
              <CardHeader>
                <div className="w-12 h-12 bg-[#7FDEFF] rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <i className="fas fa-heart text-[#2C2A4A] text-xl"></i>
                </div>
                <CardTitle className="text-[#2C2A4A] dark:text-white">Real-World Scenarios</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 dark:text-gray-300">
                  Train on dementia care, safeguarding, family conflicts, and end-of-life conversations in a safe environment.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-2 border-gray-100 dark:border-gray-700">
              <CardHeader>
                <div className="w-12 h-12 bg-[#DABFFF] rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <i className="fas fa-chart-line text-[#2C2A4A] text-xl"></i>
                </div>
                <CardTitle className="text-[#2C2A4A] dark:text-white">Progress Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 dark:text-gray-300">
                  Monitor your skill development with detailed feedback on empathy, communication, and decision-making.
                </CardDescription>
              </CardContent>
            </Card>
          </div>

          {/* Key Benefits */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-gray-700">
            <h2 className="text-3xl font-bold text-[#2C2A4A] dark:text-white mb-6">
              Why Choose Carefully?
            </h2>
            <div className="grid md:grid-cols-2 gap-6 text-left">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-[#907AD6] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <i className="fas fa-check text-white text-xs"></i>
                </div>
                <div>
                  <h3 className="font-semibold text-[#2C2A4A] dark:text-white mb-1">Safe Learning Environment</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">Practise difficult conversations without real-world consequences</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-[#907AD6] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <i className="fas fa-check text-white text-xs"></i>
                </div>
                <div>
                  <h3 className="font-semibold text-[#2C2A4A] dark:text-white mb-1">Personalised Feedback</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">Get specific insights on your communication and care approach</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-[#907AD6] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <i className="fas fa-check text-white text-xs"></i>
                </div>
                <div>
                  <h3 className="font-semibold text-[#2C2A4A] dark:text-white mb-1">Flexible Training</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">Train at your own pace, anytime, anywhere</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-[#907AD6] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <i className="fas fa-check text-white text-xs"></i>
                </div>
                <div>
                  <h3 className="font-semibold text-[#2C2A4A] dark:text-white mb-1">Evidence-Based</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">Built on best practices in care work and adult learning</p>
                </div>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="mt-16">
            <h3 className="text-2xl font-bold text-[#2C2A4A] dark:text-white mb-4">
              Ready to enhance your care skills?
            </h3>
            <Button 
              onClick={() => window.location.href = '/api/login'}
              size="lg"
              className="bg-[#907AD6] hover:bg-[#7C66C4] text-white px-8 py-3 text-lg"
            >
              Sign In Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}