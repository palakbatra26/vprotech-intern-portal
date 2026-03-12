import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import api from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Clock, ChevronLeft, ChevronRight, Flag, Send, Loader2, AlertTriangle } from 'lucide-react';

interface Question {
  _id: string;
  questionText: string;
  options: string[];
  categoryType: string;
}

const MAX_VIOLATIONS = 3;

const Exam = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  
  const state = location.state as { domain?: string; requestId?: string; attemptId?: string } | null;
  const domain = state?.domain;
  const requestId = state?.requestId;

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [markedForReview, setMarkedForReview] = useState<Set<string>>(new Set());
  const [timeLeft, setTimeLeft] = useState(30 * 60);
  const [attemptId, setAttemptId] = useState<string | null>(state?.attemptId || null);
  const [violations, setViolations] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [examLoading, setExamLoading] = useState(true);
  const [disqualified, setDisqualified] = useState(false);
  const submittedRef = useRef(false);
  const violationsRef = useRef(0);

  // Shuffle array helper
  const shuffle = <T,>(arr: T[]): T[] => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  // Initialize exam
  useEffect(() => {
    if (!user || !requestId || authLoading) return;

    const initExam = async () => {
      try {
        // Get questions from API
        const response = await api.getQuestions(requestId);
        
        if (response.questions && response.questions.length > 0) {
          const shuffled = shuffle(response.questions) as Question[];
          setQuestions(shuffled);
          setAttemptId(response.attemptId);
          setExamLoading(false);

          // Request fullscreen
          try {
            await document.documentElement.requestFullscreen();
          } catch {
            // Fullscreen may not be available
          }
        } else {
          toast.error('Failed to load questions. Please try again.');
          navigate('/dashboard');
        }
      } catch (error) {
        console.error('Error loading exam:', error);
        toast.error('Failed to load exam');
        navigate('/dashboard');
      }
    };

    initExam();
  }, [user, requestId, authLoading, navigate]);

  // Timer
  useEffect(() => {
    if (examLoading || submittedRef.current) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmit(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [examLoading]);

  // Anti-cheat listeners
  useEffect(() => {
    if (examLoading || submittedRef.current || !attemptId) return;

    const logViolation = async (type: string, details: string) => {
      violationsRef.current += 1;
      setViolations(violationsRef.current);

      try {
        const response = await api.logViolation(attemptId, type, details);
        
        if (response.disqualified) {
          setDisqualified(true);
          handleSubmit(false, true);
        } else {
          toast.warning(`⚠️ Warning ${violationsRef.current}/${MAX_VIOLATIONS}: ${details}. Further violations will disqualify you.`);
        }
      } catch (error) {
        console.error('Error logging violation:', error);
      }
    };

    const handleVisibility = () => {
      if (document.hidden) logViolation('tab_switch', 'Tab switch or window minimized');
    };
    const handleBlur = () => logViolation('window_blur', 'Window lost focus');
    const handleFullscreen = () => {
      if (!document.fullscreenElement) logViolation('fullscreen_exit', 'Exited fullscreen mode');
    };
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('fullscreenchange', handleFullscreen);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('fullscreenchange', handleFullscreen);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [examLoading, attemptId]);

  const handleSubmit = useCallback(async (autoSubmit = false, isDQ = false) => {
    if (submittedRef.current || !attemptId) return;
    submittedRef.current = true;
    setSubmitting(true);

    // Exit fullscreen
    if (document.fullscreenElement) {
      try { await document.exitFullscreen(); } catch {}
    }

    try {
      const response = await api.submitExam(attemptId);
      
      if (response.result) {
        toast.success(autoSubmit ? 'Time is up! Exam auto-submitted.' : 'Exam submitted successfully!');
        navigate('/result', { replace: true, state: { attemptId: response.result.attemptId } });
      } else {
        toast.error(response.message || 'Failed to submit exam');
        setSubmitting(false);
        submittedRef.current = false;
      }
    } catch (error) {
      console.error('Error submitting exam:', error);
      toast.error('Failed to submit exam');
      setSubmitting(false);
      submittedRef.current = false;
    }
  }, [attemptId, navigate]);

  // Save answers periodically
  useEffect(() => {
    if (!attemptId || examLoading) return;
    const interval = setInterval(async () => {
      for (const [questionId, answer] of Object.entries(answers)) {
        await api.saveAnswer(attemptId, questionId, answer);
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [attemptId, answers, examLoading]);

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !domain) return <Navigate to="/dashboard" replace />;

  if (examLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-lg font-medium">Loading your exam...</p>
      </div>
    );
  }

  const currentQ = questions[currentIdx];
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress = ((Object.keys(answers).length) / questions.length) * 100;
  const isUrgent = timeLeft < 300;

  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
      <div className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur-xl">
        <div className="container mx-auto flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="font-bold text-lg">VproTechDigital</span>
            <Badge variant="secondary">{domain}</Badge>
          </div>

          <div className="flex items-center gap-4">
            {violations > 0 && (
              <Badge variant="destructive" className="gap-1">
                <AlertTriangle className="h-3 w-3" /> {violations}/{MAX_VIOLATIONS}
              </Badge>
            )}
            <div className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 font-mono text-lg font-bold ${isUrgent ? 'border-destructive text-destructive animate-pulse' : ''}`}>
              <Clock className="h-4 w-4" />
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </div>
          </div>
        </div>
        <Progress value={progress} className="h-1 rounded-none" />
      </div>

      <div className="container mx-auto max-w-3xl px-4 py-8">
        {/* Question */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-muted-foreground">
                Question {currentIdx + 1} of {questions.length}
                <Badge variant="outline" className="ml-2">{currentQ.categoryType}</Badge>
              </span>
              <Button
                variant={markedForReview.has(currentQ._id) ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setMarkedForReview((prev) => {
                    const next = new Set(prev);
                    if (next.has(currentQ._id)) next.delete(currentQ._id);
                    else next.add(currentQ._id);
                    return next;
                  });
                }}
              >
                <Flag className="h-3 w-3 mr-1" />
                {markedForReview.has(currentQ._id) ? 'Marked' : 'Mark for Review'}
              </Button>
            </div>

            <h2 className="text-xl font-semibold mb-6">{currentQ.questionText}</h2>

            <div className="space-y-3">
              {currentQ.options.map((option, i) => (
                <button
                  key={i}
                  className={`w-full text-left rounded-lg border p-4 transition-all hover:border-primary/50 hover:bg-accent ${
                    answers[currentQ._id] === option
                      ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                      : ''
                  }`}
                  onClick={() => {
                    setAnswers((prev) => ({ ...prev, [currentQ._id]: option }));
                    // Save answer immediately
                    if (attemptId) {
                      api.saveAnswer(attemptId, currentQ._id, option);
                    }
                  }}
                >
                  <span className="mr-3 inline-flex h-7 w-7 items-center justify-center rounded-full border text-sm font-medium">
                    {String.fromCharCode(65 + i)}
                  </span>
                  {option}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="mt-6 flex items-center justify-between">
          <Button
            variant="outline"
            disabled={currentIdx === 0}
            onClick={() => setCurrentIdx((prev) => prev - 1)}
          >
            <ChevronLeft className="h-4 w-4 mr-1" /> Previous
          </Button>

          <div className="flex gap-2">
            {currentIdx < questions.length - 1 ? (
              <Button onClick={() => setCurrentIdx((prev) => prev + 1)}>
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button
                onClick={() => handleSubmit()}
                disabled={submitting}
                className="bg-green-600 hover:bg-green-700"
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Send className="h-4 w-4 mr-1" />}
                Submit Exam
              </Button>
            )}
          </div>
        </div>

        {/* Question Navigator */}
        <div className="mt-8">
          <h4 className="text-sm font-medium text-muted-foreground mb-3">Question Navigator</h4>
          <div className="flex flex-wrap gap-2">
            {questions.map((q, i) => (
              <button
                key={q._id}
                className={`flex h-9 w-9 items-center justify-center rounded-lg border text-sm font-medium transition-all ${
                  i === currentIdx
                    ? 'border-primary bg-primary text-primary-foreground'
                    : answers[q._id]
                    ? 'border-primary/30 bg-primary/10 text-primary'
                    : markedForReview.has(q._id)
                    ? 'border-yellow-500 bg-yellow-100 text-yellow-700'
                    : 'hover:border-primary/30'
                }`}
                onClick={() => setCurrentIdx(i)}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <div className="mt-3 flex gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-primary" /> Answered</span>
            <span className="flex items-center gap-1"><span className="h-3 w-3 rounded border" /> Unanswered</span>
            <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-yellow-200" /> Review</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Exam;
