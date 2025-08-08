import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ScenarioCard } from "@/components/scenario-card";
import { TrainingModal } from "@/components/training-modal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import type { Scenario } from "@shared/schema";

export default function ScenariosPage() {
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [isTrainingModalOpen, setIsTrainingModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState("all");

  const { data: scenarios = [], isLoading } = useQuery<Scenario[]>({
    queryKey: ['/api/scenarios']
  });

  const filteredScenarios = scenarios.filter(scenario => {
    const matchesSearch = scenario.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         scenario.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || scenario.category === categoryFilter;
    const matchesDifficulty = difficultyFilter === "all" || scenario.difficulty === difficultyFilter;
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const categories = Array.from(new Set(scenarios.map(s => s.category)));
  const difficulties = Array.from(new Set(scenarios.map(s => s.difficulty)));

  const handleStartScenario = (scenario: Scenario) => {
    setSelectedScenario(scenario);
    setIsTrainingModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 mobile-bottom-padding">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-800 mb-2">Training Scenarios</h1>
        <p className="text-neutral-500">Practice real-world care situations with AI-powered roleplay</p>
      </div>

      {/* Filters */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Find Scenarios</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-neutral-700 mb-2 block">Search</label>
              <Input
                type="text"
                placeholder="Search scenarios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-neutral-700 mb-2 block">Category</label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-neutral-700 mb-2 block">Difficulty</label>
              <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All levels</SelectItem>
                  {difficulties.map(difficulty => (
                    <SelectItem key={difficulty} value={difficulty}>
                      {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scenarios Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      ) : (
        <>
          <div className="mb-4">
            <p className="text-neutral-600">
              {filteredScenarios.length} scenario{filteredScenarios.length !== 1 ? 's' : ''} found
            </p>
          </div>
          
          {filteredScenarios.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <i className="fas fa-search text-neutral-400 text-4xl mb-4"></i>
                <h3 className="text-lg font-semibold text-neutral-700 mb-2">No scenarios found</h3>
                <p className="text-neutral-500">Try adjusting your search or filters</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredScenarios.map((scenario) => (
                <div key={scenario.id} className="h-fit">
                  <ScenarioCard
                    scenario={scenario}
                  />
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Training Modal */}
      <TrainingModal
        scenario={selectedScenario}
        isOpen={isTrainingModalOpen}
        onClose={() => {
          setIsTrainingModalOpen(false);
          setSelectedScenario(null);
        }}
      />
    </div>
  );
}
