import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import api from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DOMAINS, DOMAIN_ICONS, DOMAIN_COLORS } from '@/lib/constants';
import { Shield, LogOut, User, Loader2, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const Dashboard = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const selectedDomain = (location.state as { domain?: string })?.domain;

  const [examStatus, setExamStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [requestingExam, setRequestingExam] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      fetchExamStatus();
    }
  }, [user, authLoading]);

  // Auto-refresh exam status every 5 seconds when waiting for exam
  useEffect(() => {
    const waiting = examStatus?.waitingTimeLeft;
    if (waiting && waiting > 0) {
      const interval = setInterval(() => {
        fetchExamStatus();
      }, 5000); // Refresh every 5 seconds
      return () => clearInterval(interval);
    }
  }, [examStatus]);

  const fetchExamStatus = async () => {
    try {
      const response = await api.getExamStatus();
      setExamStatus(response);
    } catch (error) {
      console.error('Error fetching exam status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestExam = async (domain: string) => {
    setRequestingExam(true);
    try {
      const response = await api.requestExam(domain);
      if (response.request) {
        // Refresh status
        await fetchExamStatus();
      }
    } catch (error) {
      console.error('Error requesting exam:', error);
    } finally {
      setRequestingExam(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  const latestAttempt = examStatus?.latestAttempt;
  const latestRequest = examStatus?.latestRequest;
  const canStartExam = examStatus?.canStartExam;
  const waitingTimeLeft = examStatus?.waitingTimeLeft;

  const getStatusBadge = () => {
    if (!latestRequest) {
      return <Badge className="text-sm bg-primary">Ready to Start</Badge>;
    }
    
    if (latestRequest.requestStatus === 'pending') {
      return <Badge variant="secondary" className="text-sm">Pending Approval</Badge>;
    }
    
    if (latestRequest.requestStatus === 'rejected') {
      return <Badge variant="destructive" className="text-sm">Rejected</Badge>;
    }
    
    if (latestRequest.requestStatus === 'approved') {
      if (waitingTimeLeft && waitingTimeLeft > 0) {
        const minutes = Math.floor(waitingTimeLeft / 60);
        const seconds = waitingTimeLeft % 60;
        return (
          <Badge variant="outline" className="text-sm">
            <Clock className="h-3 w-3 mr-1" />
            Available in {minutes}:{String(seconds).padStart(2, '0')}
          </Badge>
        );
      }
      if (latestAttempt?.status === 'in_progress') {
        return <Badge className="text-sm bg-green-600">Exam In Progress</Badge>;
      }
      if (latestAttempt?.status === 'completed') {
        return <Badge variant="secondary" className="text-sm">Attempt Completed</Badge>;
      }
      return <Badge className="text-sm bg-green-600">Ready to Start</Badge>;
    }
    
    return <Badge className="text-sm bg-primary">Ready</Badge>;
  };

  const getStatusMessage = () => {
    if (!latestRequest) {
      return 'Select a domain to request exam access';
    }
    
    if (latestRequest.requestStatus === 'pending') {
      return 'Your request is pending admin approval. Please wait.';
    }
    
    if (latestRequest.requestStatus === 'rejected') {
      return `Your request was rejected. Reason: ${latestRequest.rejectionReason || 'Not specified'}`;
    }
    
    if (latestRequest.requestStatus === 'approved') {
      if (waitingTimeLeft && waitingTimeLeft > 0) {
        return `Exam will be available in ${Math.floor(waitingTimeLeft / 60)} minutes ${waitingTimeLeft % 60} seconds`;
      }
      if (latestAttempt?.status === 'completed') {
        return 'You have completed your assessment';
      }
      return 'You can now start your exam!';
    }
    
    return '';
  };

  const handleStartExam = () => {
    if (latestRequest && canStartExam) {
      navigate('/exam/instructions', { state: { domain: latestRequest.requestedDomain, requestId: latestRequest._id } });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Shield className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">VproTechDigital</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate('/profile')}>
              <User className="h-4 w-4 mr-1" /> Profile
            </Button>
            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut className="h-4 w-4 mr-1" /> Logout
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Card */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">Welcome, {user.fullName}! 👋</CardTitle>
                <CardDescription className="mt-1">
                  Application ID: <span className="font-mono font-semibold text-primary">{user.applicationId}</span>
                </CardDescription>
              </div>
              {getStatusBadge()}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-3">
              <div>📧 {user.email}</div>
              <div>🏫 {user.collegeName}</div>
              <div>📚 {user.course} — {user.semester}</div>
            </div>
            
            {/* Status Message */}
            <div className="mt-4 p-3 rounded-lg bg-muted">
              <p className="text-sm">{getStatusMessage()}</p>
            </div>
            
            {/* Action Buttons */}
            {latestRequest?.requestStatus === 'approved' && latestAttempt?.status !== 'completed' && (
              <div className="mt-4">
                {waitingTimeLeft && waitingTimeLeft > 0 ? (
                  <Button disabled>
                    <Clock className="h-4 w-4 mr-2" />
                    Wait for exam activation
                  </Button>
                ) : canStartExam ? (
                  <Button onClick={handleStartExam} className="bg-green-600 hover:bg-green-700">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Start Exam
                  </Button>
                ) : latestAttempt?.status === 'in_progress' ? (
                  <Button onClick={() => navigate('/exam/instructions', { state: { domain: latestRequest.requestedDomain, requestId: latestRequest._id } })}>
                    Continue Exam
                  </Button>
                ) : (
                  <Button disabled>
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Contact Admin
                  </Button>
                )}
              </div>
            )}
            
            {latestAttempt?.status === 'completed' && (
              <div className="mt-4">
                <Button onClick={() => navigate('/result', { state: { attemptId: latestAttempt._id } })}>
                  View Results
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Exam History */}
        {examStatus?.allAttempts && examStatus.allAttempts.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Attempt History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {examStatus.allAttempts.map((attempt: any, index: number) => (
                  <div key={attempt._id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <p className="font-medium">Attempt #{attempt.attemptNumber}</p>
                      <p className="text-sm text-muted-foreground">{attempt.domain}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{attempt.totalScore}/{attempt.totalMarks}</p>
                      <Badge variant={attempt.status === 'completed' ? 'default' : 'secondary'}>
                        {attempt.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Domain Selection */}
        {!latestRequest || latestRequest.requestStatus === 'rejected' ? (
          <>
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">Choose Your Domain</h2>
              <p className="text-muted-foreground">Select the internship domain you want to be assessed in.</p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {DOMAINS.map((domain) => (
                <Card
                  key={domain}
                  className="group cursor-pointer transition-all hover:shadow-xl hover:-translate-y-1"
                  onClick={() => handleRequestExam(domain)}
                >
                  <CardContent className="relative overflow-hidden p-6">
                    <div className={`absolute inset-0 bg-gradient-to-br ${DOMAIN_COLORS[domain as keyof typeof DOMAIN_COLORS]} opacity-0 transition-opacity group-hover:opacity-5`} />
                    <div className="text-4xl mb-4">{DOMAIN_ICONS[domain as keyof typeof DOMAIN_ICONS]}</div>
                    <h3 className="text-lg font-semibold">{domain}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">30 Questions • 30 Minutes</p>
                    <Button 
                      className="mt-4 w-full" 
                      size="sm"
                      disabled={requestingExam}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRequestExam(domain);
                      }}
                    >
                      {requestingExam ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Request Access'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default Dashboard;
