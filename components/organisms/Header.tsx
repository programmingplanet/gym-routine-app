'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '../atoms/Button';
import { Moon, Sun, Dumbbell, LogOut, User, Settings } from 'lucide-react';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const isDark = localStorage.getItem('darkMode') === 'true';
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', newMode.toString());
    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Dumbbell className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              GymRoutine
            </h1>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            {user && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <User className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                <span className="text-sm font-medium text-gray-900 dark:text-white hidden sm:inline">
                  {user.name}
                </span>
              </div>
            )}

            {user && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/settings')}
                className="p-2"
              >
                <Settings className="w-5 h-5" />
              </Button>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={toggleDarkMode}
              className="p-2"
            >
              {darkMode ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </Button>

            {user && (
              <Button variant="danger" size="sm" onClick={logout} className="hidden sm:flex">
                <LogOut className="w-4 h-4 mr-2" />
                Salir
              </Button>
            )}
            {user && (
              <Button variant="danger" size="sm" onClick={logout} className="sm:hidden p-2">
                <LogOut className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
