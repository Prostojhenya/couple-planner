interface EventCardProps {
  event: {
    id: string;
    title: string;
    description: string | null;
    startAt: Date;
    endAt: Date;
    allDay: boolean;
    location: string | null;
    participants: string;
    createdBy: {
      name: string | null;
      email: string;
    };
  };
  onClick?: () => void;
}

// Определяем тип события по ключевым словам
const getEventType = (title: string, description: string | null) => {
  const text = `${title} ${description || ''}`.toLowerCase();
  
  if (text.match(/день рожден|др|birthday/)) return { icon: '🎂', color: 'border-pink-400' };
  if (text.match(/годовщин|anniversary/)) return { icon: '💕', color: 'border-red-400' };
  if (text.match(/путешеств|поездк|отпуск|trip|travel/)) return { icon: '✈️', color: 'border-blue-400' };
  if (text.match(/свадьб|wedding/)) return { icon: '💒', color: 'border-purple-400' };
  if (text.match(/встреч|meeting|кафе|ресторан/)) return { icon: '☕', color: 'border-amber-400' };
  if (text.match(/кино|фильм|movie|cinema/)) return { icon: '🎬', color: 'border-indigo-400' };
  if (text.match(/спорт|тренировк|gym/)) return { icon: '🏃', color: 'border-green-400' };
  if (text.match(/дом|ремонт|уборк|home/)) return { icon: '🏡', color: 'border-teal-400' };
  if (text.match(/врач|доктор|doctor|hospital/)) return { icon: '🏥', color: 'border-red-400' };
  
  return { icon: '📅', color: 'border-secondary-500' };
};

export default function EventCard({ event, onClick }: EventCardProps) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      hour: event.allDay ? undefined : '2-digit',
      minute: event.allDay ? undefined : '2-digit',
    });
  };

  const formatTime = (date: Date) => {
    if (event.allDay) return 'Весь день';
    return new Date(date).toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const eventType = getEventType(event.title, event.description);

  return (
    <div 
      onClick={onClick}
      className={`bg-white rounded-2xl shadow-md p-5 hover:shadow-xl transition-all border-l-4 ${eventType.color} cursor-pointer active:scale-[0.98] animate-scaleIn`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-bold text-gray-900 text-lg mb-1">{event.title}</h3>
          {event.description && (
            <p className="text-sm text-gray-600 line-clamp-2">{event.description}</p>
          )}
        </div>
        <div className="text-3xl ml-3">{eventType.icon}</div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <div className="w-8 h-8 bg-secondary-100 rounded-lg flex items-center justify-center">
            <span className="text-base">🕐</span>
          </div>
          <div>
            <div className="font-semibold text-gray-900">
              {formatDate(event.startAt)}
            </div>
            <div className="text-xs text-gray-500">
              {formatTime(event.startAt)} - {formatTime(event.endAt)}
            </div>
          </div>
        </div>
        
        {event.location && (
          <div className="flex items-center gap-2 text-sm">
            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
              <span className="text-base">📍</span>
            </div>
            <span className="text-gray-700">{event.location}</span>
          </div>
        )}

        <div className="flex items-center gap-2 text-sm">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <span className="text-base">
              {event.participants === 'both' ? '👥' : event.participants === 'me' ? '👤' : '💑'}
            </span>
          </div>
          <span className="text-gray-700">
            {event.participants === 'both' ? 'Оба' : event.participants === 'me' ? 'Я' : 'Партнёр'}
          </span>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
        <div className="text-xs text-gray-400">
          Создал: {event.createdBy.name || event.createdBy.email.split('@')[0]}
        </div>
      </div>
    </div>
  );
}
