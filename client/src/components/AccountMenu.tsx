import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, LogOut, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function AccountMenu() {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Get current user data
  const { data: user } = useQuery<any>({
    queryKey: ['/api/auth/user'],
    retry: false,
  });

  // Check if user is in demo mode
  const isDemoMode = user?.claims?.email === "demo@example.com" || 
                     user?.claims?.sub?.startsWith("demo-");

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await apiRequest('POST', '/api/logout');
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed:', error);
      setIsLoggingOut(false);
    }
  };

  const handleSignInToSave = () => {
    window.location.href = "/api/login";
  };

  const handleSwitchAccount = () => {
    window.location.href = "/api/login";
  };

  const getUserInitials = () => {
    if (isDemoMode) return "DM";
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return "U";
  };

  const getDisplayName = () => {
    if (isDemoMode) return "Demo User";
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    if (user?.email) {
      return user.email;
    }
    return "User";
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="relative h-10 w-10 rounded-full p-0"
          data-testid="button-account"
        >
          <Avatar className="h-9 w-9">
            <AvatarImage src={user?.profileImageUrl || undefined} alt="Profile" />
            <AvatarFallback className="text-xs font-medium">
              {getUserInitials()}
            </AvatarFallback>
          </Avatar>
          <span className="sr-only">Account menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{getDisplayName()}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {isDemoMode ? "Demo session" : user?.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {/* Demo mode specific option */}
        {isDemoMode && (
          <>
            <DropdownMenuItem 
              onClick={handleSignInToSave}
              data-testid="menu-sign-in-save"
              className="cursor-pointer min-h-[2.75rem] py-3"
            >
              <User className="mr-2 h-4 w-4" />
              Sign in to save progress
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        
        {/* Regular account options */}
        {!isDemoMode && (
          <DropdownMenuItem 
            onClick={() => console.log('Account settings')}
            data-testid="menu-account"
            className="cursor-pointer min-h-[2.75rem] py-3"
          >
            <User className="mr-2 h-4 w-4" />
            Account
          </DropdownMenuItem>
        )}
        
        <DropdownMenuItem 
          onClick={handleSwitchAccount}
          data-testid="menu-switch-account"
          className="cursor-pointer min-h-[2.75rem] py-3"
        >
          <Users className="mr-2 h-4 w-4" />
          Switch account
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={handleLogout}
          disabled={isLoggingOut}
          data-testid="menu-logout"
          className="cursor-pointer min-h-[2.75rem] py-3 text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400"
        >
          <LogOut className="mr-2 h-4 w-4" />
          {isLoggingOut ? "Logging out..." : "Log out"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}