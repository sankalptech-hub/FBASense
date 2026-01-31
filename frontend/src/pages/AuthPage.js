import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card } from '../components/ui/card';
import { Package, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, signup, isDemoMode } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = isLogin ? await login(email, password) : await signup(email, password);

    if (result.success) {
      toast.success(isDemoMode ? 'Logged in to demo mode' : `${isLogin ? 'Logged in' : 'Account created'} successfully!`);
      navigate('/dashboard');
    } else {
      toast.error(result.error || 'Authentication failed');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left side - Auth form */}
      <div className="flex items-center justify-center p-8 bg-background">
        <Card className="w-full max-w-md p-8 border shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-10 w-10 rounded-md bg-primary flex items-center justify-center">
              <Package className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-heading tracking-tight">FBASense</h1>
              <p className="text-sm text-muted-foreground">Smart Inventory Management</p>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-bold font-heading mb-2">
              {isLogin ? 'Welcome back' : 'Create your account'}
            </h2>
            <p className="text-sm text-muted-foreground">
              {isLogin ? 'Sign in to access your inventory' : 'Get started with inventory insights'}
            </p>
          </div>

          {isDemoMode && (
            <div className="mb-6 p-3 bg-accent/10 border border-accent/20 rounded-md">
              <p className="text-sm text-accent font-medium">
                Demo Mode: Enter any credentials to explore the app
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seller@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                data-testid="email-input"
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                data-testid="password-input"
                className="h-11"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-11"
              disabled={loading}
              data-testid="auth-submit-button"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Please wait...
                </>
              ) : (
                isLogin ? 'Sign In' : 'Create Account'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-primary hover:underline"
              data-testid="toggle-auth-mode"
            >
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>
        </Card>
      </div>

      {/* Right side - Background image */}
      <div 
        className="hidden lg:block relative overflow-hidden"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1556743769-8d7477994b25?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1ODF8MHwxfHNlYXJjaHwzfHxtb2Rlcm4lMjB3YXJlaG91c2UlMjBsb2dpc3RpY3MlMjBhYnN0cmFjdHxlbnwwfHx8fDE3Njk4NDMyODV8MA&ixlib=rb-4.1.0&q=85)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-primary/10" />
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="max-w-lg text-center">
            <h2 className="text-4xl font-bold font-heading text-white mb-4">
              Turn Excel chaos into clear insights
            </h2>
            <p className="text-lg text-white/90">
              Upload your Amazon reports and get instant inventory visibility. No API required.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
