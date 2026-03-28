import React from 'react';
import { User, Mail, Calendar, Settings as SettingsIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import type { UserProfile } from '../../types';

interface ProfileHeaderProps {
  profile: UserProfile | null;
  loading: boolean;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ profile, loading }) => {
  if (loading) {
    return (
      <div className="glass-card p-6 animate-pulse mb-8">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-white/10"></div>
          <div className="space-y-3 flex-1">
            <div className="h-6 bg-white/10 rounded w-1/4"></div>
            <div className="h-4 bg-white/10 rounded w-1/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="glass-card p-6 mb-8 relative overflow-hidden group">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -mr-32 -mt-32 transition-transform duration-500 group-hover:scale-110"></div>
      
      <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6">
        <div className="relative">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white text-3xl font-bold shadow-xl border-2 border-white/20">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.display_name} className="w-full h-full object-cover rounded-2xl" />
            ) : (
              profile.display_name?.charAt(0) || profile.email?.charAt(0) || 'U'
            )}
          </div>
          <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-lg bg-emerald-500 border-2 border-slate-900 flex items-center justify-center shadow-lg">
            <div className="w-2.5 h-2.5 rounded-full bg-white animate-pulse"></div>
          </div>
        </div>

        <div className="flex-1 text-center md:text-left">
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-2">
            <h2 className="text-2xl font-bold text-white tracking-tight">{profile.display_name || 'Anonymous User'}</h2>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30">
              Pro Account
            </span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6 text-white/60 mb-4">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <Mail size={14} className="text-purple-400" />
              <span className="text-sm truncate">{profile.email}</span>
            </div>
            <div className="flex items-center justify-center md:justify-start gap-2">
              <User size={14} className="text-pink-400" />
              <span className="text-sm">Currency: {profile.default_currency}</span>
            </div>
            <div className="flex items-center justify-center md:justify-start gap-2">
              <Calendar size={14} className="text-blue-400" />
              <span className="text-sm">Joined: {profile.created_at ? format(new Date(profile.created_at), 'MMMM yyyy') : 'Recently'}</span>
            </div>
          </div>

          {profile.bio && (
            <p className="text-sm text-white/50 mb-4 max-w-2xl italic">
              "{profile.bio}"
            </p>
          )}

          <div className="flex flex-wrap justify-center md:justify-start gap-3">
            <Link to="/settings">
              <button className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-sm font-medium rounded-xl border border-white/10 transition-all">
                <SettingsIcon size={14} /> Edit Profile
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
