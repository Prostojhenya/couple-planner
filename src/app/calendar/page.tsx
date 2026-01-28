'use client';

import { FloatingNavBar } from '@/components/FloatingNavBar';
import { Calendar } from 'lucide-react';

export default function CalendarPage() {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Calendar className="w-8 h-8 text-gray-700" />
          <h1 className="text-3xl font-bold text-gray-900">Calendar</h1>
        </div>
        
        <div className="bg-white rounded-3xl shadow-md p-8 text-center">
          <p className="text-gray-500">Calendar view coming soon</p>
        </div>
      </div>

      <FloatingNavBar />
    </div>
  );
}
