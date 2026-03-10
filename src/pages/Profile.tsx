import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Loader2 } from 'lucide-react';

const Profile = () => {
  const { profile, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) return null;

  const fields = [
    { label: 'Application ID', value: profile.application_id },
    { label: 'Full Name', value: profile.full_name },
    { label: 'Email', value: profile.email },
    { label: 'Phone', value: profile.phone },
    { label: 'College', value: profile.college_name },
    { label: 'CRN', value: profile.crn },
    { label: 'URN', value: profile.urn },
    { label: 'Course', value: profile.course },
    { label: 'Semester', value: profile.semester },
    { label: 'City', value: profile.city },
    { label: 'Exam Status', value: profile.has_attempted ? 'Completed' : 'Not Attempted' },
    { label: 'Domain', value: profile.selected_domain || 'Not Selected' },
  ];

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto max-w-2xl">
        <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Dashboard
        </Button>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Your Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              {fields.map((f) => (
                <div key={f.label} className="rounded-lg border p-3">
                  <div className="text-xs text-muted-foreground">{f.label}</div>
                  <div className="mt-1 font-medium">{f.value}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
