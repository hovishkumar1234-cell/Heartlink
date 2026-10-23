import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShieldCheck,
  AlertTriangle,
  Lock,
  UserX,
  Camera,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  PhoneCall,
  Check,
  Sparkles,
} from 'lucide-react';

export const SafetyCenterScreen: React.FC = () => {
  const {
    currentUser,
    users,
    requestVerification,
    updateProfile,
    showToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'verify' | 'guidelines' | 'blocked'>('verify');
  const [selectedPose, setSelectedPose] = useState('Peace sign next to chin');
  const [isCapturing, setIsCapturing] = useState(false);

  if (!currentUser) return null;

  // Blocked users
  const blockedUsersList = users.filter((u) => currentUser.blockedUserIds.includes(u.id));

  const handleUnblock = (targetUserId: string) => {
    const updated = currentUser.blockedUserIds.filter((id) => id !== targetUserId);
    updateProfile({ blockedUserIds: updated });
    showToast('User unblocked', 'info');
  };

  const handleStartPoseVerification = () => {
    setIsCapturing(true);
    setTimeout(() => {
      setIsCapturing(false);
      requestVerification(selectedPose);
    }, 1800);
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] py-4 px-4 max-w-md mx-auto flex flex-col pb-12 bg-[#F8F9FA] text-[#2D3436]">
      {/* Top Banner */}
      <div className="mb-5 p-5 rounded-3xl bg-white border border-[#00B894]/30 shadow-[0_8px_30px_rgba(0,184,148,0.12)]">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-[#00B894] text-white flex items-center justify-center font-bold shadow-md">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#2D3436]">Trust & Safety Center</h2>
            <p className="text-xs font-semibold text-[#00B894]">HeartLink Community Protection</p>
          </div>
        </div>
        <p className="text-xs text-[#636E72] leading-relaxed">
          We maintain a strictly verified, 18+ adult environment. Real people, authentic intentions, and instant reporting.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex bg-[#E9ECEF]/70 p-1 rounded-2xl mb-5">
        <button
          onClick={() => setActiveTab('verify')}
          className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${
            activeTab === 'verify'
              ? 'bg-[#6C5CE7] text-white shadow-sm'
              : 'text-[#636E72] hover:text-[#2D3436]'
          }`}
        >
          Photo Verification
        </button>
        <button
          onClick={() => setActiveTab('guidelines')}
          className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${
            activeTab === 'guidelines'
              ? 'bg-[#6C5CE7] text-white shadow-sm'
              : 'text-[#636E72] hover:text-[#2D3436]'
          }`}
        >
          Safety Guidelines
        </button>
        <button
          onClick={() => setActiveTab('blocked')}
          className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${
            activeTab === 'blocked'
              ? 'bg-[#6C5CE7] text-white shadow-sm'
              : 'text-[#636E72] hover:text-[#2D3436]'
          }`}
        >
          Blocked ({currentUser.blockedUserIds.length})
        </button>
      </div>

      {/* Tab 1: Photo Verification */}
      {activeTab === 'verify' && (
        <div className="space-y-4">
          <div className="bg-white border border-[#E9ECEF] rounded-2xl p-5 shadow-[0_8px_30px_rgba(108,92,231,0.06)]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-[#636E72] uppercase tracking-wider">
                Current Verification Status
              </span>
              {currentUser.isVerified ? (
                <span className="flex items-center gap-1 text-xs font-bold text-[#00B894] bg-[#00B894]/10 px-2.5 py-1 rounded-full border border-[#00B894]/30">
                  <Check className="w-3.5 h-3.5" />
                  Selfie Verified
                </span>
              ) : currentUser.verificationStatus === 'pending' ? (
                <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-300">
                  Review in Progress
                </span>
              ) : (
                <span className="text-xs font-semibold text-[#636E72] bg-[#F8F9FA] px-2.5 py-1 rounded-full border border-[#E9ECEF]">
                  Unverified
                </span>
              )}
            </div>

            {currentUser.isVerified ? (
              <div className="p-4 rounded-xl bg-[#00B894]/10 border border-[#00B894]/20 text-xs text-[#2D3436] leading-relaxed">
                Your profile carries the official HeartLink Mint Leaf verified badge. Matches know you are authentic and genuinely who you represent yourself to be.
              </div>
            ) : (
              <div>
                <p className="text-xs text-[#636E72] mb-4 leading-relaxed">
                  Earn the mint verified badge by taking an instant selfie matching our randomized safety pose. This confirms your photos match you in real time.
                </p>

                {/* Pose Challenge Selector */}
                <div className="mb-4">
                  <label className="block text-xs font-medium text-[#2D3436] mb-2">
                    Verification Gesture Challenge
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      'Peace sign next to chin',
                      'Index finger pointing to right eyebrow',
                      'Thumbs up directly under nose',
                    ].map((pose) => (
                      <button
                        key={pose}
                        type="button"
                        onClick={() => setSelectedPose(pose)}
                        className={`p-3 rounded-xl border text-left text-xs transition-all ${
                          selectedPose === pose
                            ? 'bg-[#6C5CE7]/10 border-[#6C5CE7] text-[#6C5CE7] font-semibold'
                            : 'bg-[#F8F9FA] border-[#E9ECEF] text-[#2D3436] hover:bg-[#E9ECEF]'
                        }`}
                      >
                        {pose}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Webcam / Pose Capture simulator */}
                <div className="relative aspect-video rounded-2xl bg-[#2D3436] border border-[#E9ECEF] overflow-hidden flex flex-col items-center justify-center p-4 mb-4">
                  {isCapturing ? (
                    <div className="flex flex-col items-center gap-2 animate-pulse text-[#00B894]">
                      <Camera className="w-8 h-8" />
                      <span className="text-xs font-bold text-white">Scanning biometric pose...</span>
                    </div>
                  ) : (
                    <div className="text-center text-white">
                      <Camera className="w-8 h-8 text-white/60 mx-auto mb-2" />
                      <p className="text-xs font-medium">Position face within the camera guide</p>
                      <p className="text-[10px] text-white/50 mt-1">Make sure lighting is clear</p>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleStartPoseVerification}
                  disabled={isCapturing || currentUser.verificationStatus === 'pending'}
                  className="w-full py-3 rounded-xl bg-[#6C5CE7] hover:bg-[#5A49DF] text-white font-bold text-xs shadow-md transition-all disabled:opacity-50"
                >
                  {currentUser.verificationStatus === 'pending'
                    ? 'Submission Pending Review'
                    : isCapturing
                    ? 'Processing...'
                    : 'Capture Pose & Submit'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Safety Guidelines */}
      {activeTab === 'guidelines' && (
        <div className="space-y-3">
          <div className="p-4 rounded-2xl bg-white border border-[#E9ECEF] shadow-[0_8px_30px_rgba(108,92,231,0.06)]">
            <h4 className="text-xs font-bold text-[#2D3436] mb-2 flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-[#6C5CE7]" />
              In-Person Date Safety Checklist
            </h4>
            <ul className="text-xs text-[#636E72] space-y-2 list-disc pl-4 leading-relaxed">
              <li>Always meet in a well-lit public space (café, gallery, popular restaurant).</li>
              <li>Arrange your own transportation to and from the venue.</li>
              <li>Tell a trusted friend or family member your plans and share your live location.</li>
              <li>Keep your drinks and personal belongings in sight at all times.</li>
              <li>Never feel obligated to stay if something feels uncomfortable.</li>
            </ul>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-[#E9ECEF] shadow-[0_8px_30px_rgba(108,92,231,0.06)]">
            <h4 className="text-xs font-bold text-[#2D3436] mb-2 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Red Flags & Online Scams
            </h4>
            <p className="text-xs text-[#636E72] leading-relaxed mb-2">
              Never send money, cryptocurrency, or wire transfers to someone you met online, regardless of the emergency they claim to have.
            </p>
            <p className="text-xs text-[#636E72]">
              Be cautious of individuals who aggressively ask to move off the app immediately or refuse a quick video call.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-[#E9ECEF] shadow-[0_8px_30px_rgba(108,92,231,0.06)]">
            <h4 className="text-xs font-bold text-[#2D3436] mb-2 flex items-center gap-1.5">
              <PhoneCall className="w-4 h-4 text-[#00B894]" />
              Emergency Support Hotlines
            </h4>
            <div className="space-y-2 text-xs text-[#2D3436]">
              <div className="flex justify-between items-center py-1 border-b border-[#E9ECEF]">
                <span className="text-[#636E72]">National Sexual Assault Hotline</span>
                <span className="font-mono text-[#00B894] font-bold">1-800-656-4673</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-[#E9ECEF]">
                <span className="text-[#636E72]">Crisis Text Line</span>
                <span className="font-mono text-[#00B894] font-bold">Text HOME to 741741</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-[#636E72]">Emergency Police Services</span>
                <span className="font-mono text-red-500 font-bold">911</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Blocked Users */}
      {activeTab === 'blocked' && (
        <div className="space-y-3">
          <p className="text-xs text-[#636E72] px-1">
            Blocked users cannot view your profile, find you in discovery, or send you messages.
          </p>

          {blockedUsersList.length > 0 ? (
            <div className="space-y-2">
              {blockedUsersList.map((blockedUser) => (
                <div
                  key={blockedUser.id}
                  className="p-3.5 rounded-2xl bg-white border border-[#E9ECEF] flex items-center justify-between shadow-[0_8px_30px_rgba(108,92,231,0.06)]"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-[#E9ECEF]">
                      <img
                        src={blockedUser.photos[0]}
                        alt={blockedUser.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#2D3436]">{blockedUser.name}</p>
                      <p className="text-[10px] text-[#636E72]">{blockedUser.occupation}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleUnblock(blockedUser.id)}
                    className="px-3 py-1.5 rounded-lg bg-[#F8F9FA] hover:bg-[#E9ECEF] border border-[#E9ECEF] text-xs font-semibold text-[#2D3436] transition-colors"
                  >
                    Unblock
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-white rounded-2xl border border-[#E9ECEF] shadow-sm">
              <UserX className="w-8 h-8 text-[#636E72] mx-auto mb-2 opacity-50" />
              <p className="text-xs text-[#636E72]">No blocked users</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
