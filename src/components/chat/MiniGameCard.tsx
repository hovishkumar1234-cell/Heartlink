import React, { useState, useEffect } from 'react';
import { Message, TwoTruthsGameData, MusicBlindTestData, QuickTriviaData } from '../../types';
import { triggerHaptic } from '../../utils/haptics';
import { playMiniGameSound } from '../../utils/audio';
import {
  Gamepad2,
  Music,
  Zap,
  CheckCircle2,
  XCircle,
  Sparkles,
  Volume2,
  Clock,
  Flame,
  Award,
  ChevronRight,
} from 'lucide-react';

interface MiniGameCardProps {
  message: Message;
  currentUserId: string;
  partnerName: string;
  onRespond: (messageId: string, response: any) => void;
  onOpenGamesModal?: () => void;
}

export const MiniGameCard: React.FC<MiniGameCardProps> = ({
  message,
  currentUserId,
  partnerName,
  onRespond,
  onOpenGamesModal,
}) => {
  const gameData = message.gameData;
  if (!gameData) return null;

  const isSender = message.senderId === currentUserId;
  const [playingSongId, setPlayingSongId] = useState<string | null>(null);
  const [localTriviaAnswers, setLocalTriviaAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState<number>(118);

  // Simulated 2-minute prompt timer countdown for active games
  useEffect(() => {
    if (gameData.resolved) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [gameData.resolved]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handlePlayPreview = (songId: string) => {
    triggerHaptic('light');
    setPlayingSongId(songId);
    playMiniGameSound('music_preview');
    setTimeout(() => {
      setPlayingSongId((curr) => (curr === songId ? null : curr));
    }, 2200);
  };

  // --- TWO TRUTHS & A LIE RENDERER ---
  if (gameData.type === 'two_truths_and_a_lie') {
    const data = gameData as TwoTruthsGameData;

    const handleGuess = (selectedIndex: number) => {
      if (data.resolved || isSender) return;
      const isCorrect = selectedIndex === data.lieIndex;
      triggerHaptic(isCorrect ? 'celebration' : 'warning');
      playMiniGameSound(isCorrect ? 'success' : 'buzzer');

      onRespond(message.id, {
        guessIndex: selectedIndex,
        isGuessedCorrectly: isCorrect,
        guesserId: currentUserId,
        resolved: true,
      });
    };

    return (
      <div className="w-full max-w-sm rounded-2xl bg-white border border-[#E9ECEF] shadow-[0_8px_30px_rgba(108,92,231,0.08)] overflow-hidden text-left my-1 text-[#2D3436]">
        {/* Card Header */}
        <div className="bg-[#F8F9FA] px-4 py-2.5 border-b border-[#E9ECEF] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-[#6C5CE7]/10 border border-[#6C5CE7]/25 flex items-center justify-center text-[#6C5CE7]">
              <Gamepad2 className="w-3.5 h-3.5" />
            </span>
            <div>
              <span className="text-[10px] font-bold text-[#6C5CE7] tracking-wider uppercase block leading-none">
                2-Min Mini-Game
              </span>
              <span className="text-xs font-bold text-[#2D3436] leading-tight">
                Two Truths & a Lie
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {!data.resolved ? (
              <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Clock className="w-3 h-3 animate-spin [animation-duration:4s]" />
                {formatTimer(timeLeft)}
              </span>
            ) : (
              <span className="text-[10px] font-semibold text-[#00B894] bg-[#00B894]/10 border border-[#00B894]/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Completed
              </span>
            )}
          </div>
        </div>

        {/* Theme Pill */}
        <div className="px-4 pt-3 pb-1 flex items-center justify-between">
          <span className="text-[11px] font-semibold text-[#2D3436]">
            {data.theme || 'Spot the Lie 🕵️'}
          </span>
          <span className="text-[10px] text-[#636E72]">
            {isSender ? `You challenged ${partnerName}` : `${partnerName} challenged you`}
          </span>
        </div>

        {/* Statements List */}
        <div className="p-3.5 space-y-2">
          {data.statements.map((statement, idx) => {
            const isLie = idx === data.lieIndex;
            const isGuessed = data.guessIndex === idx;

            let cardStyles = 'bg-[#F8F9FA] border-[#E9ECEF] hover:border-[#6C5CE7]/40 text-[#2D3436]';
            if (data.resolved) {
              if (isLie) {
                cardStyles = 'bg-red-50 border-red-300 text-red-900 shadow-xs';
              } else if (isGuessed) {
                cardStyles = 'bg-zinc-100 border-zinc-300 text-zinc-500 line-through opacity-75';
              } else {
                cardStyles = 'bg-[#00B894]/10 border-[#00B894]/30 text-[#2D3436]';
              }
            } else if (isSender && isLie) {
              cardStyles = 'bg-[#6C5CE7]/10 border-[#6C5CE7]/40 text-[#6C5CE7] font-semibold';
            }

            return (
              <button
                key={idx}
                type="button"
                disabled={data.resolved || isSender}
                onClick={() => handleGuess(idx)}
                className={`w-full p-2.5 rounded-xl border text-left text-xs transition-all relative group flex items-start gap-2.5 ${cardStyles} ${
                  !data.resolved && !isSender ? 'cursor-pointer active:scale-[0.98]' : 'cursor-default'
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-md flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5 ${
                    data.resolved && isLie
                      ? 'bg-red-500 text-white'
                      : data.resolved
                      ? 'bg-[#00B894]/20 text-[#00B894]'
                      : 'bg-white border border-[#E9ECEF] text-[#636E72] group-hover:bg-[#6C5CE7] group-hover:text-white'
                  }`}
                >
                  {String.fromCharCode(65 + idx)}
                </span>
                <span className="flex-1 leading-snug font-medium">{statement}</span>

                {/* Badge tags */}
                {data.resolved && (
                  <span className="shrink-0 pt-0.5">
                    {isLie ? (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-red-600 bg-red-100 px-1.5 py-0.5 rounded border border-red-200">
                        THE LIE 🤥
                      </span>
                    ) : isGuessed ? (
                      <span className="text-[10px] text-[#636E72]">Guessed</span>
                    ) : (
                      <span className="text-[10px] text-[#00B894] font-semibold">Truth ✓</span>
                    )}
                  </span>
                )}

                {!data.resolved && isSender && isLie && (
                  <span className="text-[9px] font-semibold text-[#6C5CE7] bg-[#6C5CE7]/15 px-1.5 py-0.5 rounded border border-[#6C5CE7]/30">
                    Your Secret Lie
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer / Resolution Reveal */}
        {data.resolved ? (
          <div className="px-4 pb-4 pt-1 border-t border-[#E9ECEF] space-y-2">
            <div
              className={`p-2.5 rounded-xl text-xs flex items-center gap-2 ${
                data.isGuessedCorrectly
                  ? 'bg-[#00B894]/10 border border-[#00B894]/30 text-[#00B894]'
                  : 'bg-amber-50 border border-amber-200 text-amber-800'
              }`}
            >
              {data.isGuessedCorrectly ? (
                <>
                  <Award className="w-4 h-4 text-[#00B894] shrink-0" />
                  <span>
                    <strong>Lie Spotted!</strong>{' '}
                    {isSender
                      ? `${partnerName} guessed correctly!`
                      : `You nailed it! Option ${String.fromCharCode(65 + data.lieIndex)} was the lie!`}
                  </span>
                </>
              ) : (
                <>
                  <Flame className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>
                    <strong>Fooled!</strong>{' '}
                    {isSender
                      ? `${partnerName} fell for the trap!`
                      : `Nice try! Option ${String.fromCharCode(65 + data.lieIndex)} was actually the lie.`}
                  </span>
                </>
              )}
            </div>

            {data.lieExplanation && (
              <div className="bg-[#F8F9FA] border border-[#E9ECEF] p-2.5 rounded-xl text-[11px] text-[#2D3436]">
                <span className="font-bold text-[#6C5CE7] block mb-0.5">The Real Story:</span>
                <p className="italic">"{data.lieExplanation}"</p>
              </div>
            )}

            <div className="pt-1 flex justify-end">
              <button
                type="button"
                onClick={onOpenGamesModal}
                className="text-[10px] font-semibold text-[#6C5CE7] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Play another mini-game</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        ) : (
          <div className="px-4 pb-3 pt-1 text-center">
            {isSender ? (
              <p className="text-[11px] text-[#636E72] italic">
                Waiting for {partnerName} to guess which statement is your lie...
              </p>
            ) : (
              <p className="text-[11px] text-[#6C5CE7] font-semibold">
                👆 Tap the statement you think is the LIE to test your radar!
              </p>
            )}
          </div>
        )}
      </div>
    );
  }

  // --- MUSIC TASTE BLIND TEST RENDERER ---
  if (gameData.type === 'music_taste_blind_test') {
    const data = gameData as MusicBlindTestData;

    const handleSongPick = (songId: string) => {
      if (data.resolved || isSender) return;
      const isMatch = songId === data.creatorPickId;
      triggerHaptic(isMatch ? 'celebration' : 'medium');
      playMiniGameSound(isMatch ? 'success' : 'pop');

      onRespond(message.id, {
        partnerGuessId: songId,
        matchPercentage: isMatch ? 100 : Math.floor(65 + Math.random() * 25),
        resolved: true,
      });
    };

    return (
      <div className="w-full max-w-sm rounded-2xl bg-white border border-[#E9ECEF] shadow-[0_8px_30px_rgba(108,92,231,0.08)] overflow-hidden text-left my-1 text-[#2D3436]">
        {/* Header */}
        <div className="bg-[#F8F9FA] px-4 py-2.5 border-b border-[#E9ECEF] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-[#FD79A8]/10 border border-[#FD79A8]/25 flex items-center justify-center text-[#FD79A8]">
              <Music className="w-3.5 h-3.5" />
            </span>
            <div>
              <span className="text-[10px] font-bold text-[#FD79A8] tracking-wider uppercase block leading-none">
                2-Min Vibe Check
              </span>
              <span className="text-xs font-bold text-[#2D3436] leading-tight">
                Music Taste Blind-Test
              </span>
            </div>
          </div>

          <span className="text-[10px] font-mono font-bold text-[#636E72] bg-white border border-[#E9ECEF] px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
            <Clock className="w-3 h-3 text-[#FD79A8]" />
            {data.resolved ? 'Completed' : formatTimer(timeLeft)}
          </span>
        </div>

        {/* Prompt Scenario */}
        <div className="p-3.5 pb-2">
          <div className="p-2.5 rounded-xl bg-[#FD79A8]/10 border border-[#FD79A8]/20 mb-3">
            <span className="text-[10px] font-bold text-[#FD79A8] uppercase tracking-wider block mb-0.5">
              Scenario Prompt:
            </span>
            <p className="text-xs font-semibold text-[#2D3436]">{data.prompt}</p>
          </div>

          <p className="text-[11px] text-[#636E72] mb-2">
            {isSender
              ? `You locked in your track. Waiting for ${partnerName}'s blind guess:`
              : `Guess which track ${partnerName} queued for this mood:`}
          </p>

          {/* Songs Grid */}
          <div className="grid grid-cols-1 gap-2">
            {data.songs.map((song) => {
              const isCreatorPick = song.id === data.creatorPickId;
              const isPartnerGuess = song.id === data.partnerGuessId;
              const isPreviewPlaying = playingSongId === song.id;

              let cardStyles = 'bg-[#F8F9FA] border-[#E9ECEF] hover:border-[#FD79A8]/50 text-[#2D3436]';
              if (data.resolved) {
                if (isCreatorPick && isPartnerGuess) {
                  cardStyles = 'bg-[#00B894]/15 border-[#00B894] text-[#2D3436] shadow-xs';
                } else if (isCreatorPick) {
                  cardStyles = 'bg-[#FD79A8]/15 border-[#FD79A8] text-[#2D3436]';
                } else if (isPartnerGuess) {
                  cardStyles = 'bg-amber-50 border-amber-300 text-amber-900';
                }
              } else if (isSender && isCreatorPick) {
                cardStyles = 'bg-[#FD79A8]/15 border-[#FD79A8] text-[#2D3436] font-semibold';
              }

              return (
                <div
                  key={song.id}
                  className={`p-2.5 rounded-xl border flex items-center justify-between gap-2.5 transition-all ${cardStyles}`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#6C5CE7] to-[#FD79A8] text-white flex items-center justify-center text-sm shadow-xs shrink-0">
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

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handlePlayPreview(song.id)}
                      className={`p-1.5 rounded-lg border text-[#636E72] hover:text-[#2D3436] transition-colors ${
                        isPreviewPlaying
                          ? 'bg-[#FD79A8] text-white border-[#FD79A8] animate-pulse'
                          : 'bg-white border-[#E9ECEF]'
                      }`}
                      title="Audio preview snippet"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>

                    {!data.resolved && !isSender && (
                      <button
                        type="button"
                        onClick={() => handleSongPick(song.id)}
                        className="px-2.5 py-1 rounded-lg bg-[#FD79A8] hover:bg-[#f6679b] text-white text-[11px] font-bold shadow-xs cursor-pointer transition-all active:scale-[0.98]"
                      >
                        Pick
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Results */}
        {data.resolved && (
          <div className="px-4 pb-4 pt-1 border-t border-[#E9ECEF] space-y-2">
            <div className="p-2.5 rounded-xl bg-[#00B894]/10 border border-[#00B894]/30 text-xs text-[#2D3436] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#00B894]" />
                <span className="font-semibold">
                  {data.partnerGuessId === data.creatorPickId
                    ? '100% Vibe Match! Exact Track Matched!'
                    : `Chemistry Match: ${data.matchPercentage}% Vibe Alignment`}
                </span>
              </div>
            </div>

            <div className="pt-1 flex justify-end">
              <button
                type="button"
                onClick={onOpenGamesModal}
                className="text-[10px] font-semibold text-[#FD79A8] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Play another blind-test</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- QUICK TRIVIA RENDERER ---
  if (gameData.type === 'quick_trivia') {
    const data = gameData as QuickTriviaData;

    const handleSelectOption = (questionId: string, option: string) => {
      if (data.resolved || isSender) return;
      triggerHaptic('light');

      const nextAnswers = {
        ...localTriviaAnswers,
        [questionId]: option,
      };
      setLocalTriviaAnswers(nextAnswers);

      // Check if all questions answered
      const allAnswered = data.questions.every((q) => !!nextAnswers[q.id]);
      if (allAnswered) {
        triggerHaptic('celebration');
        playMiniGameSound('success');

        let matchesCount = 0;
        data.questions.forEach((q) => {
          if (data.creatorAnswers[q.id] === nextAnswers[q.id]) {
            matchesCount += 1;
          }
        });

        const score = Math.round((matchesCount / data.questions.length) * 100);

        onRespond(message.id, {
          partnerAnswers: nextAnswers,
          compatibilityScore: Math.max(score, 60), // Keep dating banter positive
          resolved: true,
        });
      }
    };

    return (
      <div className="w-full max-w-sm rounded-2xl bg-white border border-[#E9ECEF] shadow-[0_8px_30px_rgba(108,92,231,0.08)] overflow-hidden text-left my-1 text-[#2D3436]">
        {/* Header */}
        <div className="bg-[#F8F9FA] px-4 py-2.5 border-b border-[#E9ECEF] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-[#00B894]/10 border border-[#00B894]/25 flex items-center justify-center text-[#00B894]">
              <Zap className="w-3.5 h-3.5" />
            </span>
            <div>
              <span className="text-[10px] font-bold text-[#00B894] tracking-wider uppercase block leading-none">
                2-Min Chemistry Quiz
              </span>
              <span className="text-xs font-bold text-[#2D3436] leading-tight">
                {data.title || 'Quick Dating Trivia'}
              </span>
            </div>
          </div>

          <span className="text-[10px] font-mono font-bold text-[#636E72] bg-white border border-[#E9ECEF] px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
            <Clock className="w-3 h-3 text-[#00B894]" />
            {data.resolved ? 'Completed' : formatTimer(timeLeft)}
          </span>
        </div>

        {/* Questions list */}
        <div className="p-3.5 space-y-3">
          {data.questions.map((q, qIndex) => {
            const creatorAns = data.creatorAnswers[q.id];
            const partnerAns = data.partnerAnswers?.[q.id] || localTriviaAnswers[q.id];
            const hasMatched = creatorAns && partnerAns && creatorAns === partnerAns;

            return (
              <div key={q.id} className="p-2.5 rounded-xl bg-[#F8F9FA] border border-[#E9ECEF] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#2D3436] flex items-center gap-1.5">
                    <span>{q.emoji || '⚡'}</span>
                    <span>{q.question}</span>
                  </span>
                  {data.resolved && (
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        hasMatched
                          ? 'bg-[#00B894]/20 text-[#00B894] border border-[#00B894]/40'
                          : 'bg-zinc-100 text-zinc-500'
                      }`}
                    >
                      {hasMatched ? 'Matched! 🎯' : 'Contrast ✨'}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-1.5">
                  {q.options.map((opt, optIndex) => {
                    const isSelectedByLocal = localTriviaAnswers[q.id] === opt;
                    const isSelectedByPartner = data.partnerAnswers?.[q.id] === opt;
                    const isSelectedByCreator = creatorAns === opt;

                    let btnStyles = 'bg-white border-[#E9ECEF] text-[#636E72] hover:bg-[#E9ECEF]';
                    if (data.resolved) {
                      if (isSelectedByCreator && isSelectedByPartner) {
                        btnStyles = 'bg-[#00B894]/20 border-[#00B894] text-[#2D3436] font-bold';
                      } else if (isSelectedByCreator) {
                        btnStyles = 'bg-[#6C5CE7]/15 border-[#6C5CE7] text-[#6C5CE7]';
                      } else if (isSelectedByPartner) {
                        btnStyles = 'bg-[#FD79A8]/15 border-[#FD79A8] text-[#FD79A8]';
                      }
                    } else if (isSelectedByLocal) {
                      btnStyles = 'bg-[#00B894]/20 border-[#00B894] text-[#2D3436] font-semibold';
                    }

                    return (
                      <button
                        key={optIndex}
                        type="button"
                        disabled={data.resolved || isSender}
                        onClick={() => handleSelectOption(q.id, opt)}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg border text-[11px] transition-all flex items-center justify-between ${btnStyles} ${
                          !data.resolved && !isSender ? 'cursor-pointer' : 'cursor-default'
                        }`}
                      >
                        <span className="truncate">{opt}</span>
                        {data.resolved && (
                          <div className="flex items-center gap-1 text-[9px]">
                            {isSelectedByCreator && (
                              <span className="px-1 py-0.2 bg-[#6C5CE7] text-white font-bold rounded text-[8px]">
                                {isSender ? 'You' : partnerName}
                              </span>
                            )}
                            {isSelectedByPartner && (
                              <span className="px-1 py-0.2 bg-[#FD79A8] text-white font-bold rounded text-[8px]">
                                {!isSender ? 'You' : partnerName}
                              </span>
                            )}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Results Bar */}
        {data.resolved ? (
          <div className="px-4 pb-4 pt-1 border-t border-[#E9ECEF] space-y-2">
            <div className="p-3 rounded-xl bg-[#00B894]/10 border border-[#00B894]/25 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#00B894]" />
                <div>
                  <span className="text-[10px] font-bold text-[#00B894] uppercase tracking-wider block leading-none">
                    Compatibility Result
                  </span>
                  <span className="text-xs font-bold text-[#2D3436]">
                    {data.compatibilityScore && data.compatibilityScore > 75
                      ? 'High Chemistry Match! 🔥'
                      : 'Great Chemistry & Fun Vibes! ✨'}
                  </span>
                </div>
              </div>
              <span className="text-xl font-black text-[#00B894] tabular-nums">
                {data.compatibilityScore || 80}%
              </span>
            </div>

            <div className="pt-1 flex justify-end">
              <button
                type="button"
                onClick={onOpenGamesModal}
                className="text-[10px] font-semibold text-[#00B894] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Play another quiz</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        ) : (
          <div className="px-4 pb-3 pt-1 text-center text-[11px] text-[#636E72] italic">
            {isSender
              ? `Waiting for ${partnerName} to answer...`
              : 'Pick your answers above to reveal your compatibility score!'}
          </div>
        )}
      </div>
    );
  }

  return null;
};
