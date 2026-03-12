import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, CheckCircle, XCircle, AlertTriangle, ArrowLeft, Loader2 } from 'lucide-react';

interface ExamResult {
  domain: string;
  attemptNumber: number;
  aptitudeScore: number;
  technicalScore: number;
  totalScore: number;
  totalMarks: number;
  correctCount: number;
  wrongCount: number;
  status: string;
  violationsCount: number;
  disqualified: boolean;
  disqualifiedReason: string | null;
  submittedAt: string | null;
}

const Result = () => {
  const [result, setResult] = useState<ExamResult | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const state = location.state as { attemptId?: string } | null;
  const attemptId = state?.attemptId;

  useEffect(() => {
    if (!attemptId) {
      // Try to get from localStorage or navigate
      const savedAttemptId = localStorage.getItem('lastAttemptId');
      if (savedAttemptId) {
        fetchResult(savedAttemptId);
      } else {
        setLoading(false);
      }
    } else {
      localStorage.setItem('lastAttemptId', attemptId);
      fetchResult(attemptId);
    }
  }, [attemptId]);

  const fetchResult = async (id: string) => {
    try {
      const response = await api.getResult(id);
      if (response.attempt) {
        setResult(response.attempt);
      }
    } catch (error) {
      console.error('Error fetching result:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">No exam results found.</p>
            <Button className="mt-4" onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const attempted = result.correctCount + result.wrongCount;
  const statusConfig = {
    qualified: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-950', label: 'Qualified ✅', border: 'border-green-200' },
    not_qualified: { icon: XCircle, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-950', label: 'Not Qualified', border: 'border-orange-200' },
    disqualified: { icon: AlertTriangle, color: 'text-destructive', bg: 'bg-red-50 dark:bg-red-950', label: 'Disqualified ❌', border: 'border-red-200' },
  };
  const st = statusConfig[result.status as keyof typeof statusConfig] || statusConfig.not_qualified;
  const StatusIcon = st.icon;

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto max-w-2xl">
        <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" /> Dashboard
        </Button>

        <Card>
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <Shield className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">VproTechDigital</span>
            </div>
            <CardTitle className="text-2xl">Assessment Result</CardTitle>
            <CardDescription>
              Attempt #{result.attemptNumber} — {result.domain}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Status Banner */}
            <div className={`rounded-xl ${st.bg} ${st.border} border p-6 text-center`}>
              <StatusIcon className={`mx-auto h-12 w-12 ${st.color}`} />
              <h3 className={`mt-3 text-2xl font-bold ${st.color}`}>{st.label}</h3>
              {result.disqualifiedReason && (
                <p className="mt-2 text-sm text-muted-foreground">{result.disqualifiedReason}</p>
              )}
            </div>

            {/* Score Grid */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="rounded-lg border p-4 text-center">
                <div className="text-2xl font-bold text-primary">{result.totalScore}/{result.totalMarks}</div>
                <div className="text-xs text-muted-foreground mt-1">Total Score</div>
              </div>
              <div className="rounded-lg border p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{attempted}/{result.totalMarks}</div>
                <div className="text-xs text-muted-foreground mt-1">Attempted</div>
              </div>
              <div className="rounded-lg border p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{result.correctCount}</div>
                <div className="text-xs text-muted-foreground mt-1">Correct</div>
              </div>
              <div className="rounded-lg border p-4 text-center">
                <div className="text-2xl font-bold text-red-600">{result.wrongCount}</div>
                <div className="text-xs text-muted-foreground mt-1">Wrong</div>
              </div>
            </div>

            {/* Section Scores */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg border p-4 text-center">
                <div className="text-xl font-bold">{result.aptitudeScore}/10</div>
                <div className="text-sm text-muted-foreground">Aptitude Score</div>
              </div>
              <div className="rounded-lg border p-4 text-center">
                <div className="text-xl font-bold">{result.technicalScore}/20</div>
                <div className="text-sm text-muted-foreground">Technical Score</div>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Violations</span>
                <Badge variant={result.violationsCount > 0 ? 'destructive' : 'secondary'}>
                  {result.violationsCount}
                </Badge>
              </div>
              {result.submittedAt && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Submitted At</span>
                  <span>{new Date(result.submittedAt).toLocaleString()}</span>
                </div>
              )}
            </div>

            {/* Message */}
            <div className="rounded-lg border bg-accent/50 p-4 text-center text-sm text-muted-foreground">
              {result.status === 'qualified'
                ? '🎉 Congratulations! Our team will contact shortlisted candidates soon.'
                : result.status === 'disqualified'
                ? 'Your assessment was flagged for rule violations. Contact us if you believe this was an error.'
                : 'Thank you for participating. Keep improving your skills and try again in the next drive!'}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Result;
