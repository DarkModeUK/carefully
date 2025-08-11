import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import type { User } from "@shared/schema";

const roleLabels: Record<string, string> = {
  care_worker: "Care Worker",
  recruiter: "Recruiter", 
  ld_manager: "L&D Manager",
  super_admin: "Super Admin"
};

const roleColors: Record<string, string> = {
  care_worker: "bg-blue-100 text-blue-800",
  recruiter: "bg-green-100 text-green-800",
  ld_manager: "bg-purple-100 text-purple-800",
  super_admin: "bg-red-100 text-red-800"
};

export default function SuperAdminPanel() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("");

  const { data: allUsers = [], isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ['/api/admin/users'],
    enabled: user?.role === 'super_admin'
  });

  const switchRoleMutation = useMutation({
    mutationFn: async ({ userId, newRole }: { userId: string, newRole: string }) => {
      return await apiRequest('/api/admin/switch-role', {
        method: 'POST',
        body: JSON.stringify({ userId, newRole })
      });
    },
    onSuccess: (data: any) => {
      toast({
        title: "Role Updated",
        description: `Successfully switched to ${roleLabels[data.user.role]}`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to switch role",
        variant: "destructive"
      });
    }
  });

  const makeAdminMutation = useMutation({
    mutationFn: async (userId: string) => {
      return await apiRequest('/api/admin/make-super-admin', {
        method: 'POST',
        body: JSON.stringify({ userId })
      });
    },
    onSuccess: () => {
      toast({
        title: "Super Admin Granted",
        description: "User has been granted super admin privileges",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to grant admin privileges",
        variant: "destructive"
      });
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (user?.role !== 'super_admin') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8">
          <i className="fas fa-shield-alt text-red-500 text-4xl mb-4"></i>
          <h1 className="text-2xl font-bold text-red-800 mb-2">Access Denied</h1>
          <p className="text-red-600">Super Admin privileges required to access this panel.</p>
        </div>
      </div>
    );
  }

  const filteredUsers = allUsers.filter(u => {
    const matchesSearch = searchTerm === "" || 
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${u.firstName} ${u.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = selectedRole === "" || u.role === selectedRole;
    
    return matchesSearch && matchesRole;
  });

  const handleSwitchMyRole = (newRole: string) => {
    if (user?.id) {
      switchRoleMutation.mutate({ userId: user.id, newRole });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-800 mb-2">Super Admin Panel</h1>
        <p className="text-neutral-600">Manage users, switch roles, and test different user experiences</p>
      </div>

      {/* Quick Role Switching */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <i className="fas fa-user-cog text-primary"></i>
            Quick Role Switch (Test Different Views)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <span className="text-sm font-medium">Current Role:</span>
            <Badge className={roleColors[user?.role || 'care_worker']}>
              {roleLabels[user?.role || 'care_worker']}
            </Badge>
          </div>
          
          <div className="flex flex-wrap gap-3">
            {Object.entries(roleLabels).map(([role, label]) => (
              <Button
                key={role}
                variant={user?.role === role ? "default" : "outline"}
                onClick={() => handleSwitchMyRole(role)}
                disabled={switchRoleMutation.isPending || user?.role === role}
                className="relative"
              >
                <i className={`fas ${role === 'care_worker' ? 'fa-user' : role === 'recruiter' ? 'fa-users' : role === 'ld_manager' ? 'fa-chart-line' : 'fa-crown'} mr-2`}></i>
                {label}
                {role === user?.originalRole && (
                  <span className="absolute -top-1 -right-1 bg-primary text-white text-xs px-1 rounded-full">
                    Original
                  </span>
                )}
              </Button>
            ))}
          </div>
          
          {user?.originalRole && user?.role !== user?.originalRole && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                <i className="fas fa-info-circle mr-1"></i>
                You're currently testing as {roleLabels[user.role]}. 
                Your original role is {roleLabels[user.originalRole]}.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <i className="fas fa-users text-primary"></i>
            User Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Roles</SelectItem>
                {Object.entries(roleLabels).map(([role, label]) => (
                  <SelectItem key={role} value={role}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* User List */}
          {usersLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-20 bg-neutral-100 rounded-lg animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredUsers.map((userData) => (
                <div key={userData.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-neutral-50">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <i className="fas fa-user text-primary"></i>
                    </div>
                    <div>
                      <h3 className="font-medium text-neutral-800">
                        {userData.firstName || userData.lastName ? 
                          `${userData.firstName} ${userData.lastName}`.trim() : 
                          'Unnamed User'
                        }
                      </h3>
                      <p className="text-sm text-neutral-500">{userData.email}</p>
                    </div>
                    <Badge className={roleColors[userData.role]}>
                      {roleLabels[userData.role]}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Select
                      onValueChange={(newRole) => switchRoleMutation.mutate({ userId: userData.id, newRole })}
                      disabled={switchRoleMutation.isPending}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Switch role..." />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(roleLabels)
                          .filter(([role]) => role !== userData.role)
                          .map(([role, label]) => (
                            <SelectItem key={role} value={role}>{label}</SelectItem>
                          ))
                        }
                      </SelectContent>
                    </Select>
                    
                    {userData.role !== 'super_admin' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => makeAdminMutation.mutate(userData.id)}
                        disabled={makeAdminMutation.isPending}
                      >
                        <i className="fas fa-crown mr-2"></i>
                        Make Admin
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              
              {filteredUsers.length === 0 && (
                <div className="text-center py-8">
                  <i className="fas fa-search text-neutral-400 text-3xl mb-3"></i>
                  <p className="text-neutral-500">No users found matching your search criteria.</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Usage Instructions */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <i className="fas fa-info-circle text-blue-500"></i>
            Testing Guide
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <h4 className="font-medium text-blue-800">Care Worker Testing</h4>
              <ul className="text-sm text-neutral-600 space-y-1">
                <li>• Access scenario-based training</li>
                <li>• View skill progress tracking</li>
                <li>• Experience AI-powered feedback</li>
                <li>• Practice role-play simulations</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-green-800">Recruiter Testing</h4>
              <ul className="text-sm text-neutral-600 space-y-1">
                <li>• View candidate pipelines</li>
                <li>• Access assessment tools</li>
                <li>• Review skill evaluations</li>
                <li>• Generate recruitment reports</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-purple-800">L&D Manager Testing</h4>
              <ul className="text-sm text-neutral-600 space-y-1">
                <li>• Monitor team performance</li>
                <li>• View analytics dashboards</li>
                <li>• Track training completion</li>
                <li>• Manage learning objectives</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}