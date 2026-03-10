import { useState } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Shield, AlertTriangle, Clock, Monitor, Loader2 } from 'lucide-react';

const rules = [
  'Total Questions: 30 MCQs from your selected domain',
  'Duration: 30 minutes — timer starts immediately',
  'One attempt only — you cannot retake the exam',
  'Full-screen mode is mandatory throughout the exam',
  'No tab switching, minimizing, or leaving the exam page',
  'No refreshing or using the back button during the exam',
  'First violation triggers a warning; repeated violations lead to disqualification',
  'Exam auto-submits when the timer ends',
  'Your answers are saved periodically for recovery',
  'Disqualified candidates cannot reattempt the exam',
];

const ExamInstructions = () => {
  const [accepted, setAccepted] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, loading } = useAuth();

  const domain = (location.state as { domain?: string })?.domain;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!domain) return <Navigate to="/dashboard" replace />;
  if (profile?.has_attempted) return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Shield className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">VproTechDigital</span>
          </div>
          <CardTitle className="text-2xl">Exam Instructions</CardTitle>
          <CardDescription>Domain: <span className="font-semibold text-primary">{domain}</span></CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="flex items-center gap-2 rounded-lg border p-3">
              <Clock className="h-5 w-5 text-primary" />
              <div>
                <div className="text-sm font-medium">30 Minutes</div>
                <div className="text-xs text-muted-foreground">Duration</div>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-lg border p-3">
              <Monitor className="h-5 w-5 text-primary" />
              <div>
                <div className="text-sm font-medium">Fullscreen</div>
                <div className="text-xs text-muted-foreground">Required</div>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-lg border p-3">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <div>
                <div className="text-sm font-medium">Anti-Cheat</div>
                <div className="text-xs text-muted-foreground">Monitored</div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Rules & Guidelines</h3>
            <ul className="space-y-2">
              {rules.map((rule, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {i + 1}
                  </span>
                  {rule}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex items-start space-x-3 rounded-md border border-destructive/20 bg-destructive/5 p-4">
            <Checkbox checked={accepted} onCheckedChange={(v) => setAccepted(!!v)} />
            <div className="text-sm">
              <span className="font-medium">I have read and agree to all the rules above.</span>
              <p className="text-muted-foreground mt-1">I understand that violating any rule may result in disqualification.</p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => navigate('/dashboard')}>
              Go Back
            </Button>
            <Button
              className="flex-1"
              disabled={!accepted}
              onClick={() => navigate('/exam', { state: { domain } })}
            >
              Start Exam →
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExamInstructions;
