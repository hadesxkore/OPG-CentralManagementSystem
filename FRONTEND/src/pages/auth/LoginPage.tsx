import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Building2, ShieldCheck, Lock, Mail } from 'lucide-react';
import { sileo } from 'sileo';
import { useAuthStore } from '@/stores/authStore';
import { auth, db } from '@/backend/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

type LoginForm = z.infer<typeof loginSchema>;

const featuredStats = [
  { label: 'Total Appropriation', value: '₱80.4M' },
  { label: 'Active Offices', value: '8' },
  { label: 'Pending Requests', value: '4' },
  { label: 'Utilization Rate', value: '60.4%' },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      // 1. First ping Firestore to find the target email mapped to their exact username
      const q = query(collection(db, 'users'), where('username', '==', data.username.toLowerCase()));
      const snap = await getDocs(q);
      
      if (snap.empty) {
        throw new Error('Invalid username mapping.');
      }
      
      const firestoreUser = snap.docs[0].data();
      const matchedEmail = firestoreUser.email;

      // 2. Pass the fetched secure email block down into Firebase Native wrapper
      const cred = await signInWithEmailAndPassword(auth, matchedEmail, data.password);
      
      // 3. Update active context store
      useAuthStore.setState({ 
        user: {
           id: cred.user.uid,
           name: firestoreUser.name,
           email: firestoreUser.email,
           role: firestoreUser.role,
           office: firestoreUser.office,
           position: firestoreUser.position || '',
           employeeId: firestoreUser.employeeId || ''
        }, 
        isAuthenticated: true 
      });

      sileo.success({ title: 'Welcome back!', description: firestoreUser.name || 'Signed in securely' });
      
      const dest = firestoreUser.role === 'admin' ? '/admin/dashboard'
                 : firestoreUser.role === 'pops'  ? '/pops/dashboard'
                 : '/user/dashboard';
      navigate(dest, { replace: true });
    } catch (err: any) {
      console.error(err);
      sileo.error({ title: 'Login failed', description: 'Invalid email/username or password.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div
        className="hidden lg:flex lg:w-[55%] flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0F2557 0%, #1E3A8A 50%, #1D4ED8 100%)' }}
      >
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full" style={{ background: 'rgba(255,255,255,0.04)' }} />
          <div className="absolute bottom-0 -left-24 w-80 h-80 rounded-full" style={{ background: 'rgba(255,255,255,0.03)' }} />
          <div className="absolute top-1/2 left-1/3 w-64 h-64 rounded-full" style={{ background: 'rgba(255,255,255,0.02)' }} />
        </div>

        {/* Top logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center">
              <Building2 className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-xl">OPG Central</p>
              <p className="text-blue-200/70 text-xs font-medium">Central Management System</p>
            </div>
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <h1 className="text-4xl font-bold text-white leading-tight mb-4">
              Empowering<br />Transparent<br />Governance
            </h1>
            <p className="text-blue-200/80 text-base leading-relaxed max-w-sm">
              A centralized budget monitoring and e-request management system for the Office of the Provincial Governor.
            </p>
          </motion.div>
        </div>

        {/* Stats grid */}
        <div className="relative z-10">
          <div className="grid grid-cols-2 gap-3 mb-8">
            {featuredStats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.07 }}
                className="rounded-xl p-4"
                style={{ background: 'rgba(255,255,255,0.08)' }}
              >
                <p className="text-blue-200/60 text-xs mb-1">{stat.label}</p>
                <p className="text-white text-xl font-bold font-mono">{stat.value}</p>
              </motion.div>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <p className="text-blue-200/60 text-xs">Secured · Government Compliant · Data Privacy Act 2012</p>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-slate-50">
        <motion.div
          className="w-full max-w-[420px]"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#1E3A8A' }}>
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <p className="text-slate-900 font-bold text-xl">OPG Central</p>
          </div>

          <div className="mb-4">
            <h2 className="text-2xl font-bold text-slate-900">Welcome back</h2>
            <p className="text-slate-500 text-sm mt-1">Sign in to access your dashboard</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="username" className="text-sm font-medium text-slate-700">Username</Label>
              <div className="relative mt-1.5">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  id="username"
                  type="text"
                  placeholder="e.g. pgo.admin2026"
                  className="pl-10 h-11 bg-white border-slate-200 focus:border-blue-400 focus:ring-blue-400/20"
                  {...register('username')}
                />
              </div>
              {errors.username && <p className="mt-1 text-xs text-red-500">{errors.username.message}</p>}
            </div>

            <div>
              <Label htmlFor="password" className="text-sm font-medium text-slate-700">Password</Label>
              <div className="relative mt-1.5">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="pl-10 pr-10 h-11 bg-white border-slate-200 focus:border-blue-400 focus:ring-blue-400/20"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
            </div>



            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 text-sm font-semibold transition-all duration-200 hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #1D4ED8, #1E3A8A)' }}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : 'Sign In'}
            </Button>
          </form>

          <p className="mt-8 text-center text-xs text-slate-400">
            © 2026 Office of the Provincial Governor · All rights reserved
          </p>
        </motion.div>
      </div>
    </div>
  );
}
