import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, CheckCircle, XCircle, AlertTriangle, ArrowLeft, Loader2 } from 'lucide-react';

interface ExamResult {
  domain: string;
  correct_count: number;
  wrong_count: number;
  score: number;
  total_marks: number;
  status: string;
  violations: number;
  disqualified: boolean;
  disqualified_reason: string | null;
  submitted_at: string | null;
  questions_shown: string[];
  selected_answers: Record<string, string>;
}

const Result = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const [result, setResult] = useState<ExamResult | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || authLoading) return;
    const fetchResult = async () => {
      const { data } = await supabase
        .from('exams')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      if (data) {
        setResult({
          ...data,
          questions_shown: data.questions_shown as string[],
          selected_answers: data.selected_answers as Record<string, string>,
        });
      }
      setLoading(false);
    };
    fetchResult();
  }, [user, authLoading]);

  if (authLoading || loading) {
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

  const attempted = Object.keys(result.selected_answers).length;
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
              {profile?.full_name} — {result.domain}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Status Banner */}
            <div className={`rounded-xl ${st.bg} ${st.border} border p-6 text-center`}>
              <StatusIcon className={`mx-auto h-12 w-12 ${st.color}`} />
              <h3 className={`mt-3 text-2xl font-bold ${st.color}`}>{st.label}</h3>
              {result.disqualified_reason && (
                <p className="mt-2 text-sm text-muted-foreground">{result.disqualified_reason}</p>
              )}
            </div>

            {/* Score Grid */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                { label: 'Score', value: `${result.score}/${result.total_marks}` },
                { label: 'Attempted', value: `${attempted}/${result.total_marks}` },
                { label: 'Correct', value: result.correct_count },
                { label: 'Wrong', value: result.wrong_count },
              ].map((item) => (
                <div key={item.label} className="rounded-lg border p-4 text-center">
                  <div className="text-2xl font-bold text-primary">{item.value}</div>
                  <div className="text-xs text-muted-foreground mt-1">{item.label}</div>
                </div>
              ))}
            </div>

            {/* Details */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Violations</span>
                <Badge variant={result.violations > 0 ? 'destructive' : 'secondary'}>
                  {result.violations}
                </Badge>
              </div>
              {result.submitted_at && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Submitted At</span>
                  <span>{new Date(result.submitted_at).toLocaleString()}</span>
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
