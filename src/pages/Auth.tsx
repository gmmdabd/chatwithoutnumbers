
import React from 'react';
import AuthForm from '@/components/auth/AuthForm';

const Auth: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col justify-center bg-gradient-to-br from-brand-light-blue/20 to-white dark:from-gray-900 dark:to-gray-950 p-4">
      <div className="text-center mb-8 animate-fade-in">
        <h1 className="text-3xl font-bold mb-2 text-brand-blue">ChatWithoutNumbers</h1>
        <p className="text-muted-foreground">
          Secure messaging without phone numbers
        </p>
      </div>
      
      <AuthForm />
      
      <div className="mt-12 text-center text-sm text-muted-foreground animate-fade-in animate-delay-200">
        <p>By signing up, you agree to our Terms of Service and Privacy Policy.</p>
        <p className="mt-2">© 2023 ChatWithoutNumbers. All rights reserved.</p>
      </div>
    </div>
  );
};

export default Auth;
