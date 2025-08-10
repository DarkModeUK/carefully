import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { User, Shield, Users } from "lucide-react";

interface RoleSwitcherProps {
  className?: string;
}

export function RoleSwitcher({ className }: RoleSwitcherProps) {
  const { user, isAuthenticated } = useAuth() as any;
  const { toast } = useToast();
  const [isChanging, setIsChanging] = useState(false);

  const roles = [
    { value: "care_worker", label: "Care Worker", icon: User, color: "bg-blue-500" },
    { value: "recruiter", label: "Recruiter", icon: Shield, color: "bg-green-500" },
    { value: "ld_manager", label: "L&D Manager", icon: Users, color: "bg-purple-500" },
  ];

  const userRole = user?.role || "care_worker";
  const currentRole = roles.find(r => r.value === userRole) || roles[0];
  const CurrentIcon = currentRole.icon;

  const handleRoleChange = async (newRole: string) => {
    if (newRole === userRole) return;
    
    setIsChanging(true);
    try {
      const response = await fetch('/api/user/role', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update role');
      }
      
      // Invalidate user data cache
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      
      toast({
        title: "Role Changed",
        description: `Successfully switched to ${roles.find(r => r.value === newRole)?.label}`,
      });
      
      // Refresh the page to update navigation
      setTimeout(() => window.location.reload(), 500);
      
    } catch (error) {
      console.error('Failed to change role:', error);
      toast({
        title: "Role Change Failed",
        description: "There was an error changing your role. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsChanging(false);
    }
  };

  if (!user) return null;

  return (
    <div className={className}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            disabled={isChanging}
            className="flex items-center space-x-2"
          >
            <div className={`w-2 h-2 rounded-full ${currentRole.color}`} />
            <CurrentIcon className="w-4 h-4" />
            <span>{currentRole.label}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
            Switch Role (Testing)
          </div>
          {roles.map((role) => {
            const RoleIcon = role.icon;
            const isActive = role.value === userRole;
            
            return (
              <DropdownMenuItem
                key={role.value}
                onClick={() => handleRoleChange(role.value)}
                disabled={isActive || isChanging}
                className="flex items-center space-x-2"
              >
                <div className={`w-2 h-2 rounded-full ${role.color}`} />
                <RoleIcon className="w-4 h-4" />
                <span>{role.label}</span>
                {isActive && <Badge variant="secondary" className="ml-auto">Current</Badge>}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}