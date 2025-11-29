import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Trophy, Swords, List, Home } from 'lucide-react';
import { useGame } from '../../hooks/useGame';

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { playSfx } = useGame();

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/bracket', label: 'Bracket', icon: List },
    { path: '/duel', label: 'Duel Arena', icon: Swords },
    { path: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  ];

  const isActive = (path: string) => location.pathname === path;
  const handleNavSound = () => playSfx('start');

  return (
    <nav className="bg-deep-blue/90 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="text-2xl animate-bounce-slow">🎂</div>
              <div className="absolute -top-2 -right-2 bg-gold text-deep-blue text-[10px] font-bold px-1 rounded-full border border-white/20 shadow-sm">
                1/2
              </div>
            </div>
            <Link to="/" className="font-display font-bold text-lg sm:text-xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-gold via-gold-light to-gold">
              HALF BIRTHDAY BASH
            </Link>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={handleNavSound}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    isActive(item.path)
                      ? 'bg-white/10 text-gold shadow-[0_0_10px_rgba(251,191,36,0.3)]'
                      : 'text-gray-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <item.icon size={16} />
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => {
                handleNavSound();
                setIsOpen(!isOpen);
              }}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-white/10 focus:outline-none"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-deep-blue border-b border-white/10">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => {
                  handleNavSound();
                  setIsOpen(false);
                }}
                className={`flex items-center gap-3 block px-3 py-2 rounded-md text-base font-medium ${
                  isActive(item.path)
                    ? 'bg-white/10 text-gold'
                    : 'text-gray-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};
