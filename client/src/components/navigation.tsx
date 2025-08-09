import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import type { User } from "@shared/schema";

export function Navigation() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useAuth() as { user: User | null; isLoading: boolean; isAuthenticated: boolean };

  const navItems = [
    { href: "/", label: "Dashboard", icon: "fas fa-home" },
    { href: "/scenarios", label: "Scenarios", icon: "fas fa-play" },
    { href: "/profile", label: "Profile", icon: "fas fa-user" },
    { href: "/progress", label: "Progress", icon: "fas fa-chart-bar" },
    { href: "/settings", label: "Settings", icon: "fas fa-cog" },
  ];

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="bg-white shadow-sm border-b border-neutral-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <i className="fas fa-heart text-primary text-2xl mr-2"></i>
                <h1 className="text-xl font-bold text-neutral-800">Carefully</h1>
              </div>
            </div>
            
            {/* Desktop Navigation Links */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                {navItems.map((item) => (
                  <Link key={item.href} href={item.href}>
                    <span className={`px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                      location === item.href
                        ? "bg-primary text-white"
                        : "text-neutral-500 hover:text-neutral-800"
                    }`}>
                      {item.label}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Right Side - User Profile and Mobile Menu */}
            <div className="flex items-center space-x-4">
              {/* User Profile */}
              <Link href="/profile">
                <div className="flex items-center text-sm cursor-pointer hover:opacity-80 transition-opacity duration-200">
                  <div className="bg-primary text-white rounded-full h-8 w-8 flex items-center justify-center mr-2">
                    <span className="font-medium">
                      {user?.firstName && user?.lastName 
                        ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
                        : user?.email?.[0]?.toUpperCase() || 'U'
                      }
                    </span>
                  </div>
                  <span className="hidden sm:block font-medium text-neutral-800">
                    {user?.firstName && user?.lastName 
                      ? `${user.firstName} ${user.lastName}`
                      : user?.email?.split('@')[0] || 'User'
                    }
                  </span>
                </div>
              </Link>

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
