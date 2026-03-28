import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { supabase } from '../lib/supabase';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import toast from 'react-hot-toast';
import { Wallet } from 'lucide-react';

const schema = yup.object({
  name: yup.string().required('Name is required'),
  email: yup.string().email('Invalid email address').required('Email is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
}).required();

type FormData = yup.InferType<typeof schema>;

export default function Signup() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: yupResolver(schema)
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            display_name: data.name
          }
        }
      });
      if (error) throw error;
      
      toast.success('Account created successfully!');
      navigate('/');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md glass-card p-8 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-2000"></div>

        <div className="relative z-10">
          <div className="flex justify-center mb-6">
            <div className="p-3 bg-white/10 rounded-2xl border border-white/20 shadow-xl">
              <Wallet className="text-white" size={32} />
            </div>
          </div>
          
          <h2 className="text-3xl font-bold text-center text-white mb-2">Create Account</h2>
          <p className="text-white/60 text-center mb-8">Start tracking your finances with Xamaricash</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input 
              label="Full Name" 
              {...register('name')}
              error={errors.name?.message}
            />
            <Input 
              label="Email" 
              type="email" 
              {...register('email')}
              error={errors.email?.message}
            />
            <Input 
              label="Password" 
              type="password" 
              {...register('password')}
              error={errors.password?.message}
            />
            
            <div className="pt-2">
              <Button type="submit" isLoading={isLoading} className="w-full shadow-lg shadow-pink-500/20">
                Sign Up
              </Button>
            </div>
          </form>

          <p className="mt-6 text-center text-white/60">
            Already have an account?{' '}
            <Link to="/login" className="text-pink-400 hover:text-pink-300 font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
