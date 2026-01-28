'use client';

import { Map, CheckSquare, Inbox, Calendar } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';

export function FloatingNavBar() {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { icon: Map, label: 'Map', path: '/map' },
    { icon: CheckSquare, label: 'Tasks', path: '/tasks' },
    { icon: Inbox, label: 'Inbox', path: '/inbox' },
    { icon: Calendar, label: 'Calendar', path: '/calendar' },
  ];

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-white rounded-full shadow-2xl px-6 py-3 flex gap-8">
        {navItems.map(({ icon: Icon, label, path }) => {
          const isActive = pathname === path;
          return (
            <button
              key={path}
              onClick={() => router.push(path)}
              className={`flex flex-col items-center gap-1 transition ${
                isActive ? 'text-blue-500' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Icon className="w-6 h-6" />
              <span className="text-xs font-medium">{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
