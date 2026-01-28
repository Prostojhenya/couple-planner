'use client';

import { X, UserPlus, Shield, Users } from 'lucide-react';

interface Member {
  id: string;
  name: string;
  role: string;
  avatar?: string;
}

interface ClusterDetailPanelProps {
  isOpen: boolean;
  onClose: () => void;
  clusterType: 'task' | 'shop' | 'event';
  members: Member[];
  onInvite: () => void;
  onRoleChange: (memberId: string, newRole: string) => void;
}

export function ClusterDetailPanel({
  isOpen,
  onClose,
  clusterType,
  members,
  onInvite,
  onRoleChange
}: ClusterDetailPanelProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50">
      <div className="w-full max-w-lg bg-white rounded-t-3xl shadow-2xl animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6 text-gray-700" />
            <h2 className="text-xl font-bold text-gray-900">Cluster Members</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Members List */}
        <div className="p-6 max-h-96 overflow-y-auto">
          {members.map(member => (
            <div
              key={member.id}
              className="flex items-center justify-between p-4 mb-3 bg-gray-50 rounded-2xl"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-lg font-bold">
                  {member.name.charAt(0)}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{member.name}</div>
                  <div className="text-sm text-gray-500">{member.role}</div>
                </div>
              </div>
              <button
                onClick={() => onRoleChange(member.id, member.role === 'admin' ? 'user' : 'admin')}
                className="p-2 hover:bg-white rounded-full transition"
              >
                <Shield className={`w-5 h-5 ${member.role === 'admin' ? 'text-blue-500' : 'text-gray-400'}`} />
              </button>
            </div>
          ))}
        </div>

        {/* Invite Button */}
        <div className="p-6 border-t">
          <button
            onClick={onInvite}
            className="w-full py-4 bg-blue-500 text-white rounded-2xl font-semibold flex items-center justify-center gap-2 hover:bg-blue-600 transition"
          >
            <UserPlus className="w-5 h-5" />
            Invite Members
          </button>
        </div>
      </div>
    </div>
  );
}
