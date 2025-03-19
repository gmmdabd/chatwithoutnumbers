
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Lock, MessageSquare, UserCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const Index: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="py-16 md:py-24 px-6 bg-gradient-to-b from-brand-light-blue/30 to-white dark:from-gray-900 dark:to-gray-950">
        <div className="container mx-auto text-center max-w-5xl">
          <div className="inline-block bg-brand-light-blue dark:bg-gray-800 text-brand-blue dark:text-blue-400 px-4 py-1.5 rounded-full text-sm font-medium mb-6 animate-fade-in">
            Secure. Private. Simple.
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight animate-slide-in">
            Private Messaging
            <br />
            <span className="text-brand-blue">Without Phone Numbers</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto animate-slide-in">
            A chat app that prioritizes your privacy. No phone numbers required, just secure end-to-end encrypted messaging.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 animate-slide-in">
            <Link
              to="/auth"
              className={cn(
                "px-8 py-3 rounded-lg text-white font-medium",
                "bg-brand-blue hover:bg-blue-600 shadow-lg shadow-blue-500/20",
                "flex items-center justify-center transition-all duration-200",
                "transform hover:translate-y-[-2px]"
              )}
            >
              Get Started
              <ArrowRight size={18} className="ml-2" />
            </Link>
            
            <a 
              href="#features"
              className="px-8 py-3 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 font-medium transition-colors"
            >
              Learn More
            </a>
          </div>
          
          <div className="relative mt-12 mx-auto max-w-4xl glass-panel rounded-xl shadow-card p-1.5 border animate-fade-in">
            <div className="aspect-[16/9] rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
              <div className="w-full h-full flex items-center justify-center">
                <div className="bg-white dark:bg-gray-900 w-full max-w-lg h-96 rounded-md shadow-sm p-4 mx-4">
                  <div className="flex items-center border-b pb-3">
                    <div className="w-8 h-8 rounded-full bg-brand-light-blue flex items-center justify-center text-brand-blue font-medium">A</div>
                    <div className="ml-3">
                      <div className="font-medium">Alice Johnson</div>
                      <div className="text-xs text-green-600">Online</div>
                    </div>
                  </div>
                  
                  <div className="py-4 h-72 overflow-y-auto">
                    <div className="flex justify-start mb-3">
                      <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-3 max-w-[70%]">
                        <p className="text-sm">Hey there! How's your project coming along?</p>
                        <p className="text-xs text-right text-gray-500 mt-1">9:41 AM</p>
                      </div>
                    </div>
                    
                    <div className="flex justify-end mb-3">
                      <div className="bg-brand-blue rounded-2xl p-3 max-w-[70%] text-white">
                        <p className="text-sm">Almost done! Just need to finish the documentation.</p>
                        <p className="text-xs text-right opacity-80 mt-1">9:42 AM ✓✓</p>
                      </div>
                    </div>
                    
                    <div className="flex justify-start">
                      <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-3 max-w-[70%]">
                        <p className="text-sm">Great! Looking forward to seeing it.</p>
                        <p className="text-xs text-right text-gray-500 mt-1">Just now</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t pt-3 flex">
                    <input
                      type="text"
                      placeholder="Type a message..."
                      className="flex-1 rounded-full border px-4 py-2 text-sm focus:outline-none"
                    />
                    <button className="ml-2 p-2 bg-brand-blue rounded-full text-white">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section id="features" className="py-16 md:py-24 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Us?</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Our platform offers the perfect balance of privacy, security, and user experience.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Lock className="text-brand-blue w-8 h-8" />}
              title="Privacy First"
              description="No phone numbers needed for registration. Your conversations stay private with end-to-end encryption."
            />
            
            <FeatureCard
              icon={<MessageSquare className="text-brand-blue w-8 h-8" />}
              title="Seamless Messaging"
              description="Enjoy a clean, intuitive messaging experience with support for text, voice messages, and media sharing."
            />
            
            <FeatureCard
              icon={<UserCircle className="text-brand-blue w-8 h-8" />}
              title="Customizable Profiles"
              description="Create your unique identity with customizable profiles, status updates, and settings."
            />
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 md:py-24 px-6 bg-brand-light-blue/30 dark:bg-gray-900">
        <div className="container mx-auto text-center max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
            Join thousands of users who have already made the switch to secure, phone-number-free messaging.
          </p>
          
          <Link
            to="/auth"
            className={cn(
              "inline-flex items-center px-8 py-3 rounded-lg text-white font-medium",
              "bg-brand-blue hover:bg-blue-600 shadow-lg shadow-blue-500/20",
              "transition-all duration-200 transform hover:translate-y-[-2px]"
            )}
          >
            Create Your Account
            <ArrowRight size={18} className="ml-2" />
          </Link>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-8 px-6 border-t">
        <div className="container mx-auto">
          <div className="text-center">
            <h3 className="text-xl font-bold text-brand-blue mb-2">ChatWithoutNumbers</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              © 2023 ChatWithoutNumbers. All rights reserved.
            </p>
            <div className="flex justify-center space-x-4">
              <a href="#" className="text-gray-600 hover:text-brand-blue dark:text-gray-400 dark:hover:text-brand-blue">Terms</a>
              <a href="#" className="text-gray-600 hover:text-brand-blue dark:text-gray-400 dark:hover:text-brand-blue">Privacy</a>
              <a href="#" className="text-gray-600 hover:text-brand-blue dark:text-gray-400 dark:hover:text-brand-blue">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => {
  return (
    <div className="glass-panel rounded-xl p-6 text-center hover:shadow-card transition-shadow duration-300">
      <div className="flex justify-center mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400">{description}</p>
    </div>
  );
};

export default Index;
