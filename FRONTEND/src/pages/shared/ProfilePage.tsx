import { useRef, useState } from 'react';
import { Camera, User, Mail, Briefcase, Building2, IdCard, Shield, CheckCircle2, Pencil, X, Save } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { sileo } from 'sileo';
import { motion } from 'framer-motion';

type EditableFields = {
  name: string;
  email: string;
  position: string;
  office: string;
  employeeId: string;
};

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatar ?? null);
  const [uploading, setUploading] = useState(false);

  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<EditableFields>({
    name:       user?.name       ?? '',
    email:      user?.email      ?? '',
    position:   user?.position   ?? '',
    office:     user?.office     ?? '',
    employeeId: user?.employeeId ?? '',
  });

  const initials = (form.name || user?.name || 'U')
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      sileo.error({ title: 'Invalid File', description: 'Please select a valid image file (JPG, PNG, WEBP).' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      sileo.error({ title: 'File Too Large', description: 'Image must be under 5MB.' });
      return;
    }
    setUploading(true);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setAvatarPreview(dataUrl);
      updateUser({ avatar: dataUrl });
      setUploading(false);
      sileo.success({ title: 'Profile Picture Updated', description: 'Your avatar has been saved successfully.' });
    };
    reader.onerror = () => {
      setUploading(false);
      sileo.error({ title: 'Upload Failed', description: 'Could not read the selected image.' });
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSave = () => {
    if (!form.name.trim()) {
      sileo.error({ title: 'Name Required', description: 'Full name cannot be empty.' });
      return;
    }
    if (!form.email.trim() || !form.email.includes('@')) {
      sileo.error({ title: 'Invalid Email', description: 'Please enter a valid email address.' });
      return;
    }
    updateUser({
      name:       form.name.trim(),
      email:      form.email.trim(),
      position:   form.position.trim(),
      office:     form.office.trim(),
      employeeId: form.employeeId.trim(),
    });
    setIsEditing(false);
    sileo.success({ title: 'Profile Saved', description: 'Your information has been updated successfully.' });
  };

  const handleCancel = () => {
    setForm({
      name:       user?.name       ?? '',
      email:      user?.email      ?? '',
      position:   user?.position   ?? '',
      office:     user?.office     ?? '',
      employeeId: user?.employeeId ?? '',
    });
    setIsEditing(false);
  };

  const editableFields: { key: keyof EditableFields; label: string; icon: React.ElementType; placeholder: string }[] = [
    { key: 'name',       label: 'Full Name',   icon: User,      placeholder: 'e.g. Juan dela Cruz' },
    { key: 'email',      label: 'Email',       icon: Mail,      placeholder: 'e.g. juan@opg.gov.ph' },
    { key: 'position',   label: 'Position',    icon: Briefcase, placeholder: 'e.g. Budget Officer' },
    { key: 'office',     label: 'Office',      icon: Building2, placeholder: 'e.g. Finance Office' },
    { key: 'employeeId', label: 'Employee ID', icon: IdCard,    placeholder: 'e.g. EMP-001' },
  ];

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <PageHeader
        title="My Profile"
        description="View and edit your account details, and customise your profile picture."
        icon={User}
      />

      {/* Avatar Card */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <Card className="shadow-sm border-slate-200 overflow-hidden">
          <div className="h-28 w-full" style={{ background: 'linear-gradient(135deg, #0F2557, #1D4ED8, #7C3AED)' }} />
          <CardContent className="px-6 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className="w-24 h-24 rounded-2xl border-4 border-white shadow-lg overflow-hidden bg-gradient-to-br from-blue-700 to-violet-700 flex items-center justify-center">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-white text-3xl font-bold">{initials}</span>
                  )}
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-700 border-2 border-white shadow-md flex items-center justify-center transition-colors"
                  title="Change profile picture"
                >
                  <Camera className="w-4 h-4 text-white" />
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </div>

              {/* Name & role */}
              <div className="flex-1 min-w-0 pb-1">
                <h2 className="text-xl font-bold text-slate-900 truncate">{user?.name}</h2>
                <p className="text-sm text-slate-500 truncate">{user?.position}</p>
                <div className="mt-1.5 flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${user?.role === 'admin' ? 'bg-violet-100 text-violet-700' : 'bg-blue-100 text-blue-700'}`}>
                    <Shield className="w-3 h-3" />
                    {user?.role === 'admin' ? 'Administrator' : 'Standard User'}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                    <CheckCircle2 className="w-3 h-3" /> Active
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 self-end">
                <Button size="sm" variant="outline" className="gap-2 text-xs font-semibold border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-700" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                  <Camera className="w-3.5 h-3.5" />
                  {uploading ? 'Uploading...' : 'Change Photo'}
                </Button>
                {!isEditing ? (
                  <Button size="sm" className="gap-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm" onClick={() => setIsEditing(true)}>
                    <Pencil className="w-3.5 h-3.5" /> Edit Profile
                  </Button>
                ) : (
                  <>
                    <Button size="sm" variant="outline" className="gap-2 text-xs font-semibold text-slate-600 border-slate-200" onClick={handleCancel}>
                      <X className="w-3.5 h-3.5" /> Cancel
                    </Button>
                    <Button size="sm" className="gap-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm" onClick={handleSave}>
                      <Save className="w-3.5 h-3.5" /> Save Changes
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Details / Edit Card */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }}>
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="pb-3 border-b flex-row items-center justify-between gap-4 space-y-0">
            <div>
              <CardTitle className="text-base font-bold text-slate-800">Account Information</CardTitle>
              <CardDescription className="text-xs mt-0.5">
                {isEditing ? 'Edit your details below and click Save Changes.' : 'Your personal and employment details.'}
              </CardDescription>
            </div>
            {isEditing && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-[11px] font-semibold">
                <Pencil className="w-3 h-3" /> Editing
              </span>
            )}
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {editableFields.map(({ key, label, icon: Icon, placeholder }) => (
                <div key={key} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50/60 transition-colors">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 border ${isEditing ? 'bg-blue-600 border-blue-500' : 'bg-blue-50 border-blue-100'}`}>
                    <Icon className={`w-4 h-4 ${isEditing ? 'text-white' : 'text-blue-600'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-slate-400 uppercase tracking-wider font-medium mb-0.5">{label}</p>
                    {isEditing ? (
                      <Input
                        value={form[key]}
                        onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                        placeholder={placeholder}
                        className="h-8 text-sm font-medium border-slate-200 focus:border-blue-400 bg-white"
                      />
                    ) : (
                      <p className="text-sm font-semibold text-slate-800 truncate">{user?.[key] ?? '—'}</p>
                    )}
                  </div>
                </div>
              ))}

              {/* Role — always read-only */}
              <div className="flex items-center gap-4 px-6 py-4 bg-slate-50/40">
                <div className="w-9 h-9 rounded-lg bg-violet-50 border border-violet-100 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-4 h-4 text-violet-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-slate-400 uppercase tracking-wider font-medium mb-0.5">Role</p>
                  <p className="text-sm font-semibold text-slate-800">{user?.role === 'admin' ? 'Administrator' : 'Standard User'}</p>
                </div>
                <span className="text-[10px] text-slate-400 italic">System-assigned · not editable</span>
              </div>
            </div>

            {/* Save / Cancel footer in edit mode */}
            {isEditing && (
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t bg-slate-50/60">
                <Button variant="ghost" size="sm" className="text-xs" onClick={handleCancel}>
                  <X className="w-3.5 h-3.5 mr-1.5" /> Cancel
                </Button>
                <Button size="sm" className="text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5" onClick={handleSave}>
                  <Save className="w-3.5 h-3.5" /> Save Changes
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Tips */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.2 }}>
        <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-blue-50 border border-blue-100">
          <Camera className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-blue-700 leading-relaxed">
            <strong>Profile photo tips:</strong> Use a clear, well-lit photo of your face. Accepted formats: JPG, PNG, WEBP. Max file size is <strong>5MB</strong>. Changes are saved to your session.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
