'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuthContext } from '@/lib/context/auth-context';
import { RouteChecker } from '@/lib/config/routes';
import { toast } from 'sonner';

const signupSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  role: z.enum(['customer', 'owner'], {
    errorMap: () => ({ message: 'Please select a role' })
  })
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignupForm = z.infer<typeof signupSchema>;

export function SignupForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const router = useRouter();
  const { signup, isLoading } = useAuthContext();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      role: 'customer'
    }
  });

  const selectedRole = watch('role');

  const onSubmit = async (data: SignupForm) => {
    // Clear any previous form errors
    setFormError(null);
    
    const result = await signup(data.email, data.password, data.fullName, data.role);
    
    if (result.success) {
      toast.success('Account created successfully!');
      
      // Redirect based on role using centralized route logic
      const redirectPath = RouteChecker.getDefaultRedirectPath(data.role);
      router.push(redirectPath);
    } else {
      // Show error inside the form instead of just toast
      setFormError(result.error || 'Account creation failed. Please try again.');
      // Still show toast for immediate feedback, but form error is primary
      toast.error(result.error || 'Signup failed');
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {formError && (
          <Alert variant="destructive" className="border-red-200 bg-red-50 text-red-800">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {formError}
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="fullName" className="text-sm font-medium text-foreground">
            Full name
          </Label>
          <Input
            id="fullName"
            type="text"
            placeholder="Enter your full name"
            className="h-12 border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-foreground focus:ring-foreground"
            {...register('fullName')}
            disabled={isLoading}
          />
          {errors.fullName && (
            <p className="text-sm text-red-600">{errors.fullName.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-foreground">
            Email address
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            className="h-12 border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-foreground focus:ring-foreground"
            {...register('email')}
            disabled={isLoading}
          />
          {errors.email && (
            <p className="text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium text-foreground">
            Password
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              className="h-12 border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-foreground focus:ring-foreground pr-12"
              {...register('password')}
              disabled={isLoading}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-12 px-3 hover:bg-transparent text-muted-foreground hover:text-foreground"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isLoading}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </div>
          {errors.password && (
            <p className="text-sm text-red-600">{errors.password.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
            Confirm password
          </Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirm your password"
              className="h-12 border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-foreground focus:ring-foreground pr-12"
              {...register('confirmPassword')}
              disabled={isLoading}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-12 px-3 hover:bg-transparent text-muted-foreground hover:text-foreground"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              disabled={isLoading}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </div>
          {errors.confirmPassword && (
            <p className="text-sm text-red-600">{errors.confirmPassword.message}</p>
          )}
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-medium text-foreground">I want to</Label>
          <RadioGroup
            value={selectedRole}
            onValueChange={(value) => setValue('role', value as 'customer' | 'owner')}
            className="space-y-3"
            disabled={isLoading}
          >
            <div className="flex items-center space-x-3 p-4 border border-border bg-background hover:bg-muted/50 transition-colors">
              <RadioGroupItem value="customer" id="customer" />
              <div className="flex-1">
                <Label htmlFor="customer" className="cursor-pointer font-medium text-foreground">
                  Rent cars
                </Label>
                <p className="text-sm text-muted-foreground">Browse and book cars from local hosts</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-4 border border-border bg-background hover:bg-muted/50 transition-colors">
              <RadioGroupItem value="owner" id="owner" />
              <div className="flex-1">
                <Label htmlFor="owner" className="cursor-pointer font-medium text-foreground">
                  Share my car
                </Label>
                <p className="text-sm text-muted-foreground">List your car and earn money from rentals</p>
              </div>
            </div>
          </RadioGroup>
          {errors.role && (
            <p className="text-sm text-red-600">{errors.role.message}</p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full h-12 bg-foreground text-background hover:bg-foreground/90 font-medium text-base shadow-sm transition-colors"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating account...
            </>
          ) : (
            'Create account'
          )}
        </Button>
      </form>
    </div>
  );
} 