import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import carefullyLogo from "@assets/Carefully_1754777567823.png";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-cyan-50">
      {/* Header */}
      <header className="px-4 lg:px-6 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <img src={carefullyLogo} alt="Carefully" className="h-16" />
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => window.location.href = '/api/login'} 
              className="text-[#2C2A4A] hover:text-[#907AD6] font-medium transition-colors duration-300"
            >
              Sign In
            </button>
            <Button 
              onClick={() => window.location.href = '/api/login'} 
              className="bg-[#907AD6] hover:bg-[#7B6BC7] text-white"
            >
              Try Carefully
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-4 lg:px-6 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl lg:text-6xl font-bold text-[#2C2A4A] mb-6">
            Human-centred skills training that <span className="text-[#907AD6]">transforms care quality</span>
          </h1>

          <p className="text-lg text-gray-500 mb-8 max-w-2xl mx-auto">
            Carefully delivers bite-sized, feedback-rich skills simulations that help care teams communicate better, think faster, and provide more confident, compassionate care — without leaving the rota.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              onClick={() => window.location.href = '/api/login'}
              size="lg"
              className="bg-[#907AD6] hover:bg-[#7C66C4] text-white px-8 py-4 text-lg font-medium"
            >
              Try Carefully
            </Button>
            <button 
              onClick={() => window.location.href = '/api/login'} 
              className="text-[#2C2A4A] hover:text-[#907AD6] font-medium transition-colors duration-300 underline underline-offset-4"
            >
              Already have an account? Sign in
            </button>
          </div>
          
          <p className="text-sm text-gray-500 mt-4">
            See the difference in just weeks.
          </p>
        </div>
      </section>

      {/* Problems Section */}
      <section className="px-4 lg:px-6 py-16 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-[#2C2A4A] mb-6">
              Most care training doesn't prepare you for real life.
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-l-4 border-l-red-400">
              <CardHeader>
                <CardTitle className="text-red-600 text-lg">Generic</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Training is often one-size-fits-all — focused on ticking compliance boxes instead of preparing staff for the high-pressure, emotionally charged moments they face every day.
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card className="border-l-4 border-l-orange-400">
              <CardHeader>
                <CardTitle className="text-orange-600 text-lg">Passive</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Traditional e-learning means clicking through slides or watching videos with little opportunity to practise skills, learn from mistakes, or receive meaningful feedback.
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card className="border-l-4 border-l-amber-400">
              <CardHeader>
                <CardTitle className="text-amber-600 text-lg">Incomplete</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Only 29% of care staff get dementia-specific training, despite dementia being a majority of the workload.
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card className="border-l-4 border-l-red-500">
              <CardHeader>
                <CardTitle className="text-red-700 text-lg">Culturally Unprepared</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  International recruits face challenges with local language and expectations, risking misunderstandings and higher turnover.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="px-4 lg:px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-[#2C2A4A] mb-6">
              From tick-box training to real human skill.
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Carefully's browser-based AI roleplay lets staff:
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-2 border-[#907AD6]/20 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-[#907AD6] rounded-lg flex items-center justify-center mb-4">
                  <i className="fas fa-comments text-white text-xl"></i>
                </div>
                <CardTitle className="text-[#2C2A4A]">Practise Realistic Conversations</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600">
                  Practise realistic care conversations with AI "residents" or "relatives" in safe, repeatable simulations.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-2 border-[#7FDEFF]/20 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-[#7FDEFF] rounded-lg flex items-center justify-center mb-4">
                  <i className="fas fa-chart-line text-[#2C2A4A] text-xl"></i>
                </div>
                <CardTitle className="text-[#2C2A4A]">Improve Through Feedback</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600">
                  Improve through instant, targeted feedback on empathy, clarity, and judgement.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-2 border-[#DABFFF]/20 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-[#DABFFF] rounded-lg flex items-center justify-center mb-4">
                  <i className="fas fa-globe text-[#2C2A4A] text-xl"></i>
                </div>
                <CardTitle className="text-[#2C2A4A]">Adapt to Context</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600">
                  Adapt to language, role, and cultural context for every learner.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Why It Works Section */}
      <section className="px-4 lg:px-6 py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl lg:text-4xl font-bold text-[#2C2A4A] text-center mb-12">
            Why It Works
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#907AD6] rounded-full flex items-center justify-center mb-4 mx-auto">
                <i className="fas fa-mobile-alt text-white text-xl"></i>
              </div>
              <h3 className="font-semibold text-[#2C2A4A] mb-2">Bite-sized & Mobile-first</h3>
              <p className="text-gray-600 text-sm">10–15 min sessions, anywhere, anytime.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-[#7FDEFF] rounded-full flex items-center justify-center mb-4 mx-auto">
                <i className="fas fa-clipboard-check text-[#2C2A4A] text-xl"></i>
              </div>
              <h3 className="font-semibold text-[#2C2A4A] mb-2">Evidence-ready</h3>
              <p className="text-gray-600 text-sm">Audit trails aligned to CQC domains.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-[#DABFFF] rounded-full flex items-center justify-center mb-4 mx-auto">
                <i className="fas fa-tachometer-alt text-[#2C2A4A] text-xl"></i>
              </div>
              <h3 className="font-semibold text-[#2C2A4A] mb-2">Fast Coverage</h3>
              <p className="text-gray-600 text-sm">Quickly close skills gaps, including dementia care coverage.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-[#4F518C] rounded-full flex items-center justify-center mb-4 mx-auto">
                <i className="fas fa-chart-bar text-white text-xl"></i>
              </div>
              <h3 className="font-semibold text-[#2C2A4A] mb-2">Measured Progress</h3>
              <p className="text-gray-600 text-sm">Dashboards on skill growth, empathy, and decision-making.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Who It's For Section */}
      <section className="px-4 lg:px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl lg:text-4xl font-bold text-[#2C2A4A] text-center mb-12">
            Who It's For
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-2 border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="text-blue-800 flex items-center gap-2">
                  <i className="fas fa-building"></i>
                  Care Groups & Providers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-blue-700">
                  Multi-site operators with CQC audit pressure.
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card className="border-2 border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="text-green-800 flex items-center gap-2">
                  <i className="fas fa-city"></i>
                  Local Authorities & ICS
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-green-700">
                  Training at scale for diverse workforces.
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card className="border-2 border-purple-200 bg-purple-50">
              <CardHeader>
                <CardTitle className="text-purple-800 flex items-center gap-2">
                  <i className="fas fa-user-plus"></i>
                  Recruiters
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-purple-700">
                  Behavioural assessments to hire people ready for day one.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Outcomes Section */}
      <section className="px-4 lg:px-6 py-16 bg-[#2C2A4A]">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            The difference we're working towards
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
            <div className="text-center">
              <div className="text-3xl font-bold text-[#7FDEFF] mb-2">📈</div>
              <h3 className="text-white font-semibold mb-2">Higher Skills Assessment</h3>
              <p className="text-gray-300 text-sm">Pass rates</p>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-[#DABFFF] mb-2">❤️</div>
              <h3 className="text-white font-semibold mb-2">Stronger Empathy</h3>
              <p className="text-gray-300 text-sm">Communication scores</p>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-[#907AD6] mb-2">⚡</div>
              <h3 className="text-white font-semibold mb-2">Faster Time-to-competence</h3>
              <p className="text-gray-300 text-sm">For new and existing staff</p>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-[#7FDEFF] mb-2">🛡️</div>
              <h3 className="text-white font-semibold mb-2">Fewer Complaints</h3>
              <p className="text-gray-300 text-sm">Through confident care</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 lg:px-6 py-16 bg-gradient-to-r from-[#907AD6] to-[#7FDEFF]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Ready to close the care skills gap?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Let's get every care worker confident, competent, and compassionate.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => window.location.href = '/api/login'}
              size="lg"
              className="bg-white text-[#907AD6] hover:bg-gray-100 px-8 py-4 text-lg font-medium"
            >
              Try Carefully
            </Button>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 lg:px-6 py-8 bg-gray-900">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <img src={carefullyLogo} alt="Carefully" className="h-10 brightness-0 invert" />
          </div>
          <p className="text-gray-400 text-sm">
            © 2025 Carefully. Building better care through better training.
          </p>
        </div>
      </footer>
    </div>
  );
}