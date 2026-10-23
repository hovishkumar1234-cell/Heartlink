import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldCheck, HeartHandshake, Lock, ArrowRight, ChevronLeft } from 'lucide-react';

export const OnboardingScreen: React.FC = () => {
  const { setActiveScreen } = useApp();
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      icon: HeartHandshake,
      title: 'Intentional & Genuine',
      subtitle: 'Low-pressure socializing',
      description:
        'HeartLink is built for people who want real relationships. State your goals, share your core passions, and connect with people on your exact wavelength.',
    },
    {
      icon: ShieldCheck,
      title: 'Real People. Verified.',
      subtitle: 'Zero tolerance for bots & catfish',
      description:
        'Every profile undergoes multi-factor selfie verification. You always know the person behind the screen is who they claim to be.',
    },
    {
      icon: Lock,
      title: 'Safety By Design',
      subtitle: 'Messaging only after mutual match',
      description:
        'Your exact location is never exposed. Conversations only start when both people express mutual interest. Report, block, or unmatch in one tap.',
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setActiveScreen('auth');
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      setActiveScreen('splash');
    }
  };

  const StepIcon = steps[currentStep].icon;

  return (
    <div className="min-h-[85vh] flex flex-col justify-between p-6 max-w-md mx-auto bg-[#F8F9FA] text-[#2D3436]">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={handlePrev}
          className="p-2 -ml-2 text-[#636E72] hover:text-[#2D3436] rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          onClick={() => setActiveScreen('auth')}
          className="text-xs font-semibold text-[#636E72] hover:text-[#6C5CE7] transition-colors"
        >
          Skip
        </button>
      </div>

      {/* Slide Content */}
      <div className="flex flex-col items-center text-center my-auto px-2">
        <div className="w-20 h-20 rounded-3xl bg-white border border-[#E9ECEF] flex items-center justify-center text-[#6C5CE7] mb-8 shadow-[0_8px_30px_rgba(108,92,231,0.12)]">
          <StepIcon className="w-10 h-10" />
        </div>

        <span className="text-xs font-bold text-[#FD79A8] tracking-wider uppercase mb-2">
          {steps[currentStep].subtitle}
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#2D3436] mb-4">
          {steps[currentStep].title}
        </h2>
        <p className="text-[#636E72] text-sm leading-relaxed max-w-xs">
          {steps[currentStep].description}
        </p>

        {/* Step Indicator Dots */}
        <div className="flex items-center gap-2 mt-8">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === currentStep ? 'w-8 bg-[#6C5CE7] shadow-sm' : 'w-2 bg-[#E9ECEF]'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Bottom Button */}
      <div className="pt-6">
        <button
          onClick={handleNext}
          className="w-full h-12 rounded-xl bg-[#6C5CE7] hover:bg-[#5A49DF] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-[0_8px_25px_rgba(108,92,231,0.25)] active:scale-[0.98] transition-all"
        >
          <span>{currentStep === steps.length - 1 ? 'Join HeartLink' : 'Continue'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
