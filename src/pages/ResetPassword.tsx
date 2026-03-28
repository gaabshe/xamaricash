import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { supabase } from '../lib/supabase';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import toast from 'react-hot-toast';
import { ShieldCheck } from 'lucide-react';

const schema = yup.object({
  password: yup.string().min(6, 'Password must be at least 6 characters').required('New password is required'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Confirm password is required'),
}).required();

type FormData = yup.InferType<typeof schema>;

export default function ResetPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: yupResolver(schema)
  });

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || session) {
        // Safe to proceed
      } else if (event === 'SIGNED_OUT') {
        toast.error('Invalid or expired password reset link');
        navigate('/login');
      }
    });
    
    // Also check initial session just in case event fired before subscribe
    supabase.auth.getSession().then(({ data: { session } }) => {
      // If no session and no hash indicating recovery in progress, kick them
      if (!session && !window.location.hash.includes('type=recovery')) {
        toast.error('Invalid or expired password reset link');
        navigate('/login');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: data.password
      });
      if (error) throw error;
      
      toast.success('Password updated successfully!');
      navigate('/');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md glass-card p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob"></div>

        <div className="relative z-10">
          <div className="flex justify-center mb-6">
            <div className="p-3 bg-white/10 rounded-2xl border border-white/20 shadow-xl">
              <ShieldCheck className="text-white" size={32} />
            </div>
          </div>
          
          <h2 className="text-3xl font-bold text-center text-white mb-2">Create New Password</h2>
          <p className="text-white/60 text-center mb-8">Enter your new secure password below to finalize the reset.</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input 
              label="New Password" 
              type="password" 
              {...register('password')}
              error={errors.password?.message}
            />
            <Input 
              label="Confirm New Password" 
              type="password" 
              {...register('confirmPassword')}
              error={errors.confirmPassword?.message}
            />
            
            <div className="pt-2">
              <Button type="submit" isLoading={isLoading} className="w-full shadow-lg shadow-emerald-500/20">
                Update Password
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
