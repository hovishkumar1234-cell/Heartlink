import React, { useState } from 'react';
import {
  MiniGameType,
  MiniGameData,
  TwoTruthsGameData,
  MusicBlindTestData,
  QuickTriviaData,
} from '../../types';
import {
  TWO_TRUTHS_PRESETS,
  MUSIC_SCENARIOS,
  TRIVIA_PRESETS,
} from '../../data/miniGamesData';
import { triggerHaptic } from '../../utils/haptics';
import { playMiniGameSound } from '../../utils/audio';
import {
  Gamepad2,
  Music,
  Zap,
  X,
  Sparkles,
  Shuffle,
  Volume2,
  Check,
  Flame,
  Send,
  HelpCircle,
} from 'lucide-react';

interface MiniGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  partnerName: string;
  onLaunchGame: (gameData: MiniGameData, introText: string) => void;
}

export const MiniGameModal: React.FC<MiniGameModalProps> = ({
  isOpen,
  onClose,
  partnerName,
  onLaunchGame,
}) => {
  const [selectedTab, setSelectedTab] = useState<MiniGameType>('two_truths_and_a_lie');

  // --- Two Truths State ---
  const [twoTruthsPresetIndex, setTwoTruthsPresetIndex] = useState(0);
  const currentTTPreset = TWO_TRUTHS_PRESETS[twoTruthsPresetIndex];
  const [statements, setStatements] = useState<string[]>([...currentTTPreset.statements]);
  const [lieIndex, setLieIndex] = useState<number>(currentTTPreset.lieIndex);
  const [lieExplanation, setLieExplanation] = useState<string>(currentTTPreset.lieExplanation);
  const [isCustomTT, setIsCustomTT] = useState<boolean>(false);

  // --- Music Blind-Test State ---
  const [musicScenarioIndex, setMusicScenarioIndex] = useState(0);
  const currentMusicScenario = MUSIC_SCENARIOS[musicScenarioIndex];
  const [creatorSongPickId, setCreatorSongPickId] = useState<string>(
    currentMusicScenario.songs[0].id
  );
  const [playingSongId, setPlayingSongId] = useState<string | null>(null);

  // --- Quick Trivia State ---
  const [triviaPresetIndex, setTriviaPresetIndex] = useState(0);
  const currentTriviaPreset = TRIVIA_PRESETS[triviaPresetIndex];
  const [triviaAnswers, setTriviaAnswers] = useState<Record<string, string>>({
    [currentTriviaPreset.questions[0].id]: currentTriviaPreset.questions[0].options[0],
    [currentTriviaPreset.questions[1].id]: currentTriviaPreset.questions[1].options[1],
    [currentTriviaPreset.questions[2].id]: currentTriviaPreset.questions[2].options[2],
  });

  if (!isOpen) return null;

  const handleShuffleTTPreset = () => {
    triggerHaptic('light');
    const nextIdx = (twoTruthsPresetIndex + 1) % TWO_TRUTHS_PRESETS.length;
    setTwoTruthsPresetIndex(nextIdx);
    setStatements([...TWO_TRUTHS_PRESETS[nextIdx].statements]);
    setLieIndex(TWO_TRUTHS_PRESETS[nextIdx].lieIndex);
    setLieExplanation(TWO_TRUTHS_PRESETS[nextIdx].lieExplanation);
    setIsCustomTT(false);
  };

  const handleLaunchTwoTruths = () => {
    triggerHaptic('success');
    playMiniGameSound('success');

    const gameData: TwoTruthsGameData = {
      type: 'two_truths_and_a_lie',
      theme: currentTTPreset.theme,
      statements,
      lieIndex,
      lieExplanation: lieExplanation || 'That was the secret lie! 😄',
      resolved: false,
      createdAt: new Date().toISOString(),
    };

    onLaunchGame(
      gameData,
      `🎲 I challenged you to a 2-minute round of Two Truths & a Lie! Can you spot my lie before the timer runs out?`
    );
    onClose();
  };

  const handleLaunchMusicTest = () => {
    triggerHaptic('success');
    playMiniGameSound('success');

    const gameData: MusicBlindTestData = {
      type: 'music_taste_blind_test',
      prompt: currentMusicScenario.prompt,
      songs: currentMusicScenario.songs,
      creatorPickId: creatorSongPickId,
      resolved: false,
      createdAt: new Date().toISOString(),
    };

    onLaunchGame(
      gameData,
      `🎧 Music Taste Blind-Test! Guess which track is my ultimate soundtrack for ${currentMusicScenario.prompt} 🎶`
    );
    onClose();
  };

  const handleLaunchTrivia = () => {
    triggerHaptic('success');
    playMiniGameSound('success');

    const gameData: QuickTriviaData = {
      type: 'quick_trivia',
      title: currentTriviaPreset.title,
      category: currentTriviaPreset.category,
      questions: currentTriviaPreset.questions,
      creatorAnswers: triviaAnswers,
      resolved: false,
      createdAt: new Date().toISOString(),
    };

    onLaunchGame(
      gameData,
      `⚡ 2-Minute Chemistry Quiz! Let’s see how much our first date styles align!`
    );
    onClose();
  };

  const handleAudioPreview = (songId: string) => {
    triggerHaptic('light');
    setPlayingSongId(songId);
    playMiniGameSound('music_preview');
    setTimeout(() => {
      setPlayingSongId((curr) => (curr === songId ? null : curr));
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-3 animate-in fade-in duration-200">
      <div className="bg-white border border-[#E9ECEF] w-full max-w-lg max-h-[90vh] rounded-t-3xl sm:rounded-3xl overflow-y-auto p-5 sm:p-6 shadow-2xl flex flex-col text-left text-[#2D3436]">
        {/* Grab Handle */}
        <div className="w-10 h-1 bg-[#E9ECEF] rounded-full mx-auto mb-3 sm:hidden" />

        {/* Modal Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-2xl bg-[#6C5CE7]/10 border border-[#6C5CE7]/30 flex items-center justify-center text-[#6C5CE7]">
              <Gamepad2 className="w-5 h-5 text-[#6C5CE7]" />
            </span>
            <div>
              <h3 className="text-base font-bold text-[#2D3436] flex items-center gap-1.5">
                <span>Interactive 2-Min Mini-Games</span>
                <span className="text-[10px] bg-[#FD79A8]/10 text-[#FD79A8] font-bold px-2 py-0.5 rounded-full border border-[#FD79A8]/20">
                  Icebreaker
                </span>
              </h3>
              <p className="text-xs text-[#636E72]">
                Skip awkward small talk with {partnerName}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#636E72] hover:text-[#2D3436] rounded-lg hover:bg-[#F8F9FA] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Game Mode Selector Tabs */}
        <div className="grid grid-cols-3 gap-1.5 bg-[#F8F9FA] p-1.5 rounded-2xl border border-[#E9ECEF] mb-4">
          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              setSelectedTab('two_truths_and_a_lie');
            }}
            className={`py-2 px-1 rounded-xl text-[11px] font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
              selectedTab === 'two_truths_and_a_lie'
                ? 'bg-[#6C5CE7] text-white shadow-sm'
                : 'text-[#636E72] hover:text-[#2D3436]'
            }`}
          >
            <span className="text-sm">🎲</span>
            <span className="truncate">2 Truths & Lie</span>
          </button>

          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              setSelectedTab('music_taste_blind_test');
            }}
            className={`py-2 px-1 rounded-xl text-[11px] font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
              selectedTab === 'music_taste_blind_test'
                ? 'bg-[#FD79A8] text-white shadow-sm'
                : 'text-[#636E72] hover:text-[#2D3436]'
            }`}
          >
            <span className="text-sm">🎧</span>
            <span className="truncate">Music Blind-Test</span>
          </button>

          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              setSelectedTab('quick_trivia');
            }}
            className={`py-2 px-1 rounded-xl text-[11px] font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
              selectedTab === 'quick_trivia'
                ? 'bg-[#00B894] text-white shadow-sm'
                : 'text-[#636E72] hover:text-[#2D3436]'
            }`}
          >
            <span className="text-sm">⚡</span>
            <span className="truncate">Quick Trivia</span>
          </button>
        </div>

        {/* --- TAB 1: TWO TRUTHS & A LIE --- */}
        {selectedTab === 'two_truths_and_a_lie' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-[#2D3436] flex items-center gap-1">
                  <span>Theme:</span>
                  <span className="text-[#6C5CE7]">{currentTTPreset.theme}</span>
                </span>
                <p className="text-[11px] text-[#636E72]">
                  Select which statement below is your LIE (tap the tag to set).
                </p>
              </div>

              <button
                type="button"
                onClick={handleShuffleTTPreset}
                className="inline-flex items-center gap-1.5 text-xs text-[#636E72] hover:text-[#6C5CE7] px-2.5 py-1.5 rounded-xl bg-[#F8F9FA] hover:bg-[#E9ECEF] border border-[#E9ECEF] transition-colors cursor-pointer"
                title="Shuffle preset"
              >
                <Shuffle className="w-3.5 h-3.5" />
                <span>Shuffle</span>
              </button>
            </div>

            {/* Statements List */}
            <div className="space-y-2.5">
              {statements.map((stmt, idx) => {
                const isLie = idx === lieIndex;
                return (
                  <div
                    key={idx}
                    className={`p-3 rounded-2xl border transition-all ${
                      isLie
                        ? 'bg-rose-50 border-rose-300 shadow-sm'
                        : 'bg-[#F8F9FA] border-[#E9ECEF]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-[#2D3436] flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-md bg-white border border-[#E9ECEF] text-[#2D3436] flex items-center justify-center text-[10px] shadow-xs">
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span>Statement {idx + 1}</span>
                      </span>

                      <button
                        type="button"
                        onClick={() => {
                          triggerHaptic('light');
                          setLieIndex(idx);
                        }}
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                          isLie
                            ? 'bg-rose-500 text-white border-rose-600 shadow-xs'
                            : 'bg-white border-[#E9ECEF] text-[#636E72] hover:text-[#2D3436]'
                        }`}
                      >
                        {isLie ? 'THIS IS MY LIE 🤥' : 'Set as Lie'}
                      </button>
                    </div>

                    <input
                      type="text"
                      value={stmt}
                      onChange={(e) => {
                        const next = [...statements];
                        next[idx] = e.target.value;
                        setStatements(next);
                        setIsCustomTT(true);
                      }}
                      className="w-full bg-white border border-[#E9ECEF] rounded-xl px-3 py-2 text-xs text-[#2D3436] focus:outline-none focus:border-[#6C5CE7]"
                    />
                  </div>
                );
              })}
            </div>

            {/* Lie Explanation */}
            <div>
              <label className="text-xs font-semibold text-[#2D3436] block mb-1 flex items-center gap-1">
                <span>Secret Backstory (Revealed after {partnerName} guesses):</span>
              </label>
              <input
                type="text"
                value={lieExplanation}
                onChange={(e) => setLieExplanation(e.target.value)}
                placeholder="e.g. I actually never backpacked solo; my mom drove me!"
                className="w-full bg-[#F8F9FA] border border-[#E9ECEF] rounded-xl px-3 py-2 text-xs text-[#2D3436] focus:outline-none focus:border-[#6C5CE7]"
              />
            </div>

            {/* Launch Button */}
            <button
              type="button"
              onClick={handleLaunchTwoTruths}
              className="w-full py-3.5 rounded-2xl bg-[#6C5CE7] hover:bg-[#5A49DF] text-white font-bold text-sm shadow-[0_8px_25px_rgba(108,92,231,0.25)] flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99]"
            >
              <Send className="w-4 h-4" />
              <span>Challenge {partnerName} (2-Min Game)</span>
            </button>
          </div>
        )}

        {/* --- TAB 2: MUSIC TASTE BLIND TEST --- */}
        {selectedTab === 'music_taste_blind_test' && (
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-[#2D3436]">Choose Scenario:</span>
                <div className="flex gap-1">
                  {MUSIC_SCENARIOS.map((scenario, idx) => (
                    <button
                      key={scenario.id}
                      type="button"
                      onClick={() => {
                        triggerHaptic('light');
                        setMusicScenarioIndex(idx);
                        setCreatorSongPickId(scenario.songs[0].id);
                      }}
                      className={`text-[10px] font-bold px-2 py-1 rounded-lg border transition-all cursor-pointer ${
                        musicScenarioIndex === idx
                          ? 'bg-[#FD79A8] text-white border-[#FD79A8]'
                          : 'bg-[#F8F9FA] border-[#E9ECEF] text-[#636E72] hover:text-[#2D3436]'
                      }`}
                    >
                      {scenario.prompt.split(' ')[0]} {scenario.prompt.split(' ')[1]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-[#FD79A8]/10 border border-[#FD79A8]/20">
                <span className="text-xs font-bold text-[#2D3436] block mb-0.5">
                  {currentMusicScenario.prompt}
                </span>
                <p className="text-[11px] text-[#636E72]">{currentMusicScenario.description}</p>
              </div>
            </div>

            <div>
              <span className="text-xs font-semibold text-[#2D3436] block mb-2">
                Pick your secret anthem (then {partnerName} blind-guesses):
              </span>

              <div className="space-y-2">
                {currentMusicScenario.songs.map((song) => {
                  const isSelected = song.id === creatorSongPickId;
                  const isPreviewPlaying = playingSongId === song.id;

                  return (
                    <div
                      key={song.id}
                      onClick={() => {
                        triggerHaptic('light');
                        setCreatorSongPickId(song.id);
                      }}
                      className={`p-2.5 rounded-2xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-[#FD79A8]/15 border-[#FD79A8] shadow-sm'
                          : 'bg-[#F8F9FA] border-[#E9ECEF] hover:border-[#FD79A8]/40'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#6C5CE7] to-[#FD79A8] text-white flex items-center justify-center text-sm shadow-xs shrink-0">
                          {song.vibeEmoji}
                        </span>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-[#2D3436] truncate leading-tight">
                            {song.title}
                          </p>
                          <p className="text-[10px] text-[#636E72] truncate">
                            {song.artist} · <span>{song.genre}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAudioPreview(song.id);
                          }}
                          className={`p-1.5 rounded-lg border text-[#636E72] hover:text-[#2D3436] transition-colors ${
                            isPreviewPlaying
                              ? 'bg-[#FD79A8] text-white border-[#FD79A8] animate-pulse'
                              : 'bg-white border-[#E9ECEF]'
                          }`}
                          title="Preview synth snippet"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>

                        <span
                          className={`w-5 h-5 rounded-full flex items-center justify-center border text-[10px] ${
                            isSelected
                              ? 'bg-[#FD79A8] border-[#FD79A8] text-white'
                              : 'border-[#E9ECEF] text-transparent'
                          }`}
                        >
                          <Check className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Launch Button */}
            <button
              type="button"
              onClick={handleLaunchMusicTest}
              className="w-full py-3.5 rounded-2xl bg-[#FD79A8] hover:bg-[#f6679b] text-white font-bold text-sm shadow-[0_8px_25px_rgba(253,121,168,0.3)] flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99]"
            >
              <Send className="w-4 h-4" />
              <span>Send Music Test to {partnerName}</span>
            </button>
          </div>
        )}

        {/* --- TAB 3: QUICK TRIVIA --- */}
        {selectedTab === 'quick_trivia' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-[#00B894] block">
                  {currentTriviaPreset.title}
                </span>
                <p className="text-[11px] text-[#636E72]">{currentTriviaPreset.description}</p>
              </div>

              <div className="flex gap-1">
                {TRIVIA_PRESETS.map((preset, idx) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      triggerHaptic('light');
                      setTriviaPresetIndex(idx);
                      setTriviaAnswers({
                        [preset.questions[0].id]: preset.questions[0].options[0],
                        [preset.questions[1].id]: preset.questions[1].options[1],
                        [preset.questions[2].id]: preset.questions[2].options[2],
                      });
                    }}
                    className={`text-[10px] font-bold px-2 py-1 rounded-lg border transition-all cursor-pointer ${
                      triviaPresetIndex === idx
                        ? 'bg-[#00B894] text-white border-[#00B894]'
                        : 'bg-[#F8F9FA] border-[#E9ECEF] text-[#636E72] hover:text-[#2D3436]'
                    }`}
                  >
                    Quiz {idx + 1}
                  </button>
                ))}
              </div>
            </div>

            {/* Questions with Option Selector */}
            <div className="space-y-3">
              {currentTriviaPreset.questions.map((q, qIdx) => (
                <div key={q.id} className="p-3 rounded-2xl bg-[#F8F9FA] border border-[#E9ECEF] space-y-2">
                  <span className="text-xs font-bold text-[#2D3436] flex items-center gap-1.5">
                    <span>{q.emoji}</span>
                    <span>
                      {qIdx + 1}. {q.question}
                    </span>
                  </span>

                  <div className="grid grid-cols-1 gap-1.5">
                    {q.options.map((opt, optIdx) => {
                      const isSelected = triviaAnswers[q.id] === opt;
                      return (
                        <button
                          key={optIdx}
                          type="button"
                          onClick={() => {
                            triggerHaptic('light');
                            setTriviaAnswers((prev) => ({ ...prev, [q.id]: opt }));
                          }}
                          className={`w-full text-left px-3 py-2 rounded-xl border text-xs transition-all flex items-center justify-between cursor-pointer ${
                            isSelected
                              ? 'bg-[#00B894]/15 border-[#00B894] text-[#2D3436] font-semibold'
                              : 'bg-white border-[#E9ECEF] text-[#636E72] hover:text-[#2D3436]'
                          }`}
                        >
                          <span className="truncate">{opt}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-[#00B894] shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Launch Button */}
            <button
              type="button"
              onClick={handleLaunchTrivia}
              className="w-full py-3.5 rounded-2xl bg-[#00B894] hover:bg-[#00a884] text-white font-bold text-sm shadow-[0_8px_25px_rgba(0,184,148,0.3)] flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99]"
            >
              <Send className="w-4 h-4" />
              <span>Launch 2-Min Quiz with {partnerName}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
