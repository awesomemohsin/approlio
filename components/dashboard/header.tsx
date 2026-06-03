'use client';

import React from 'react';
import { LogOut, Menu, Search } from 'lucide-react';

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  return (
    <header className="bg-card border-b border-border">
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 hover:bg-muted rounded-lg transition-colors"
        >
          <Menu className="w-5 h-5 text-foreground" />
        </button>

        <div className="flex-1 mx-4 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search posts, sources..."
              className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <form action="/api/auth/sign-out" method="post">
            <button className="p-2 hover:bg-muted rounded-lg transition-colors" title="Sign out">
              <LogOut className="w-5 h-5 text-foreground" />
            </button>
          </form>
        </div>
      </div>
    </header>
  );
};

export default Header;
