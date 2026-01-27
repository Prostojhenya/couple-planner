'use client';

interface GroupClusterIconProps {
  memberCount: number;
  maxMembers: number;
  subscription?: string;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
}

export default function GroupClusterIcon({ 
  memberCount, 
  maxMembers, 
  subscription = 'free',
  size = 'md',
  showCount = true 
}: GroupClusterIconProps) {
  
  const sizeClasses = {
    sm: 'w-10 h-10 text-base',
    md: 'w-14 h-14 text-xl',
    lg: 'w-20 h-20 text-3xl'
  };

  const badgeSizeClasses = {
    sm: 'w-5 h-5 text-[10px]',
    md: 'w-7 h-7 text-xs',
    lg: 'w-10 h-10 text-sm'
  };

  // Определяем цвет и стиль в зависимости от подписки
  const getGradient = () => {
    switch (subscription) {
      case 'premium':
        return 'from-purple-500 via-purple-600 to-pink-500';
      case 'team':
        return 'from-yellow-400 via-orange-500 to-red-500';
      case 'lifetime':
        return 'from-blue-400 via-purple-500 to-pink-500';
      default:
        return 'from-gray-400 to-gray-500';
    }
  };

  // Определяем иконку в зависимости от подписки
  const getIcon = () => {
    switch (subscription) {
      case 'premium':
        return '👥✨';
      case 'team':
        return '👥🚀';
      case 'lifetime':
        return '👥⭐';
      default:
        return '👥';
    }
  };

  // Определяем цвет бейджа
  const getBadgeColor = () => {
    const percentage = (memberCount / maxMembers) * 100;
    if (percentage >= 80) return 'bg-red-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="relative inline-block">
      <div className={`${sizeClasses[size]} bg-gradient-to-br ${getGradient()} rounded-2xl flex items-center justify-center shadow-lg border-2 border-white/20`}>
        <span className="filter drop-shadow-sm">{getIcon()}</span>
      </div>
      
      {showCount && (
        <div className={`absolute -bottom-1 -right-1 ${badgeSizeClasses[size]} ${getBadgeColor()} rounded-full flex items-center justify-center text-white font-bold shadow-md border-2 border-white`}>
          {memberCount}
        </div>
      )}
    </div>
  );
}
