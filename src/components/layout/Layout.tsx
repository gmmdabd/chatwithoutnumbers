
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MessageSquare, User, Settings, LogOut } from 'lucide-react';
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const isLoggedIn = true; // This will be replaced with actual auth state
  
  if (location.pathname === '/auth') {
    return <>{children}</>; // No layout on auth page
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-brand-light-blue/30 to-white dark:from-gray-900 dark:to-gray-950">
      {isLoggedIn && (
        <header className="w-full h-16 glass-panel fixed top-0 z-40 border-b">
          <div className="container flex items-center justify-between h-full">
            <Link to="/" className="text-xl font-semibold text-brand-blue animate-fade-in">
              ChatWithoutNumbers
            </Link>
            <nav className="hidden md:flex space-x-4">
              <NavLink to="/chat" label="Messages" icon={<MessageSquare size={18} />} />
              <NavLink to="/profile" label="Profile" icon={<User size={18} />} />
              <NavLink to="/settings" label="Settings" icon={<Settings size={18} />} />
            </nav>
            <div className="flex items-center space-x-2">
              <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <LogOut size={20} className="text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </div>
        </header>
      )}
      
      <main className={cn(
        "container mx-auto transition-all duration-300 ease-in-out",
        isLoggedIn ? "pt-24 pb-8" : "py-8"
      )}>
        {children}
      </main>
      
      {isLoggedIn && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 glass-panel border-t">
          <div className="flex justify-around items-center h-full px-6">
            <MobileNavLink to="/chat" icon={<MessageSquare size={24} />} />
            <MobileNavLink to="/profile" icon={<User size={24} />} />
            <MobileNavLink to="/settings" icon={<Settings size={24} />} />
          </div>
        </div>
      )}
    </div>
  );
};

interface NavLinkProps {
  to: string;
  label: string;
  icon: React.ReactNode;
}

const NavLink: React.FC<NavLinkProps> = ({ to, label, icon }) => {
  const location = useLocation();
  const isActive = location.pathname.startsWith(to);
  
  return (
    <Link 
      to={to}
      className={cn(
        "flex items-center px-4 py-2 rounded-full transition-all duration-200",
        "hover:bg-gray-100 dark:hover:bg-gray-800",
        isActive 
          ? "bg-brand-light-blue text-brand-blue dark:bg-gray-800 dark:text-brand-blue" 
          : "text-gray-600 dark:text-gray-400"
      )}
    >
      <span className="mr-2">{icon}</span>
      <span className="font-medium">{label}</span>
    </Link>
  );
};

interface MobileNavLinkProps {
  to: string;
  icon: React.ReactNode;
}

const MobileNavLink: React.FC<MobileNavLinkProps> = ({ to, icon }) => {
  const location = useLocation();
  const isActive = location.pathname.startsWith(to);
  
  return (
    <Link 
      to={to}
      className={cn(
        "p-3 rounded-full transition-all duration-200",
        isActive 
          ? "text-brand-blue bg-brand-light-blue dark:bg-gray-800" 
          : "text-gray-600 dark:text-gray-400"
      )}
    >
      {icon}
    </Link>
  );
};

export default Layout;
