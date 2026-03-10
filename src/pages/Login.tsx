import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Shield, Loader2 } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().trim().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
});

type LoginValues = z.infer<typeof loginSchema>;

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const navigate = useNavigate();

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values: LoginValues) => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });
    setLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    // Check if admin
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: isAdmin } = await supabase.rpc('has_role', { _user_id: user.id, _role: 'admin' });
      navigate(isAdmin ? '/admin' : '/dashboard');
    }
  };

  const handleForgotPassword = async () => {
    const email = form.getValues('email');
    if (!email) {
      toast.error('Enter your email first');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Password reset email sent! Check your inbox.');
      setForgotMode(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Link to="/" className="flex items-center justify-center gap-2 mb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Shield className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">VproTechDigital</span>
          </Link>
          <CardTitle className="text-2xl">{forgotMode ? 'Reset Password' : 'Welcome Back'}</CardTitle>
          <CardDescription>
            {forgotMode ? 'Enter your email to receive a password reset link' : 'Log in to access the assessment portal'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="you@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {!forgotMode && (
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {forgotMode ? (
                <div className="space-y-3">
                  <Button type="button" className="w-full" disabled={loading} onClick={handleForgotPassword}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Send Reset Link
                  </Button>
                  <Button type="button" variant="ghost" className="w-full" onClick={() => setForgotMode(false)}>
                    Back to Login
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Log In
                  </Button>
                  <Button type="button" variant="link" className="w-full" onClick={() => setForgotMode(true)}>
                    Forgot Password?
                  </Button>
                </div>
              )}

              <p className="text-center text-sm text-muted-foreground">
                Don't have an account?{' '}
                <Link to="/signup" className="text-primary hover:underline font-medium">Sign up</Link>
              </p>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
