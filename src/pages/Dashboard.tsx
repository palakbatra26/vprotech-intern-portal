import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DOMAINS, DOMAIN_ICONS, DOMAIN_COLORS } from '@/lib/constants';
import { Shield, LogOut, User, Loader2 } from 'lucide-react';

const Dashboard = () => {
  const { profile, loading, signOut } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) return null;

  const handleSelectDomain = (domain: string) => {
    if (profile.has_attempted) return;
    navigate('/exam/instructions', { state: { domain } });
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
                <CardTitle className="text-2xl">Welcome, {profile.full_name}! 👋</CardTitle>
                <CardDescription className="mt-1">
                  Application ID: <span className="font-mono font-semibold text-primary">{profile.application_id}</span>
                </CardDescription>
              </div>
              {profile.has_attempted ? (
                <Badge variant="secondary" className="text-sm">Exam Completed</Badge>
              ) : (
                <Badge className="text-sm bg-primary">Ready to Start</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-3">
              <div>📧 {profile.email}</div>
              <div>🏫 {profile.college_name}</div>
              <div>📚 {profile.course} — {profile.semester}</div>
            </div>
          </CardContent>
        </Card>

        {/* Exam Status */}
        {profile.has_attempted ? (
          <Card className="mb-8">
            <CardContent className="py-8 text-center">
              <h3 className="text-xl font-semibold mb-2">You have already completed your assessment</h3>
              <p className="text-muted-foreground mb-4">
                Domain: <span className="font-semibold">{profile.selected_domain}</span>
              </p>
              <Button onClick={() => navigate('/result')}>View Results</Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Domain Selection */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">Choose Your Domain</h2>
              <p className="text-muted-foreground">Select the internship domain you want to be assessed in. You can only attempt once.</p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {DOMAINS.map((domain) => (
                <Card
                  key={domain}
                  className="group cursor-pointer transition-all hover:shadow-xl hover:-translate-y-1"
                  onClick={() => handleSelectDomain(domain)}
                >
                  <CardContent className="relative overflow-hidden p-6">
                    <div className={`absolute inset-0 bg-gradient-to-br ${DOMAIN_COLORS[domain]} opacity-0 transition-opacity group-hover:opacity-5`} />
                    <div className="text-4xl mb-4">{DOMAIN_ICONS[domain]}</div>
                    <h3 className="text-lg font-semibold">{domain}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">30 Questions • 30 Minutes</p>
                    <Button className="mt-4 w-full" size="sm">Select & Start</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
