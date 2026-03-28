import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { supabase } from '../lib/supabase';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import toast from 'react-hot-toast';
import { KeyRound } from 'lucide-react';

const schema = yup.object({
  email: yup.string().email('Invalid email address').required('Email is required'),
}).required();

type FormData = yup.InferType<typeof schema>;

export default function ForgotPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: yupResolver(schema)
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setHasSubmitted(true);
      toast.success('Password reset email sent!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send reset email');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md glass-card p-8 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500 rounded-full mix-blend-multiply filter blur-2xl opacity-50 animate-blob"></div>
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-purple-500 rounded-full mix-blend-multiply filter blur-2xl opacity-50 animate-blob animation-delay-2000"></div>

        <div className="relative z-10">
          <div className="flex justify-center mb-6">
            <div className="p-3 bg-white/10 rounded-2xl border border-white/20 shadow-xl">
              <KeyRound className="text-white" size={32} />
            </div>
          </div>
          
          <h2 className="text-3xl font-bold text-center text-white mb-2">Reset Password</h2>
          
          {hasSubmitted ? (
            <div className="text-center">
              <p className="text-white/80 mb-6 bg-emerald-500/20 p-4 rounded-xl border border-emerald-500/30">
                Check your email for a password reset link.
              </p>
              <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                Return to Login
              </Link>
            </div>
          ) : (
            <>
              <p className="text-white/60 text-center mb-8">Enter your email and we'll send you a link to reset your password.</p>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input 
                  label="Email" 
                  type="email" 
                  {...register('email')}
                  error={errors.email?.message}
                />
                
                <div className="pt-2">
                  <Button type="submit" isLoading={isLoading} className="w-full shadow-lg shadow-blue-500/20">
                    Send Reset Link
                  </Button>
                </div>
              </form>

              <p className="mt-6 text-center text-white/60">
                Remember your password?{' '}
                <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                  Sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
