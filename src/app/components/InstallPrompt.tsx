'use client';

import { useState, useEffect } from 'react';

export default function InstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Проверить, установлено ли приложение
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const hasSeenPrompt = localStorage.getItem('install-prompt-dismissed');

    if (!isStandalone && isIOS && !hasSeenPrompt) {
      setTimeout(() => setShowPrompt(true), 3000);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem('install-prompt-dismissed', 'true');
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 z-50 shadow-lg animate-slideDown">
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <div className="font-bold text-lg mb-1">📱 Установите приложение</div>
          <div className="text-sm opacity-90">
            Для полноэкранного режима:
            <br />
            1. Нажмите <span className="font-bold">⬆️ Поделиться</span>
            <br />
            2. Выберите <span className="font-bold">&quot;На экран «Домой»&quot;</span>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="text-white/80 hover:text-white text-2xl leading-none"
        >
          ×
        </button>
      </div>
    </div>
  );
}
