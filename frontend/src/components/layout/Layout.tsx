import React from 'react';
import { Navbar } from './Navbar';
import { SettingsBar } from '../shared/SettingsBar';
import { SfxController } from '../shared/SfxController';
import { FloatingElements } from './FloatingElements';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen min-h-[100dvh] bg-deep-blue text-white font-sans selection:bg-gold selection:text-deep-blue flex flex-col">
      <SfxController />
      <Navbar />
      
      <main className="flex-1 relative overflow-y-auto overflow-x-hidden pb-16">
        {/* Background Ambient Effects */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-gold/5 rounded-full blur-[150px] opacity-60" />
          <div className="absolute bottom-[-20%] left-[-10%] w-[800px] h-[800px] bg-royal-blue/10 rounded-full blur-[150px] opacity-60" />
          <div className="absolute top-[40%] left-[50%] -translate-x-1/2 w-[600px] h-[600px] bg-purple-900/10 rounded-full blur-[120px] opacity-40" />
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay"></div>
          <FloatingElements />
        </div>

        <div className="relative z-10 w-full max-w-[98vw] 2xl:max-w-[95vw] mx-auto px-2 sm:px-3 lg:px-4 py-4">
          {children}
        </div>
      </main>

      <SettingsBar />
    </div>
  );
};
