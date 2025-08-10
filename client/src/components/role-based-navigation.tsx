import { useAuth } from "@/hooks/useAuth";
import { Link, useLocation } from "wouter";
import { useState } from "react";

interface NavItem {
  href: string;
  label: string;
  icon: string;
  roles: string[];
}

const allNavItems: NavItem[] = [
  // Care Worker Navigation
  { href: "/", label: "Dashboard", icon: "fas fa-home", roles: ["care_worker"] },
  { href: "/scenarios", label: "Simulation Library", icon: "fas fa-play", roles: ["care_worker"] },
  { href: "/reflection", label: "Reflection", icon: "fas fa-brain", roles: ["care_worker"] },
  { href: "/profile", label: "Profile", icon: "fas fa-user", roles: ["care_worker"] },
  { href: "/progress", label: "Progress", icon: "fas fa-chart-bar", roles: ["care_worker"] },
  
  // Recruiter Navigation
  { href: "/recruiter", label: "Recruiter Dashboard", icon: "fas fa-search", roles: ["recruiter"] },
  { href: "/candidates", label: "Candidates", icon: "fas fa-users", roles: ["recruiter"] },
  { href: "/assessments", label: "Assessments", icon: "fas fa-clipboard-check", roles: ["recruiter"] },
  { href: "/reports", label: "Reports", icon: "fas fa-chart-pie", roles: ["recruiter"] },
  
  // L&D Manager Navigation
  { href: "/ld-manager", label: "L&D Dashboard", icon: "fas fa-chart-line", roles: ["ld_manager"] },
  { href: "/team-performance", label: "Team Performance", icon: "fas fa-users-cog", roles: ["ld_manager"] },
  { href: "/learning-paths", label: "Learning Paths", icon: "fas fa-route", roles: ["ld_manager"] },
  { href: "/analytics", label: "Analytics", icon: "fas fa-analytics", roles: ["ld_manager"] },
  
  // Shared Navigation
  { href: "/profile", label: "Profile", icon: "fas fa-user", roles: ["recruiter", "ld_manager"] },
  { href: "/settings", label: "Settings", icon: "fas fa-cog", roles: ["recruiter", "ld_manager"] },
];

export default function RoleBasedNavigation() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isLoading } = useAuth() as { user: any; isLoading: boolean; isAuthenticated: boolean };

  if (isLoading || !user) return null;

  const userRole = user.role || "care_worker";
  const navItems = allNavItems.filter(item => item.roles.includes(userRole));

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 hover-lift">
            <div className="w-8 h-8 bg-gradient-to-r from-[#907AD6] to-[#7FDEFF] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <span className="text-xl font-bold text-[#2C2A4A]">Carefully</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 ${
                  location === item.href
                    ? "bg-gradient-to-r from-[#907AD6] to-[#7FDEFF] text-white shadow-lg"
                    : "text-gray-600 hover:text-[#907AD6] hover:bg-[#DABFFF]/20"
                }`}
              >
                <i className={`${item.icon} mr-2`}></i>
                {item.label}
              </Link>
            ))}
          </div>

          {/* User Info */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-[#907AD6] to-[#7FDEFF] rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-xs">
                  {user.firstName?.[0] || user.email?.[0]?.toUpperCase() || 'U'}
                </span>
              </div>
              <div className="text-sm">
                <div className="font-medium text-[#2C2A4A]">
                  {user.firstName || user.email?.split('@')[0]}
                </div>
                <div className="text-xs text-gray-500 capitalize">
                  {userRole.replace('_', ' ')}
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-600 hover:text-[#907AD6] hover:bg-[#DABFFF]/20"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <i className={`fas ${mobileMenuOpen ? 'fa-times' : 'fa-bars'} text-lg`}></i>
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    location === item.href
                      ? "bg-gradient-to-r from-[#907AD6] to-[#7FDEFF] text-white"
                      : "text-gray-600 hover:text-[#907AD6] hover:bg-[#DABFFF]/20"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <i className={`${item.icon} mr-2`}></i>
                  {item.label}
                </Link>
              ))}
            </div>
            
            {/* Mobile User Info */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center space-x-3 px-4">
                <div className="w-10 h-10 bg-gradient-to-r from-[#907AD6] to-[#7FDEFF] rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">
                    {user.firstName?.[0] || user.email?.[0]?.toUpperCase() || 'U'}
                  </span>
                </div>
                <div>
                  <div className="font-medium text-[#2C2A4A]">
                    {user.firstName || user.email?.split('@')[0]}
                  </div>
                  <div className="text-sm text-gray-500 capitalize">
                    {userRole.replace('_', ' ')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}