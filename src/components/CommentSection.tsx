'use client';

import { useState, useEffect } from 'react';
import LoadingSpinner from './LoadingSpinner';

interface Comment {
  id: string;
  text: string;
  createdAt: string;
  author: {
    id: string;
    name: string | null;
    email: string;
  };
}

interface CommentSectionProps {
  entityType: 'task' | 'event';
  entityId: string;
  currentUserId?: string;
  onCommentAdded?: () => void;
}

export default function CommentSection({ 
  entityType, 
  entityId, 
  currentUserId,
  onCommentAdded 
}: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadComments();
  }, [entityType, entityId]);

  const loadComments = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/comments?entityType=${entityType}&entityId=${entityId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setComments(data);
      }
    } catch (err) {
      console.error('Ошибка загрузки комментариев', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmitting(true);
    const token = localStorage.getItem('token');
    
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          entityType,
          entityId,
          text: newComment.trim(),
        }),
      });

      if (res.ok) {
        setNewComment('');
        loadComments();
        onCommentAdded?.();
      }
    } catch (err) {
      console.error('Ошибка добавления комментария', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/comments/${commentId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        loadComments();
      }
    } catch (err) {
      console.error('Ошибка удаления комментария', err);
    }
  };

  if (loading) {
    return (
      <div className="py-8">
        <LoadingSpinner size="sm" text="Загрузка комментариев..." />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <span>💬</span>
          <span>Комментарии</span>
          {comments.length > 0 && (
            <span className="text-sm font-normal text-gray-500">({comments.length})</span>
          )}
        </h3>
      </div>

      {/* Comments List */}
      <div className="space-y-3 max-h-[300px] overflow-y-auto">
        {comments.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p className="text-sm">Пока нет комментариев</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="bg-gray-50 rounded-xl p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {(comment.author.name || comment.author.email)[0].toUpperCase()}
                    </div>
                    <span className="text-sm font-semibold text-gray-900 truncate">
                      {comment.author.name || comment.author.email.split('@')[0]}
                    </span>
                    <span className="text-xs text-gray-400 flex-shrink-0">
                      {new Date(comment.createdAt).toLocaleDateString('ru-RU', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 break-words">{comment.text}</p>
                </div>
                {comment.author.id === currentUserId && (
                  <button
                    onClick={() => handleDelete(comment.id)}
                    className="text-gray-400 hover:text-red-600 transition flex-shrink-0"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Comment Form */}
      <form onSubmit={handleSubmit} className="space-y-2">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Добавить комментарий..."
          className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition text-sm resize-none"
          rows={2}
          maxLength={1000}
          disabled={submitting}
        />
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-400">
            {newComment.length}/1000
          </span>
          <button
            type="submit"
            disabled={!newComment.trim() || submitting}
            className="px-4 py-2 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Отправка...' : 'Отправить'}
          </button>
        </div>
      </form>
    </div>
  );
}
