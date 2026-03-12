import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Shield, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const signupSchema = z.object({
  fullName: z.string().trim().min(2, 'Full name is required').max(100),
  email: z.string().trim().email('Invalid email').max(255),
  password: z.string().min(6, 'Password must be at least 6 characters').max(72),
  phone: z.string().trim().min(10, 'Valid phone number required').max(15),
  collegeName: z.string().trim().min(2, 'College name is required').max(200),
  crn: z.string().trim().min(1, 'CRN is required').max(50),
  urn: z.string().trim().min(1, 'URN is required').max(50),
  course: z.string().trim().min(2, 'Course/Branch is required').max(100),
  semester: z.string().trim().min(1, 'Semester is required').max(20),
  city: z.string().trim().min(2, 'City is required').max(100),
  agreeRules: z.literal(true, { errorMap: () => ({ message: 'You must agree to exam rules' }) }),
});

type SignupValues = z.infer<typeof signupSchema>;

const Signup = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const form = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: '', email: '', password: '', phone: '',
      collegeName: '', crn: '', urn: '', course: '',
      semester: '', city: '', agreeRules: undefined as unknown as true,
    },
  });

  const onSubmit = async (values: SignupValues) => {
    setLoading(true);
    try {
      const { agreeRules, ...registerData } = values;
      const response = await register(registerData);
      setLoading(false);

      if (response.userId) {
        toast.success('Registration successful! Please log in.');
        navigate('/login');
      } else {
        toast.error(response.message || 'Registration failed');
      }
    } catch (error) {
      setLoading(false);
      toast.error('An error occurred during registration');
    }
  };

  const fields: { name: keyof SignupValues; label: string; type?: string; placeholder: string }[] = [
    { name: 'fullName', label: 'Full Name', placeholder: 'John Doe' },
    { name: 'email', label: 'Email', type: 'email', placeholder: 'you@example.com' },
    { name: 'password', label: 'Password', type: 'password', placeholder: '••••••••' },
    { name: 'phone', label: 'Phone Number', placeholder: '+91 9876543210' },
    { name: 'collegeName', label: 'College Name', placeholder: 'XYZ University' },
    { name: 'crn', label: 'CRN', placeholder: 'CRN12345' },
    { name: 'urn', label: 'URN', placeholder: 'URN12345' },
    { name: 'course', label: 'Course / Branch', placeholder: 'B.Tech CSE' },
    { name: 'semester', label: 'Year / Semester', placeholder: '3rd Year / 6th Sem' },
    { name: 'city', label: 'City', placeholder: 'New Delhi' },
  ];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <Link to="/" className="flex items-center justify-center gap-2 mb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Shield className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">VproTechDigital</span>
          </Link>
          <CardTitle className="text-2xl">Create Your Account</CardTitle>
          <CardDescription>Fill in your details to register for the internship assessment</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                {fields.map((f) => (
                  <FormField
                    key={f.name}
                    control={form.control}
                    name={f.name}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{f.label}</FormLabel>
                        <FormControl>
                          <Input type={f.type || 'text'} placeholder={f.placeholder} {...field} value={field.value as string} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
              </div>

              <FormField
                control={form.control}
                name="agreeRules"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>I agree to the exam rules</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        I understand that tab switching, minimizing, or leaving fullscreen during the exam may result in disqualification.
                      </p>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Account
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link to="/login" className="text-primary hover:underline font-medium">Log in</Link>
              </p>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Signup;
