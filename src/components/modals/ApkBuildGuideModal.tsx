import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Download,
  Smartphone,
  Terminal,
  CheckCircle2,
  Copy,
  ExternalLink,
  X,
  FileCode,
  ShieldCheck,
  Globe,
  Share,
} from 'lucide-react';

export const ApkBuildGuideModal: React.FC = () => {
  const { isApkModalOpen, setIsApkModalOpen, showToast } = useApp();
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'pwa' | 'apk'>('pwa');

  if (!isApkModalOpen) return null;

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    showToast('Copied to clipboard', 'info');
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const steps = [
    {
      title: '1. Export Web Build',
      cmd: 'npm run build',
      description: 'Generates optimized production assets in /dist ready for the Android WebView wrapper.',
    },
    {
      title: '2. Initialize Capacitor Android Container',
      cmd: 'npm install @capacitor/core @capacitor/cli @capacitor/android\nnpx cap init "HeartLink" "com.heartlink.dating" --web-dir dist\nnpx cap add android',
      description: 'Wraps HeartLink inside a native Android project with hardware acceleration, camera access, and push notifications.',
    },
    {
      title: '3. Generate Production Signing Keystore',
      cmd: 'keytool -genkey -v -keystore heartlink-release.keystore -alias heartlink -keyalg RSA -keysize 2048 -validity 10000',
      description: 'Creates your secure cryptographic release key for signing the Android APK / Google Play AAB bundle.',
    },
    {
      title: '4. Build Signed Android APK via Gradle',
      cmd: 'cd android\n./gradlew assembleRelease\n# Signed APK generated at: android/app/build/outputs/apk/release/app-release.apk',
      description: 'Compiles the native Android binary with Proguard obfuscation and signed certificate.',
    },
  ];

  const handleSimulateApkDownload = () => {
    showToast('Preparing HeartLink Android package bundle...', 'info');
    setTimeout(() => {
      const content = `HeartLink Android Release Package (v1.0.0)\nPackage: com.heartlink.dating\nPlatform: Android 12+\nTheme: Fresh & Welcoming (Soft Indigo #6C5CE7 & Blush Pink #FD79A8)\nSafety: 18+ Verification & Mutual Matching\n\nTo install on your Android device:\n1. Enable 'Install from Unknown Sources' in Android Settings\n2. Open the HeartLink APK package\n3. Enjoy high-speed genuine dating connections!`;
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'HeartLink-Release-v1.0.0.apk.txt';
      a.click();
      URL.revokeObjectURL(url);
      showToast('HeartLink APK documentation downloaded!', 'success');
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white border border-[#E9ECEF] w-full max-w-xl max-h-[90vh] rounded-3xl overflow-y-auto p-6 shadow-2xl animate-in zoom-in-95 duration-200 text-[#2D3436]">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E9ECEF] mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#6C5CE7] text-white flex items-center justify-center font-bold shadow-md">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#2D3436]">How to Install HeartLink</h2>
              <p className="text-[11px] text-[#636E72]">
                Instant Mobile Install & Android APK compilation
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsApkModalOpen(false)}
            className="p-1 text-[#636E72] hover:text-[#2D3436] rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-[#E9ECEF]/70 p-1 rounded-2xl mb-5">
          <button
            onClick={() => setActiveTab('pwa')}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${
              activeTab === 'pwa'
                ? 'bg-[#6C5CE7] text-white shadow-sm'
                : 'text-[#636E72] hover:text-[#2D3436]'
            }`}
          >
            Instant Install (Phone / Browser)
          </button>
          <button
            onClick={() => setActiveTab('apk')}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${
              activeTab === 'apk'
                ? 'bg-[#6C5CE7] text-white shadow-sm'
                : 'text-[#636E72] hover:text-[#2D3436]'
            }`}
          >
            Android APK Build (.apk)
          </button>
        </div>

        {activeTab === 'pwa' ? (
          <div className="space-y-4 mb-6">
            <div className="p-4 rounded-2xl bg-[#00B894]/10 border border-[#00B894]/25 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-[#00B894] shrink-0 mt-0.5" />
              <div className="text-xs text-[#2D3436] leading-relaxed">
                <span className="font-bold text-[#00B894]">Zero Store Downloads Needed:</span> HeartLink operates as a Progressive Web App (PWA) with full offline support, push notifications, voice note recordings, and responsive touch gestures.
              </div>
            </div>

            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-[#F8F9FA] border border-[#E9ECEF]">
                <h4 className="text-xs font-bold text-[#2D3436] mb-1 flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-[#6C5CE7]" />
                  Android (Chrome / Brave / Edge)
                </h4>
                <ol className="text-xs text-[#636E72] space-y-1.5 list-decimal pl-4 mt-2">
                  <li>Open HeartLink in Chrome on your phone.</li>
                  <li>Tap the three vertical dots (⋮) in the top-right corner.</li>
                  <li>Tap <strong className="text-[#2D3436]">"Install app"</strong> or <strong className="text-[#2D3436]">"Add to Home screen"</strong>.</li>
                  <li>HeartLink will appear as a full standalone native app on your home screen and app drawer!</li>
                </ol>
              </div>

              <div className="p-4 rounded-2xl bg-[#F8F9FA] border border-[#E9ECEF]">
                <h4 className="text-xs font-bold text-[#2D3436] mb-1 flex items-center gap-1.5">
                  <Share className="w-4 h-4 text-[#FD79A8]" />
                  iOS (Safari)
                </h4>
                <ol className="text-xs text-[#636E72] space-y-1.5 list-decimal pl-4 mt-2">
                  <li>Open HeartLink in Safari on your iPhone or iPad.</li>
                  <li>Tap the <strong className="text-[#2D3436]">Share</strong> icon (square with arrow pointing up).</li>
                  <li>Scroll down and tap <strong className="text-[#2D3436]">"Add to Home Screen"</strong>.</li>
                  <li>Tap <strong className="text-[#2D3436]">"Add"</strong> in the top right. HeartLink is now installed!</li>
                </ol>
              </div>
            </div>
          </div>
        ) : (
          <div>
            {/* Overview Banner */}
            <div className="p-4 rounded-2xl bg-[#6C5CE7]/10 border border-[#6C5CE7]/20 mb-6 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-[#6C5CE7] shrink-0 mt-0.5" />
              <div className="text-xs text-[#2D3436] leading-relaxed">
                <span className="font-bold text-[#6C5CE7]">Production Android Native Build:</span> HeartLink is compatible with Capacitor Android containers with hardware acceleration, camera access, and local persistence.
              </div>
            </div>

            {/* Steps */}
            <div className="space-y-4 mb-6">
              {steps.map((step, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-[#F8F9FA] border border-[#E9ECEF] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#6C5CE7]">{step.title}</span>
                    <button
                      onClick={() => copyToClipboard(step.cmd, idx)}
                      className="flex items-center gap-1 text-[11px] font-medium text-[#636E72] hover:text-[#2D3436] bg-white border border-[#E9ECEF] hover:bg-[#E9ECEF] px-2.5 py-1 rounded-md transition-colors shadow-sm"
                    >
                      {copiedIndex === idx ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-[#00B894]" />
                          <span className="text-[#00B894]">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="font-mono text-[11px] text-[#2D3436] bg-white p-2.5 rounded-xl border border-[#E9ECEF] overflow-x-auto whitespace-pre">
                    {step.cmd}
                  </div>

                  <p className="text-[11px] text-[#636E72]">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 border-t border-[#E9ECEF]">
          <button
            onClick={handleSimulateApkDownload}
            className="w-full sm:flex-1 py-3 rounded-xl bg-[#6C5CE7] hover:bg-[#5A49DF] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-[0_8px_25px_rgba(108,92,231,0.25)] transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Download Release Bundle (.apk instructions)</span>
          </button>
          <button
            onClick={() => setIsApkModalOpen(false)}
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-[#F8F9FA] hover:bg-[#E9ECEF] text-xs font-semibold text-[#636E72] hover:text-[#2D3436] transition-colors border border-[#E9ECEF]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
