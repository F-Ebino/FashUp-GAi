import React from 'react';
import type { View } from '../types';
import { WardrobeIcon } from './icons/WardrobeIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { AvatarIcon } from './icons/AvatarIcon';
import { MirrorIcon } from './icons/MirrorIcon';
import { Logo } from './icons/Logo';

interface HeaderProps {
  currentView: View;
  setView: (view: View) => void;
}

const NavButton: React.FC<{
  label: string;
  isActive: boolean;
  onClick: () => void;
  children: React.ReactNode;
}> = ({ label, isActive, onClick, children }) => {
  const baseClasses = "flex items-center gap-2 px-4 py-2 rounded-md font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-accent";
  const activeClasses = "bg-brand-primary text-white shadow-md";
  const inactiveClasses = "text-gray-600 hover:bg-gray-200";
  
  return (
    <button onClick={onClick} className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`} aria-current={isActive ? 'page' : undefined}>
      {children}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
};


const Header: React.FC<HeaderProps> = ({ currentView, setView }) => {
  return (
    <header className="bg-white/80 backdrop-blur-lg sticky top-0 z-10 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex justify-between items-center py-4">
          <Logo />
          <nav className="flex items-center gap-2 p-1 bg-gray-100 rounded-lg">
            <NavButton label="Closet" isActive={currentView === 'closet'} onClick={() => setView('closet')}>
              <WardrobeIcon className="w-5 h-5" />
            </NavButton>
            <NavButton label="Stylist" isActive={currentView === 'stylist'} onClick={() => setView('stylist')}>
              <SparklesIcon className="w-5 h-5" />
            </NavButton>
            <NavButton label="Mirror" isActive={currentView === 'mirror'} onClick={() => setView('mirror')}>
              <MirrorIcon className="w-5 h-5" />
            </NavButton>
            <NavButton label="My Avatar" isActive={currentView === 'avatar'} onClick={() => setView('avatar')}>
              <AvatarIcon className="w-5 h-5" />
            </NavButton>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;