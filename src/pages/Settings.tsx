import { useState, useEffect } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { useAuthStore } from '../stores/authStore';
import { useBookStore } from '../stores/bookStore';
import { useTransactionStore } from '../stores/transactionStore';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { supabase } from '../lib/supabase';
import { Download, Upload, User, Shield, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Settings() {
  const { user } = useAuthStore();
  const { books } = useBookStore();
  const { transactions } = useTransactionStore();
  
  const [displayName, setDisplayName] = useState(user?.user_metadata?.display_name || '');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      const { data } = await supabase.from('users').select('*').eq('id', user.id).single();
      if (data) {
        setDisplayName(data.display_name || '');
        setBio(data.bio || '');
        setAvatarUrl(data.avatar_url || '');
      }
    };
    fetchProfile();
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsUpdating(true);
    try {
      const authUpdates: any = {};
      if (displayName !== user.user_metadata?.display_name) {
        authUpdates.data = { display_name: displayName };
      }
      if (newPassword) {
        authUpdates.password = newPassword;
      }
      
      if (Object.keys(authUpdates).length > 0) {
        const { error } = await supabase.auth.updateUser(authUpdates);
        if (error) throw error;
      }

      // Update public.users table for bio and avatar
      const { error: profileError } = await supabase.from('users').update({
        display_name: displayName,
        bio: bio,
        avatar_url: avatarUrl
      }).eq('id', user.id);
      
      if (profileError) throw profileError;
      
      toast.success('Profile updated successfully');
      setNewPassword('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  };

  const exportData = () => {
    const data = {
      books,
      transactions,
      exportDate: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `xamaricash-backup-${new Date().getTime()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Data exported successfully');
  };

  const importData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Real implementation would parse JSON and insert into Supabase tables
    toast.success('Data imported! (Simulated)');
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you absolutely sure? This will delete all your data and cannot be undone.')) {
      if (window.confirm('Please confirm one more time.')) {
        toast.error('Account deletion required admin privileges in Supabase. Please contact support.');
      }
    }
  };

  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-white/60">Manage your profile and application preferences.</p>
      </div>

      <div className="space-y-6 max-w-3xl">
        {/* Profile Section */}
        <section className="glass-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-500/20 rounded-xl">
              <User className="text-purple-400" size={24} />
            </div>
            <h2 className="text-xl font-semibold text-white">Profile</h2>
          </div>
          
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <Input 
              label="Display Name" 
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
            <div className="flex flex-col gap-1 w-full">
              <label className="text-sm font-medium text-white/80 ml-1">Profile Bio</label>
              <textarea 
                className="glass-input w-full min-h-[100px] resize-none" 
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us a bit about yourself..."
              />
            </div>
            <Input 
              label="Avatar URL" 
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://example.com/avatar.png"
            />
            <Input 
              label="Email Address" 
              value={user?.email || ''}
              disabled
              className="opacity-60"
            />
            <Input 
              label="New Password" 
              type="password"
              placeholder="Leave blank to keep current"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <div className="pt-2">
              <Button type="submit" isLoading={isUpdating}>Save Changes</Button>
            </div>
          </form>
        </section>

        {/* Data Management Section */}
        <section className="glass-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-emerald-500/20 rounded-xl">
              <Shield className="text-emerald-400" size={24} />
            </div>
            <h2 className="text-xl font-semibold text-white">Data Management</h2>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Button variant="secondary" onClick={exportData} className="flex-1">
              <Download size={18} /> Export Backup (JSON)
            </Button>
            
            <label className="flex-1">
              <input type="file" accept=".json" className="hidden" onChange={importData} />
              <div className="glass-button-secondary w-full cursor-pointer text-center">
                <Upload size={18} /> Import Backup
              </div>
            </label>
          </div>
          <p className="mt-4 text-sm text-white/50">
            Exporting will download all your books and transactions. Importing requires a previously exported file.
          </p>
        </section>

        {/* Danger Zone */}
        <section className="glass-card p-6 border-red-500/30 bg-red-500/5">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-red-500/20 rounded-xl">
              <AlertTriangle className="text-red-400" size={24} />
            </div>
            <h2 className="text-xl font-semibold text-red-400">Danger Zone</h2>
          </div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-white font-medium mb-1">Delete Account</p>
              <p className="text-sm text-white/50">Permanently delete your account and all data.</p>
            </div>
            <Button variant="danger" onClick={handleDeleteAccount} className="opacity-50" disabled>
              <AlertTriangle size={18} /> Delete Account
            </Button>
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
