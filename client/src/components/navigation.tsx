import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import type { User } from "@shared/schema";
import carefullyLogo from "@assets/Carefully_1754777567823.png";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

export function Navigation() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useAuth() as { user: User | null; isLoading: boolean; isAuthenticated: boolean };

  const navItems = [
    { href: "/", label: "Dashboard", icon: "fas fa-home" },
    { href: "/scenarios", label: "Scenarios", icon: "fas fa-play" },
    { href: "/profile", label: "Profile", icon: "fas fa-user" },
    { href: "/progress", label: "Progress", icon: "fas fa-chart-bar" },
  ];

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="bg-white shadow-sm border-b border-neutral-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <img src={carefullyLogo} alt="Carefully" className="h-12" />
              </div>
            </div>
            
            {/* Desktop Navigation Links */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                {navItems.map((item) => (
                  <Link key={item.href} href={item.href}>
                    <span className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 cursor-pointer hover-lift btn-press ${
                      location === item.href
                        ? "bg-primary text-white hover-glow"
                        : "text-neutral-500 hover:text-neutral-800 hover:bg-gray-50"
                    }`}>
                      <i className={`${item.icon} mr-2 transition-all duration-300`}></i>
                      {item.label}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Right Side - User Profile and Mobile Menu */}
            <div className="flex items-center space-x-4">
              {/* User Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center text-sm cursor-pointer transition-all duration-300 hover-bounce btn-press p-2">
                    <div className="bg-primary text-white rounded-full h-8 w-8 flex items-center justify-center mr-2 hover-glow transition-all duration-300">
                      <span className="font-medium">
                        {user?.firstName && user?.lastName 
                          ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
                          : user?.email?.[0]?.toUpperCase() || 'U'
                        }
                      </span>
                    </div>
                    <span className="hidden sm:block font-medium text-neutral-800 transition-colors duration-300 hover:text-primary">
                      {user?.firstName && user?.lastName 
                        ? `${user.firstName} ${user.lastName}`
                        : user?.email?.split('@')[0] || 'User'
                      }
                    </span>
                    <i className="fas fa-chevron-down ml-1 text-xs text-neutral-500"></i>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center w-full">
                      <i className="fas fa-user mr-2"></i>
                      View Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/progress" className="flex items-center w-full">
                      <i className="fas fa-chart-bar mr-2"></i>
                      My Progress
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => {
                      window.location.href = '/api/logout';
                    }}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer"
                  >
                    <i className="fas fa-sign-out-alt mr-2"></i>
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Mobile menu button */}
              <button 
                className="md:hidden text-neutral-500 hover:text-neutral-800"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <i className="fas fa-bars text-xl"></i>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-neutral-200">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <span 
                    className={`block px-3 py-2 rounded-md text-base font-medium cursor-pointer ${
                      location === item.href
                        ? "bg-primary text-white"
                        : "text-neutral-500 hover:text-neutral-800"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </span>
                </Link>
              ))}
              
              {/* Mobile Sign Out */}
              <div className="border-t border-neutral-200 mt-3 pt-3">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    window.location.href = '/api/logout';
                  }}
                  className="flex items-center w-full px-3 py-2 rounded-md text-base font-medium text-red-600 hover:text-red-700 hover:bg-red-50 transition-all duration-300"
                >
                  <i className="fas fa-sign-out-alt mr-3"></i>
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 z-40">
        <div className="grid grid-cols-4 py-2">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <span className={`flex flex-col items-center py-2 cursor-pointer ${
                location === item.href ? "text-primary" : "text-neutral-500"
              }`}>
                <i className={`${item.icon} text-lg`}></i>
                <span className="text-xs mt-1">{item.label}</span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
