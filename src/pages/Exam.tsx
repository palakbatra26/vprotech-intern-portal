import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, Navigate, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { EXAM_DURATION_MINUTES, TOTAL_QUESTIONS, MAX_VIOLATIONS } from '@/lib/constants';
import { Clock, ChevronLeft, ChevronRight, Flag, Send, Loader2, AlertTriangle } from 'lucide-react';

interface Question {
  id: string;
  question_text: string;
  options: string[];
  correct_answer: string;
}

const Exam = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, loading: authLoading, refetchProfile } = useAuth();
  const domain = (location.state as { domain?: string })?.domain;

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [markedForReview, setMarkedForReview] = useState<Set<string>>(new Set());
  const [timeLeft, setTimeLeft] = useState(EXAM_DURATION_MINUTES * 60);
  const [examId, setExamId] = useState<string | null>(null);
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
    if (!user || !domain || authLoading) return;

    const initExam = async () => {
      // Fetch random questions
      const { data: qs, error } = await supabase
        .from('questions')
        .select('id, question_text, options, correct_answer')
        .eq('domain', domain)
        .limit(TOTAL_QUESTIONS);

      if (error || !qs || qs.length === 0) {
        toast.error('Failed to load questions. Please try again.');
        navigate('/dashboard');
        return;
      }

      // Shuffle questions and options
      const shuffled = shuffle(qs).map((q) => ({
        ...q,
        options: shuffle(q.options as string[]),
      })) as Question[];

      setQuestions(shuffled);

      // Create exam record
      const { data: exam, error: examError } = await supabase
        .from('exams')
        .insert({
          user_id: user.id,
          domain,
          questions_shown: shuffled.map((q) => q.id),
          status: 'in_progress',
        })
        .select('id')
        .single();

      if (examError) {
        toast.error('Failed to start exam');
        navigate('/dashboard');
        return;
      }

      // Mark profile as attempted
      await supabase
        .from('profiles')
        .update({ has_attempted: true, selected_domain: domain })
        .eq('user_id', user.id);

      setExamId(exam.id);
      setExamLoading(false);

      // Request fullscreen
      try {
        await document.documentElement.requestFullscreen();
      } catch {
        // Fullscreen may not be available
      }
    };

    initExam();
  }, [user, domain, authLoading, navigate]);

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
    if (examLoading || submittedRef.current) return;

    const logViolation = async (type: string, details: string) => {
      violationsRef.current += 1;
      setViolations(violationsRef.current);

      if (examId && user) {
        await supabase.from('violation_logs').insert({
          exam_id: examId,
          user_id: user.id,
          violation_type: type,
          details,
        });
        await supabase.from('exams').update({ violations: violationsRef.current }).eq('id', examId);
      }

      if (violationsRef.current >= MAX_VIOLATIONS) {
        setDisqualified(true);
        handleSubmit(false, true);
      } else {
        toast.warning(`⚠️ Warning ${violationsRef.current}/${MAX_VIOLATIONS}: ${details}. Further violations will disqualify you.`);
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
  }, [examLoading, examId, user]);

  const handleSubmit = useCallback(async (autoSubmit = false, isDQ = false) => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    setSubmitting(true);

    // Exit fullscreen
    if (document.fullscreenElement) {
      try { await document.exitFullscreen(); } catch {}
    }

    // Calculate score
    let correctCount = 0;
    let wrongCount = 0;
    questions.forEach((q) => {
      const selected = answers[q.id];
      if (selected) {
        if (selected === q.correct_answer) correctCount++;
        else wrongCount++;
      }
    });

    const score = correctCount;
    const finalDisqualified = isDQ || disqualified;

    // Determine status based on cutoff
    let status = 'not_qualified';
    if (finalDisqualified) {
      status = 'disqualified';
    } else {
      const { data: cutoff } = await supabase
        .from('domain_cutoffs')
        .select('cutoff_marks')
        .eq('domain', domain!)
        .single();
      if (cutoff && score >= cutoff.cutoff_marks) {
        status = 'qualified';
      }
    }

    // Update exam record
    if (examId) {
      await supabase.from('exams').update({
        selected_answers: answers,
        correct_count: correctCount,
        wrong_count: wrongCount,
        score,
        status,
        submitted_at: new Date().toISOString(),
        disqualified: finalDisqualified,
        disqualified_reason: finalDisqualified
          ? `Exceeded ${MAX_VIOLATIONS} violations`
          : null,
      }).eq('id', examId);
    }

    if (refetchProfile) refetchProfile();
    toast.success(autoSubmit ? 'Time is up! Exam auto-submitted.' : 'Exam submitted successfully!');
    navigate('/result', { replace: true });
  }, [answers, questions, examId, domain, disqualified, navigate, refetchProfile]);

  // Save answers periodically
  useEffect(() => {
    if (!examId || examLoading) return;
    const interval = setInterval(async () => {
      await supabase.from('exams').update({ selected_answers: answers }).eq('id', examId);
    }, 30000);
    return () => clearInterval(interval);
  }, [examId, answers, examLoading]);

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!domain || profile?.has_attempted && !examId) return <Navigate to="/dashboard" replace />;

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
              </span>
              <Button
                variant={markedForReview.has(currentQ.id) ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setMarkedForReview((prev) => {
                    const next = new Set(prev);
                    if (next.has(currentQ.id)) next.delete(currentQ.id);
                    else next.add(currentQ.id);
                    return next;
                  });
                }}
              >
                <Flag className="h-3 w-3 mr-1" />
                {markedForReview.has(currentQ.id) ? 'Marked' : 'Mark for Review'}
              </Button>
            </div>

            <h2 className="text-xl font-semibold mb-6">{currentQ.question_text}</h2>

            <div className="space-y-3">
              {currentQ.options.map((option, i) => (
                <button
                  key={i}
                  className={`w-full text-left rounded-lg border p-4 transition-all hover:border-primary/50 hover:bg-accent ${
                    answers[currentQ.id] === option
                      ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                      : ''
                  }`}
                  onClick={() => setAnswers((prev) => ({ ...prev, [currentQ.id]: option }))}
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
                key={q.id}
                className={`flex h-9 w-9 items-center justify-center rounded-lg border text-sm font-medium transition-all ${
                  i === currentIdx
                    ? 'border-primary bg-primary text-primary-foreground'
                    : answers[q.id]
                    ? 'border-primary/30 bg-primary/10 text-primary'
                    : markedForReview.has(q.id)
                    ? 'border-warning bg-warning/10 text-warning'
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
            <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-warning/30" /> Review</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Exam;
