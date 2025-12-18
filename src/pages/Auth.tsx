import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { Printer, User, Store } from 'lucide-react';
import { AppRole } from '@/types/database';
import { z } from 'zod';

const authSchema = z.object({
  email: z.string().email('Invalid email address').max(255),
  password: z.string().min(6, 'Password must be at least 6 characters').max(128),
  fullName: z.string().min(1, 'Name is required').max(100).optional(),
  shopName: z.string().min(1, 'Shop name is required').max(100).optional(),
});

export default function Auth() {
  const navigate = useNavigate();
  const { signIn, signUp, user, loading } = useAuth();
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<AppRole>('user');
  const [shopName, setShopName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user && !loading) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      authSchema.pick({ email: true, password: true }).parse({ email, password });
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast({
          title: 'Validation Error',
          description: err.errors[0].message,
          variant: 'destructive',
        });
        setIsSubmitting(false);
        return;
      }
    }

    const { error } = await signIn(email, password);

    if (error) {
      toast({
        title: 'Sign in failed',
        description: error.message === 'Invalid login credentials' 
          ? 'Invalid email or password' 
          : error.message,
        variant: 'destructive',
      });
    } else {
      navigate('/dashboard');
    }

    setIsSubmitting(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const dataToValidate: Record<string, string> = { email, password, fullName };
      if (role === 'merchant') {
        dataToValidate.shopName = shopName;
      }
      authSchema.parse(dataToValidate);
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast({
          title: 'Validation Error',
          description: err.errors[0].message,
          variant: 'destructive',
        });
        setIsSubmitting(false);
        return;
      }
    }

    const { error } = await signUp(email, password, fullName, role, shopName);

    if (error) {
      const message = error.message.includes('already registered')
        ? 'An account with this email already exists'
        : error.message;

      toast({
        title: 'Sign up failed',
        description: message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Account created!',
        description: 'You can now sign in with your credentials.',
      });
      navigate('/dashboard');
    }

    setIsSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md border-2 border-foreground shadow-md">
        <CardHeader className="text-center border-b-2 border-foreground">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Printer className="h-8 w-8" />
            <CardTitle className="text-3xl font-bold tracking-tight">PrimePrint</CardTitle>
          </div>
          <CardDescription className="text-muted-foreground">
            College Print Scheduling Made Easy
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 border-2 border-foreground">
              <TabsTrigger value="signin" className="data-[state=active]:bg-foreground data-[state=active]:text-background">
                Sign In
              </TabsTrigger>
              <TabsTrigger value="signup" className="data-[state=active]:bg-foreground data-[state=active]:text-background">
                Sign Up
              </TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="you@college.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="border-2 border-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Password</Label>
                  <Input
                    id="signin-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="border-2 border-foreground"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full border-2 shadow-sm hover:shadow-xs hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Full Name</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="border-2 border-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="you@college.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="border-2 border-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="border-2 border-foreground"
                  />
                </div>

                <div className="space-y-3">
                  <Label>Account Type</Label>
                  <RadioGroup
                    value={role}
                    onValueChange={(value) => setRole(value as AppRole)}
                    className="grid grid-cols-2 gap-4"
                  >
                    <Label
                      htmlFor="user"
                      className={`flex flex-col items-center gap-2 p-4 border-2 border-foreground cursor-pointer transition-all ${
                        role === 'user' ? 'bg-foreground text-background' : 'hover:bg-accent'
                      }`}
                    >
                      <RadioGroupItem value="user" id="user" className="sr-only" />
                      <User className="h-6 w-6" />
                      <span className="font-medium">Student</span>
                      <span className="text-xs text-center opacity-70">Submit print jobs</span>
                    </Label>
                    <Label
                      htmlFor="merchant"
                      className={`flex flex-col items-center gap-2 p-4 border-2 border-foreground cursor-pointer transition-all ${
                        role === 'merchant' ? 'bg-foreground text-background' : 'hover:bg-accent'
                      }`}
                    >
                      <RadioGroupItem value="merchant" id="merchant" className="sr-only" />
                      <Store className="h-6 w-6" />
                      <span className="font-medium">Merchant</span>
                      <span className="text-xs text-center opacity-70">Print & fulfill</span>
                    </Label>
                  </RadioGroup>
                </div>

                {role === 'merchant' && (
                  <div className="space-y-2">
                    <Label htmlFor="shop-name">Shop Name</Label>
                    <Input
                      id="shop-name"
                      type="text"
                      placeholder="Campus Prints"
                      value={shopName}
                      onChange={(e) => setShopName(e.target.value)}
                      required
                      className="border-2 border-foreground"
                    />
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full border-2 shadow-sm hover:shadow-xs hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Creating account...' : 'Create Account'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
