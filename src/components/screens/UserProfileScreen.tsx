import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  User as UserIcon,
  Settings,
  ShieldCheck,
  Crown,
  Eye,
  EyeOff,
  Bell,
  Trash2,
  LogOut,
  Edit3,
  Check,
  ChevronRight,
  Sparkles,
  MapPin,
  Briefcase,
  GraduationCap,
  Heart,
  Users,
} from 'lucide-react';
import { RelationshipGoal } from '../../types';
import { VerifiedBadge } from '../common/VerifiedBadge';
import { KarmaStatus } from '../profile/KarmaStatus';

export const UserProfileScreen: React.FC = () => {
  const {
    currentUser,
    users,
    updateProfile,
    deleteAccount,
    logout,
    switchUser,
    setIsPremiumModalOpen,
    setActiveScreen,
    showToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'profile' | 'settings'>('profile');
  const [isEditing, setIsEditing] = useState(false);

  // Edit fields
  const [editName, setEditName] = useState(currentUser?.name || '');
  const [editBio, setEditBio] = useState(currentUser?.bio || '');
  const [editOccupation, setEditOccupation] = useState(currentUser?.occupation || '');
  const [editGoal, setEditGoal] = useState<RelationshipGoal>(currentUser?.relationshipGoal || 'long-term');
  const [editHeight, setEditHeight] = useState(currentUser?.height || '');

  // Danger zone modal
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!currentUser) return null;

  const handleSaveProfile = () => {
    updateProfile({
      name: editName,
      bio: editBio,
      occupation: editOccupation,
      relationshipGoal: editGoal,
      height: editHeight,
    });
    setIsEditing(false);
  };

  const handleToggleSetting = (key: keyof typeof currentUser.settings) => {
    const updated = {
      ...currentUser.settings,
      [key]: !currentUser.settings[key],
    };
    updateProfile({ settings: updated });
    showToast('Privacy setting updated', 'info');
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] py-4 px-4 max-w-md mx-auto flex flex-col pb-12 bg-[#F8F9FA] text-[#2D3436]">
      {/* Top Profile Card Header */}
      <div className="relative mb-5 p-5 rounded-3xl bg-white border border-[#E9ECEF] shadow-[0_8px_30px_rgba(108,92,231,0.08)] overflow-hidden">
        {/* Ambient decorative soft gradient */}
        {currentUser.isPremium && (
          <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-bl from-[#FD79A8]/20 via-[#6C5CE7]/15 to-transparent rounded-full blur-2xl pointer-events-none" />
        )}

        <div className="flex items-center gap-4 relative z-10">
          {/* Avatar */}
          <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-white shadow-md ring-2 ring-[#6C5CE7]/20 shrink-0">
            <img
              src={currentUser.photos[0]}
              alt={currentUser.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            {currentUser.isVerified && (
              <div className="absolute bottom-1 right-1">
                <VerifiedBadge size="sm" userName={currentUser.name} />
              </div>
            )}
          </div>

          {/* User Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <h2 className="text-xl font-bold text-[#2D3436] truncate">{currentUser.name}</h2>
              {currentUser.isVerified && (
                <VerifiedBadge size="sm" userName={currentUser.name} />
              )}
              <span className="text-sm font-semibold text-[#636E72] tabular-nums">
                {currentUser.age}
              </span>
            </div>

            <p className="text-xs text-[#636E72] truncate mb-2">{currentUser.occupation}</p>

            <div className="flex items-center gap-2">
              {currentUser.isPremium ? (
                <span className="flex items-center gap-1 text-[11px] font-bold text-white bg-gradient-to-r from-[#6C5CE7] to-[#FD79A8] px-2.5 py-0.5 rounded-full shadow-sm">
                  <Crown className="w-3 h-3 text-amber-200" />
                  Platinum Member
                </span>
              ) : (
                <button
                  onClick={() => setIsPremiumModalOpen(true)}
                  className="flex items-center gap-1 text-[11px] font-semibold text-[#6C5CE7] bg-[#6C5CE7]/10 border border-[#6C5CE7]/30 px-2.5 py-0.5 rounded-full hover:bg-[#6C5CE7]/20 transition-colors"
                >
                  <Sparkles className="w-3 h-3 text-[#FD79A8]" />
                  Upgrade to Platinum
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Anti-Ghosting Karma Engine & Active Chat Limit Status */}
      <div className="mb-5">
        <KarmaStatus />
      </div>

      {/* Tabs */}
      <div className="flex bg-[#E9ECEF]/70 p-1 rounded-2xl mb-5">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${
            activeTab === 'profile'
              ? 'bg-[#6C5CE7] text-white shadow-sm'
              : 'text-[#636E72] hover:text-[#2D3436]'
          }`}
        >
          Profile Details
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${
            activeTab === 'settings'
              ? 'bg-[#6C5CE7] text-white shadow-sm'
              : 'text-[#636E72] hover:text-[#2D3436]'
          }`}
        >
          Privacy & Controls
        </button>
      </div>

      {/* Tab 1: Profile View / Edit */}
      {activeTab === 'profile' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-[#636E72] uppercase tracking-wider">
              {isEditing ? 'Edit Profile Information' : 'Public Profile Preview'}
            </span>
            <button
              onClick={() => {
                if (isEditing) {
                  handleSaveProfile();
                } else {
                  setIsEditing(true);
                }
              }}
              className="flex items-center gap-1 text-xs font-semibold text-[#6C5CE7] hover:underline"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isEditing ? 'Save Changes' : 'Edit Profile'}</span>
            </button>
          </div>

          {isEditing ? (
            <div className="bg-white border border-[#E9ECEF] rounded-2xl p-4 space-y-3.5 shadow-[0_8px_30px_rgba(108,92,231,0.06)]">
              <div>
                <label className="block text-xs font-medium text-[#2D3436] mb-1">Display Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-[#F8F9FA] border border-[#E9ECEF] rounded-xl px-3 py-2 text-xs text-[#2D3436] focus:outline-none focus:border-[#6C5CE7] focus:ring-1 focus:ring-[#6C5CE7]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#2D3436] mb-1">Occupation</label>
                <input
                  type="text"
                  value={editOccupation}
                  onChange={(e) => setEditOccupation(e.target.value)}
                  className="w-full bg-[#F8F9FA] border border-[#E9ECEF] rounded-xl px-3 py-2 text-xs text-[#2D3436] focus:outline-none focus:border-[#6C5CE7] focus:ring-1 focus:ring-[#6C5CE7]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#2D3436] mb-1">Relationship Goal</label>
                <select
                  value={editGoal}
                  onChange={(e) => setEditGoal(e.target.value as RelationshipGoal)}
                  className="w-full bg-[#F8F9FA] border border-[#E9ECEF] rounded-xl px-3 py-2 text-xs text-[#2D3436] focus:outline-none focus:border-[#6C5CE7]"
                >
                  <option value="long-term">Long-Term Relationship</option>
                  <option value="marriage">Marriage</option>
                  <option value="serious">Serious Dating</option>
                  <option value="casual">Casual Dating</option>
                  <option value="friends">New Friends</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#2D3436] mb-1">Height</label>
                <input
                  type="text"
                  value={editHeight}
                  onChange={(e) => setEditHeight(e.target.value)}
                  placeholder="e.g. 5'7&quot; (170cm)"
                  className="w-full bg-[#F8F9FA] border border-[#E9ECEF] rounded-xl px-3 py-2 text-xs text-[#2D3436] focus:outline-none focus:border-[#6C5CE7]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#2D3436] mb-1">About Me (Bio)</label>
                <textarea
                  rows={4}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="w-full bg-[#F8F9FA] border border-[#E9ECEF] rounded-xl px-3 py-2 text-xs text-[#2D3436] focus:outline-none focus:border-[#6C5CE7]"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 py-2 rounded-xl text-xs text-[#636E72] hover:text-[#2D3436]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveProfile}
                  className="flex-1 py-2 rounded-xl bg-[#6C5CE7] hover:bg-[#5A49DF] text-white font-bold text-xs shadow-md transition-colors"
                >
                  Save Profile
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-[#E9ECEF] rounded-2xl p-4 space-y-4 shadow-[0_8px_30px_rgba(108,92,231,0.06)]">
              <div>
                <span className="text-[10px] font-bold text-[#6C5CE7] tracking-wider uppercase block mb-1">
                  Relationship Goal
                </span>
                <p className="text-xs font-medium text-[#2D3436] capitalize">
                  {currentUser.relationshipGoal.replace('-', ' ')}
                </p>
              </div>

              <div>
                <span className="text-[10px] font-bold text-[#6C5CE7] tracking-wider uppercase block mb-1">
                  Bio
                </span>
                <p className="text-xs text-[#636E72] leading-relaxed">{currentUser.bio}</p>
              </div>

              <div>
                <span className="text-[10px] font-bold text-[#6C5CE7] tracking-wider uppercase block mb-2">
                  Passions & Interests
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {currentUser.interests.map((tag, i) => (
                    <span
                      key={i}
                      className="text-xs px-2.5 py-1 rounded-lg bg-[#FD79A8]/10 border border-[#FD79A8]/25 text-[#2D3436] font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <button
                  onClick={() => setActiveScreen('photo_upload')}
                  className="w-full py-2.5 rounded-xl bg-[#F8F9FA] hover:bg-[#E9ECEF] border border-[#E9ECEF] text-xs font-semibold text-[#2D3436] flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span>Manage Photo Gallery ({currentUser.photos.length} photos)</span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#636E72]" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Settings & Privacy */}
      {activeTab === 'settings' && (
        <div className="space-y-4">
          {/* Privacy Toggles */}
          <div className="bg-white border border-[#E9ECEF] rounded-2xl p-4 space-y-4 shadow-[0_8px_30px_rgba(108,92,231,0.06)]">
            <h4 className="text-xs font-bold text-[#636E72] uppercase tracking-wider">
              Privacy & Security Controls
            </h4>

            {/* Incognito mode */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-[#2D3436]">Incognito Mode</p>
                <p className="text-[11px] text-[#636E72]">
                  Only show my profile to people I have already liked
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleToggleSetting('incognito')}
                className={`w-11 h-6 rounded-full transition-colors relative ${
                  currentUser.settings.incognito ? 'bg-[#6C5CE7]' : 'bg-[#E9ECEF]'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform absolute top-1 ${
                    currentUser.settings.incognito ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Hide distance */}
            <div className="flex items-center justify-between border-t border-[#E9ECEF] pt-3">
              <div>
                <p className="text-xs font-semibold text-[#2D3436]">Hide Exact Distance</p>
                <p className="text-[11px] text-[#636E72]">
                  Display approximate city instead of kilometer radius
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleToggleSetting('hideDistance')}
                className={`w-11 h-6 rounded-full transition-colors relative ${
                  currentUser.settings.hideDistance ? 'bg-[#6C5CE7]' : 'bg-[#E9ECEF]'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform absolute top-1 ${
                    currentUser.settings.hideDistance ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Read Receipts */}
            <div className="flex items-center justify-between border-t border-[#E9ECEF] pt-3">
              <div>
                <p className="text-xs font-semibold text-[#2D3436]">Read Receipts</p>
                <p className="text-[11px] text-[#636E72]">
                  Allow matches to see when you have read messages
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleToggleSetting('readReceipts')}
                className={`w-11 h-6 rounded-full transition-colors relative ${
                  currentUser.settings.readReceipts ? 'bg-[#6C5CE7]' : 'bg-[#E9ECEF]'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform absolute top-1 ${
                    currentUser.settings.readReceipts ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Quick Demo Switcher */}
          <div className="bg-white border border-[#E9ECEF] rounded-2xl p-4 shadow-[0_8px_30px_rgba(108,92,231,0.06)]">
            <h4 className="text-xs font-bold text-[#636E72] uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-[#6C5CE7]" />
              Switch Test Account (Demo Sandbox)
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {users.slice(0, 4).map((u) => (
                <button
                  key={u.id}
                  onClick={() => switchUser(u.id)}
                  className={`p-2 rounded-xl border text-left text-xs transition-colors ${
                    u.id === currentUser.id
                      ? 'bg-[#6C5CE7]/10 border-[#6C5CE7] text-[#6C5CE7] font-bold'
                      : 'bg-[#F8F9FA] border-[#E9ECEF] text-[#2D3436] hover:bg-[#E9ECEF]'
                  }`}
                >
                  <div className="truncate">{u.name}</div>
                  <div className="text-[10px] text-[#636E72] font-normal">
                    {u.age} · {u.occupation.split(' ')[0]}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Account Actions */}
          <div className="bg-white border border-[#E9ECEF] rounded-2xl p-4 space-y-2 shadow-[0_8px_30px_rgba(108,92,231,0.06)]">
            <button
              onClick={logout}
              className="w-full py-2.5 px-3 rounded-xl bg-[#F8F9FA] hover:bg-[#E9ECEF] text-xs font-semibold text-[#2D3436] flex items-center justify-between transition-colors border border-[#E9ECEF]"
            >
              <div className="flex items-center gap-2">
                <LogOut className="w-4 h-4 text-[#636E72]" />
                <span>Log Out</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-[#636E72]" />
            </button>

            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full py-2.5 px-3 rounded-xl bg-red-50 hover:bg-red-100 text-xs font-semibold text-red-600 flex items-center justify-between transition-colors border border-red-200"
            >
              <div className="flex items-center gap-2">
                <Trash2 className="w-4 h-4" />
                <span>Delete Account & Erase Data</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#E9ECEF] rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#2D3436] mb-2">Delete Your Account?</h3>
            <p className="text-xs text-[#636E72] mb-6 leading-relaxed">
              This action is permanent and immediate. All your photos, mutual matches, chat histories, and profile data will be permanently purged.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2.5 text-xs text-[#636E72] hover:text-[#2D3436] rounded-xl border border-[#E9ECEF]"
              >
                Keep Account
              </button>
              <button
                onClick={deleteAccount}
                className="flex-1 py-2.5 text-xs font-bold bg-red-600 hover:bg-red-500 text-white rounded-xl shadow-md"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
