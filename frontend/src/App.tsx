import { useState } from 'react';
import { LoginPage } from './components/LoginPage';
import { HomePage } from './components/HomePage';
import { LessonPathPage } from './components/LessonPathPage';
import { QuestionScreen } from './components/QuestionScreen';
import { ResultOverlay } from './components/ResultOverlay';
import { ProfilePage } from './components/ProfilePage';
import { LeaderboardPage } from './components/LeaderboardPage';
import { Navigation } from './components/Navigation';

type Page = 'login' | 'home' | 'lessons' | 'question' | 'profile' | 'leaderboard';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('login');
  const [showResult, setShowResult] = useState(false);
  const [lastResult, setLastResult] = useState<{ isCorrect: boolean; xp: number } | null>(null);
  const [activeLessonId, setActiveLessonId] = useState<number | null>(null);
  const [questionSessionId, setQuestionSessionId] = useState(0);

  const handleLogin = () => {
    setCurrentPage('home');
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page as Page);
  };

  const handleStartLesson = (lessonId?: number) => {
    setActiveLessonId(lessonId ?? null);
    setQuestionSessionId((prev) => prev + 1);
    setCurrentPage('question');
  };

  const handleQuestionComplete = (correct: boolean, xp: number) => {
    setLastResult({ isCorrect: correct, xp });
    setShowResult(true);
  };

  const handleResultContinue = () => {
    setShowResult(false);
    // In a real app, this would load the next question
    // For demo, we'll just refresh the question screen
    setCurrentPage('question');
  };

  const handleRetryLesson = () => {
    setShowResult(false);
    setQuestionSessionId((prev) => prev + 1);
    setCurrentPage('question');
  };

  const handleChooseLevel = () => {
    setShowResult(false);
    setCurrentPage('lessons');
  };

  const handleQuestionNext = () => {
    // In a real app, this would load the next question
    setCurrentPage('question');
  };

  return (
    <div className="relative">
      {/* Pages */}
      {currentPage === 'login' && <LoginPage onLogin={handleLogin} />}
      {currentPage === 'home' && <HomePage onStartLesson={handleStartLesson} />}
      {currentPage === 'lessons' && <LessonPathPage onStartLesson={handleStartLesson} />}
      {currentPage === 'question' && (
        <QuestionScreen
          key={`${activeLessonId ?? 'freeplay'}-${questionSessionId}`}
          lessonId={activeLessonId ? String(activeLessonId) : undefined}
          onComplete={handleQuestionComplete}
          onNext={handleQuestionNext}
        />
      )}
      {currentPage === 'profile' && <ProfilePage />}
      {currentPage === 'leaderboard' && <LeaderboardPage />}

      {/* Navigation (hidden on login and question screens) */}
      {currentPage !== 'login' && currentPage !== 'question' && (
        <Navigation activePage={currentPage} onNavigate={handleNavigate} />
      )}

      {/* Result Overlay */}
      {showResult && lastResult && (
        <ResultOverlay
          isCorrect={lastResult.isCorrect}
          xpEarned={lastResult.xp}
          onContinue={handleResultContinue}
          onRetryLevel={handleRetryLesson}
          onChooseLevel={handleChooseLevel}
        />
      )}
    </div>
  );
}
