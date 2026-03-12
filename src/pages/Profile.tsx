import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import api from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Shield, ArrowLeft, Loader2, Save } from 'lucide-react';

const Profile = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    collegeName: '',
    crn: '',
    urn: '',
    course: '',
    semester: '',
    city: ''
  });

  useEffect(() => {
    if (!authLoading && user) {
      setFormData({
        fullName: user.fullName || '',
        phone: user.phone || '',
        collegeName: user.collegeName || '',
        crn: user.crn || '',
        urn: user.urn || '',
        course: user.course || '',
        semester: user.semester || '',
        city: user.city || ''
      });
    }
  }, [user, authLoading]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await api.updateProfile(formData);
      if (response.user) {
        // Trigger refetch
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto max-w-2xl">
        <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Dashboard
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <Shield className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">VproTechDigital</span>
            </div>
            <CardTitle>Your Profile</CardTitle>
            <CardDescription>
              Application ID: <span className="font-mono">{user.applicationId}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium">Full Name</label>
                <Input 
                  value={formData.fullName} 
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Email</label>
                <Input value={user.email} disabled />
              </div>
              <div>
                <label className="text-sm font-medium">Phone</label>
                <Input 
                  value={formData.phone} 
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium">City</label>
                <Input 
                  value={formData.city} 
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium">College Name</label>
                <Input 
                  value={formData.collegeName} 
                  onChange={(e) => setFormData({...formData, collegeName: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium">CRN</label>
                <Input 
                  value={formData.crn} 
                  onChange={(e) => setFormData({...formData, crn: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium">URN</label>
                <Input 
                  value={formData.urn} 
                  onChange={(e) => setFormData({...formData, urn: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Course / Branch</label>
                <Input 
                  value={formData.course} 
                  onChange={(e) => setFormData({...formData, course: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Semester / Year</label>
                <Input 
                  value={formData.semester} 
                  onChange={(e) => setFormData({...formData, semester: e.target.value})}
                />
              </div>
            </div>

            <Button onClick={handleSave} disabled={loading} className="w-full">
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              Save Changes
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
