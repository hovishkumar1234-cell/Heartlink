import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Plus, Trash2, Star, CheckCircle, ArrowRight, ShieldCheck, Sparkles, Image as ImageIcon } from 'lucide-react';
import { createSvgPortrait } from '../../data/mockData';

export const PhotoUploadScreen: React.FC = () => {
  const { currentUser, updateProfile, setActiveScreen, showToast } = useApp();

  const [photos, setPhotos] = useState<string[]>(
    currentUser?.photos || [
      createSvgPortrait('My Profile', ['#6C5CE7', '#FD79A8'], '#FD79A8', 777),
    ]
  );
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [showUrlModal, setShowUrlModal] = useState(false);

  const handleAddPresetPhoto = (gradient: [string, string], accent: string) => {
    if (photos.length >= 6) {
      showToast('Maximum 6 photos allowed', 'alert');
      return;
    }
    const newSvg = createSvgPortrait(
      currentUser?.name || 'Photo',
      gradient,
      accent,
      Math.floor(Math.random() * 800) + 100
    );
    const updated = [...photos, newSvg];
    setPhotos(updated);
    updateProfile({ photos: updated });
    showToast('Portrait added to gallery', 'success');
  };

  const handleAddCustomUrl = () => {
    if (!customUrlInput.trim()) return;
    if (photos.length >= 6) {
      showToast('Maximum 6 photos allowed', 'alert');
      return;
    }
    const updated = [...photos, customUrlInput.trim()];
    setPhotos(updated);
    updateProfile({ photos: updated });
    setCustomUrlInput('');
    setShowUrlModal(false);
    showToast('Photo added', 'success');
  };

  const handleRemovePhoto = (index: number) => {
    if (photos.length <= 1) {
      showToast('At least 1 profile photo is required', 'alert');
      return;
    }
    const updated = photos.filter((_, i) => i !== index);
    setPhotos(updated);
    updateProfile({ photos: updated });
  };

  const handleSetPrimary = (index: number) => {
    if (index === 0) return;
    const item = photos[index];
    const remaining = photos.filter((_, i) => i !== index);
    const updated = [item, ...remaining];
    setPhotos(updated);
    updateProfile({ photos: updated });
    showToast('Primary photo updated', 'success');
  };

  const handleComplete = () => {
    if (photos.length === 0) {
      showToast('Please add at least one photo', 'alert');
      return;
    }
    setActiveScreen('discover');
    showToast('Profile setup complete! Welcome to HeartLink.', 'success');
  };

  return (
    <div className="min-h-[85vh] py-6 px-4 max-w-md mx-auto flex flex-col justify-between bg-[#F8F9FA] text-[#2D3436]">
      <div>
        <div className="text-center mb-6">
          <span className="text-[11px] font-bold text-[#6C5CE7] tracking-wider uppercase">
            Step 2 of 2 · Visual Identity
          </span>
          <h1 className="text-2xl font-extrabold text-[#2D3436] mt-1">Upload Your Photos</h1>
          <p className="text-xs text-[#636E72] mt-1 max-w-xs mx-auto">
            Profiles with 3+ photos get 4x more genuine matches. Your first photo is your primary card.
          </p>
        </div>

        {/* 6 Photo Slots Grid */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[0, 1, 2, 3, 4, 5].map((index) => {
            const photoUrl = photos[index];
            const isPrimary = index === 0 && !!photoUrl;

            return (
              <div
                key={index}
                className={`relative aspect-[3/4] rounded-2xl overflow-hidden border transition-all ${
                  photoUrl
                    ? isPrimary
                      ? 'border-[#6C5CE7] shadow-[0_8px_20px_rgba(108,92,231,0.2)] ring-2 ring-[#6C5CE7]/30'
                      : 'border-[#E9ECEF] hover:border-[#6C5CE7]/50 bg-white'
                    : 'border-dashed border-[#E9ECEF] bg-white flex items-center justify-center hover:border-[#6C5CE7]'
                }`}
              >
                {photoUrl ? (
                  <>
                    <img
                      src={photoUrl}
                      alt={`Photo ${index + 1}`}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />

                    {/* Primary Badge */}
                    {isPrimary && (
                      <div className="absolute top-2 left-2 bg-[#6C5CE7] text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded shadow">
                        MAIN
                      </div>
                    )}

                    {/* Action controls */}
                    <div className="absolute bottom-1.5 right-1.5 flex items-center gap-1">
                      {!isPrimary && (
                        <button
                          onClick={() => handleSetPrimary(index)}
                          title="Make primary photo"
                          className="p-1 rounded-md bg-black/60 hover:bg-[#6C5CE7] text-white transition-colors"
                        >
                          <Star className="w-3 h-3" />
                        </button>
                      )}
                      <button
                        onClick={() => handleRemovePhoto(index)}
                        title="Delete photo"
                        className="p-1 rounded-md bg-black/60 hover:bg-red-500 text-white transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </>
                ) : (
                  <button
                    onClick={() => setShowUrlModal(true)}
                    className="w-full h-full flex flex-col items-center justify-center gap-1 text-[#636E72] hover:text-[#6C5CE7] transition-colors p-2"
                  >
                    <Plus className="w-6 h-6" />
                    <span className="text-[10px] font-medium">Add Photo</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Quick Style Generator & Presets */}
        <div className="bg-white border border-[#E9ECEF] rounded-2xl p-4 mb-4 shadow-[0_8px_30px_rgba(108,92,231,0.06)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#2D3436] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#FD79A8]" />
              Add Stylized Profile Aesthetic
            </span>
            <span className="text-[10px] text-[#636E72]">{photos.length}/6 uploaded</span>
          </div>
          <p className="text-[11px] text-[#636E72] mb-3 leading-relaxed">
            Generate complementary friendly mood portraits for your HeartLink gallery:
          </p>

          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleAddPresetPhoto(['#6C5CE7', '#a29bfe'], '#FD79A8')}
              className="py-2 px-2.5 rounded-xl bg-[#6C5CE7]/10 border border-[#6C5CE7]/30 hover:border-[#6C5CE7] text-[11px] font-semibold text-[#6C5CE7] text-center transition-all"
            >
              Soft Indigo
            </button>
            <button
              onClick={() => handleAddPresetPhoto(['#FD79A8', '#fab1a0'], '#6C5CE7')}
              className="py-2 px-2.5 rounded-xl bg-[#FD79A8]/10 border border-[#FD79A8]/30 hover:border-[#FD79A8] text-[11px] font-semibold text-[#FD79A8] text-center transition-all"
            >
              Blush Bloom
            </button>
            <button
              onClick={() => handleAddPresetPhoto(['#00B894', '#55efc4'], '#4834D4')}
              className="py-2 px-2.5 rounded-xl bg-[#00B894]/10 border border-[#00B894]/30 hover:border-[#00B894] text-[11px] font-semibold text-[#00B894] text-center transition-all"
            >
              Mint Fresh
            </button>
          </div>
        </div>

        {/* Safety Guidelines */}
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white border border-[#E9ECEF] text-[11px] text-[#636E72] shadow-sm">
          <ShieldCheck className="w-4 h-4 text-[#00B894] shrink-0 mt-0.5" />
          <span>
            HeartLink photo policy: No nudity, no sunglasses covering full face, and no photos of minors.
          </span>
        </div>
      </div>

      {/* Bottom Button */}
      <div className="pt-6">
        <button
          onClick={handleComplete}
          className="w-full h-12 rounded-xl bg-[#6C5CE7] hover:bg-[#5A49DF] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-[0_8px_25px_rgba(108,92,231,0.25)] active:scale-[0.98] transition-all"
        >
          <span>Finish & Start Discovering</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Custom URL modal */}
      {showUrlModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#E9ECEF] rounded-2xl p-5 max-w-sm w-full shadow-2xl">
            <h3 className="text-sm font-bold text-[#2D3436] mb-2">Add Image URL</h3>
            <p className="text-xs text-[#636E72] mb-3">
              Paste an image link or generate an instant avatar preset.
            </p>
            <input
              type="url"
              value={customUrlInput}
              onChange={(e) => setCustomUrlInput(e.target.value)}
              placeholder="https://example.com/photo.jpg"
              className="w-full bg-[#F8F9FA] border border-[#E9ECEF] rounded-xl px-3 py-2 text-xs text-[#2D3436] placeholder-[#636E72] focus:outline-none focus:border-[#6C5CE7] mb-4"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setShowUrlModal(false)}
                className="px-3 py-1.5 text-xs text-[#636E72] hover:text-[#2D3436]"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCustomUrl}
                className="px-4 py-1.5 text-xs font-semibold bg-[#6C5CE7] hover:bg-[#5A49DF] text-white rounded-lg shadow-sm"
              >
                Add Image
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
