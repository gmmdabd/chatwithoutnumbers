
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, User, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type FormMode = 'login' | 'register';

const AuthForm: React.FC = () => {
  const [mode, setMode] = useState<FormMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const toggleMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate authentication process
    try {
      // Replace with actual authentication logic
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success(
        mode === 'login' 
          ? 'Successfully logged in!' 
          : 'Account created successfully!'
      );
      
      navigate('/chat');
    } catch (error) {
      toast.error('Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="glass-panel rounded-2xl shadow-card p-8 animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold tracking-tight mb-2">
            {mode === 'login' ? 'Welcome back' : 'Create an account'}
          </h1>
          <p className="text-muted-foreground text-sm">
            {mode === 'login' 
              ? 'Sign in to your account to continue' 
              : 'Sign up to get started with secure messaging'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium">
                Username
              </label>
              <div className="relative">
                <User 
                  size={18} 
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" 
                />
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full rounded-lg border border-input bg-background focus:border-ring focus:ring-1 focus:ring-ring focus:outline-none"
                  placeholder="Choose a username"
                  required
                />
              </div>
            </div>
          )}
          
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <div className="relative">
              <Mail 
                size={18} 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" 
              />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 pr-4 py-2 w-full rounded-lg border border-input bg-background focus:border-ring focus:ring-1 focus:ring-ring focus:outline-none"
                placeholder="Enter your email"
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              {mode === 'login' && (
                <a href="#" className="text-xs text-brand-blue hover:underline">
                  Forgot password?
                </a>
              )}
            </div>
            <div className="relative">
              <Lock 
                size={18} 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" 
              />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10 py-2 w-full rounded-lg border border-input bg-background focus:border-ring focus:ring-1 focus:ring-ring focus:outline-none"
                placeholder={mode === 'login' ? 'Enter your password' : 'Create a password'}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className={cn(
              "w-full py-2.5 px-4 rounded-lg text-white font-medium",
              "bg-brand-blue hover:bg-blue-600 focus:ring-2 focus:ring-blue-400 focus:outline-none",
              "flex items-center justify-center transition-all duration-200",
              "disabled:opacity-70 disabled:cursor-not-allowed"
            )}
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              <span className="flex items-center">
                {mode === 'login' ? 'Sign in' : 'Create account'}
                <ArrowRight size={18} className="ml-2" />
              </span>
            )}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button
              type="button"
              onClick={toggleMode}
              className="text-brand-blue hover:underline font-medium"
            >
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
