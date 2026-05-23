import { useState, useEffect, useRef } from 'react';
import { Camera, Upload, Trash2, Shield, User, Lock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface UserAccount {
  name: string;
  email: string;
  role: 'user' | 'admin';
}

interface SettingsSectionProps {
  user: UserAccount | null;
  onUpdateUser: (updatedUser: Partial<UserAccount>) => void;
}

export function SettingsSection({ user, onUpdateUser }: SettingsSectionProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Profile Form states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [avatar, setAvatar] = useState('');

  // Password tab states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Load configuration on mount
  useEffect(() => {
    if (user) {
      const parts = user.name.split(' ');
      setFirstName(parts[0] || '');
      setLastName(parts.slice(1).join(' ') || '');
      setEmail(user.email || '');
    }

    // Try loading details from localStorage if they have been saved before
    const storedProfile = localStorage.getItem('fintech_user_profile_details');
    if (storedProfile) {
      try {
        const profile = JSON.parse(storedProfile);
        if (profile.firstName) setFirstName(profile.firstName);
        if (profile.lastName) setLastName(profile.lastName);
        if (profile.email) setEmail(profile.email);
      } catch (e) {
        console.error('Error parsing profile details', e);
      }
    }

    // Load custom avatar
    const storedAvatar = localStorage.getItem('fintech_user_avatar');
    if (storedAvatar) {
      setAvatar(storedAvatar);
    } else {
      // Set default avatar matching default Pratvi user
      setAvatar('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200&h=200');
    }
  }, [user]);

  // Handle avatar upload
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setAvatar(base64String);
        localStorage.setItem('fintech_user_avatar', base64String);
        toast({
          title: 'Avatar Updated',
          description: 'Your profile picture has been updated successfully.',
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteAvatar = () => {
    const defaultPlaceholder = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200&h=200';
    setAvatar(defaultPlaceholder);
    localStorage.removeItem('fintech_user_avatar');
    toast({
      title: 'Avatar Removed',
      description: 'Your profile photo has been reverted to the default avatar.',
    });
  };

  // Profile submission handler
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();

    if (!firstName.trim() || !lastName.trim()) {
      toast({
        title: 'Validation Error',
        description: 'First Name and Last Name are required fields.',
        variant: 'destructive',
      });
      return;
    }

    const updatedProfile = {
      firstName,
      lastName,
      email,
    };

    localStorage.setItem('fintech_user_profile_details', JSON.stringify(updatedProfile));
    
    // Propagate username update to global App state
    onUpdateUser({
      name: `${firstName} ${lastName}`.trim(),
      email: email,
    });

    toast({
      title: 'Profile Updated',
      description: 'Your account settings have been saved successfully.',
    });
  };

  // Password submission handler
  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({
        title: 'Error',
        description: 'Please fill in all password fields.',
        variant: 'destructive',
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({
        title: 'Error',
        description: 'New password and confirm password do not match.',
        variant: 'destructive',
      });
      return;
    }
    if (newPassword.length < 6) {
      toast({
        title: 'Error',
        description: 'Password must be at least 6 characters.',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Password Changed',
      description: 'Your security password has been updated.',
    });
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Account Settings</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage your public profile details and password security
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left Card: Profile Settings */}
        <Card className="bg-white dark:bg-slate-900 border-purple-100/80 dark:border-slate-800 shadow-[0_4px_16px_rgba(124,58,237,0.02)] overflow-hidden">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800/50 pb-4">
            <div className="flex items-center gap-2">
              <User className="h-4.5 w-4.5 text-[#7C3AED]" />
              <CardTitle className="text-base font-bold text-slate-800 dark:text-slate-100">Profile Details</CardTitle>
            </div>
            <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
              Update your visual avatar and public credentials
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* Avatar Section */}
            <div className="flex flex-col sm:flex-row items-center gap-5 pb-5 border-b border-slate-100 dark:border-slate-800/40">
              <div className="relative w-20 h-20 rounded-full border-2 border-purple-100 dark:border-slate-800 shadow-md overflow-hidden shrink-0">
                <img 
                  src={avatar} 
                  alt="User profile avatar" 
                  className="w-full h-full object-cover" 
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white p-1.5 rounded-full shadow-lg flex items-center justify-center border border-white dark:border-slate-950"
                  title="Upload picture"
                >
                  <Camera className="h-3 w-3" />
                </button>
              </div>
              
              <div className="flex flex-col gap-2 w-full sm:w-auto">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all"
                  >
                    <Upload className="h-3 w-3" />
                    <span>Upload New</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteAvatar}
                    className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-350 font-bold py-2 px-4 rounded-xl text-xs flex items-center gap-1.5 transition-all"
                  >
                    <Trash2 className="h-3 w-3" />
                    <span>Delete</span>
                  </button>
                </div>
                <p className="text-[10px] text-slate-400">JPG, PNG or GIF. Max size 2MB.</p>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleAvatarChange} 
                  accept="image/*" 
                  className="hidden" 
                />
              </div>
            </div>

            {/* Profile Fields Form */}
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First name"
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED] transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Last name"
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED] transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider">
                  Email Address
                </label>
                <input
                  type="email"
                  readOnly
                  value={email}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-500 text-sm cursor-not-allowed focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-[#7C3AED]/5 border border-purple-100/60 dark:border-slate-800/80 rounded-xl">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-[#7C3AED]" />
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-350">Security Account Level</span>
                </div>
                <span className="text-[10px] font-black bg-[#7C3AED]/10 text-[#7C3AED] px-2 py-0.5 rounded-full uppercase tracking-wider">
                  {user?.role === 'admin' ? 'Administrator' : 'Verified User'}
                </span>
              </div>

              <button
                type="submit"
                className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold py-2.5 px-6 rounded-xl text-xs shadow-md transition-all active:scale-[0.98] mt-2"
              >
                Save Profile Changes
              </button>
            </form>
          </CardContent>
        </Card>

        {/* Right Card: Change Password */}
        <Card className="bg-white dark:bg-slate-900 border-purple-100/80 dark:border-slate-800 shadow-[0_4px_16px_rgba(124,58,237,0.02)] overflow-hidden">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800/50 pb-4">
            <div className="flex items-center gap-2">
              <Lock className="h-4.5 w-4.5 text-[#7C3AED]" />
              <CardTitle className="text-base font-bold text-slate-800 dark:text-slate-100">Update Password</CardTitle>
            </div>
            <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
              Change the security password of your vault account
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSavePassword} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED] transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED] transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED] transition-all"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold py-2.5 px-6 rounded-xl text-xs shadow-md transition-all active:scale-[0.98] mt-2"
              >
                Update Password
              </button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
