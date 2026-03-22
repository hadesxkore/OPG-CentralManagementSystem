import { useState, useEffect } from 'react';
import { Users, Search, PlusCircle, ShieldCheck, User as UserIcon, Edit2, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { sileo } from 'sileo';
import { db, secondaryAuth } from '@/backend/firebase';
import { collection, doc, setDoc, onSnapshot, updateDoc, deleteDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';

type AppUser = {
  id: string;
  name: string;
  email: string;
  username: string;
  office: string;
  employeeId?: string;
  role: 'admin' | 'user' | 'pops';
  destination: 'Central Users' | 'POPS';
  status: 'Active' | 'Inactive';
};

export default function UserManagementPage() {
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<AppUser[]>([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editDocId, setEditDocId] = useState<string | null>(null);
  const [userToDelete, setUserToDelete] = useState<AppUser | null>(null);

  // Form State
  const [fullName, setFullName] = useState('');
  const [office, setOffice] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [roleDest, setRoleDest] = useState<'admin' | 'user' | 'pops'>('user');

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'users'), (snap) => {
      const parsed: AppUser[] = snap.docs.map(d => ({ id: d.id, ...d.data() } as AppUser));
      setUsers(parsed);
    }, (error) => {
      console.error(error);
      sileo.error({ title: "Database Locked", description: "Set Firestore SEC RULES to true to load users." });
    });
    return () => unsub();
  }, []);

  const resetForm = () => {
    setEditDocId(null);
    setFullName(''); setOffice(''); setUsername(''); setEmail('');
    setPassword(''); setConfirmPassword(''); setRoleDest('user');
  };

  const handleSaveUser = () => {
    if (!fullName || !office || !username || !email) {
       return sileo.error({ title: 'Validation', description: 'Core fields must be filled.' });
    }
    
    // Only strictly validate passwords if creating a brand new account mapped to Auth
    if (!editDocId) {
       if (!password || !confirmPassword) return sileo.error({ title: 'Validation', description: 'Passwords are required.' });
       if (password !== confirmPassword) return sileo.error({ title: 'Validation', description: 'Passwords do not match!' });
       if (password.length < 6) return sileo.error({ title: 'Weak Password', description: 'Firebase enforces a minimum of 6 characters.' });
    }

    setIsSaving(true);
    const savePromise = new Promise(async (resolve, reject) => {
      try {
        const destination = roleDest === 'pops' ? 'POPS' : 'Central Users';

        if (editDocId) {
          // Update routine cleanly passing directly into firestore bypassing redundant auth hooks
          await updateDoc(doc(db, 'users', editDocId), {
            name: fullName,
            username: username.toLowerCase(),
            office: office,
            role: roleDest,
            destination: destination
          });
          resolve(true);
        } else {
          // 1. Create User internally without kicking Admin natively pulling exact specified Email mapping
          const userCred = await createUserWithEmailAndPassword(secondaryAuth, email, password);
          await updateProfile(userCred.user, { displayName: fullName });

          // 2. Post Document to firestore securely tracking detached properties
          await setDoc(doc(db, 'users', userCred.user.uid), {
            name: fullName,
            username: username.toLowerCase(),
            email: email,
            office: office,
            employeeId: `OPG-${Math.floor(Math.random() * 8000 + 1000)}`, // Random ID gen for table aesthetics
            role: roleDest,
            destination: destination,
            status: 'Active',
            createdAt: new Date().toISOString()
          });

          // 3. Sign out of secondary auth cache so the next creation is pure
          await secondaryAuth.signOut();
          resolve(true);
        }
      } catch (err: any) {
        reject(err.message || 'Firebase mapping failed.');
      } finally {
        setIsSaving(false);
      }
    });

    sileo.promise(savePromise, {
      loading: { title: editDocId ? 'Updating Mapping...' : 'Authenticating User to Cloud...' },
      success: () => {
         setModalOpen(false);
         resetForm();
         return { title: editDocId ? 'Profile Updated' : 'Account Verified', description: `${fullName} has been granted access.` };
      },
      error: (e) => ({ title: editDocId ? 'Update Failed' : 'Creation Failed', description: String(e) })
    });
  };

  const handleEditClick = (u: AppUser) => {
    setEditDocId(u.id);
    setFullName(u.name);
    setOffice(u.office);
    setUsername(u.username);
    setEmail(u.email);
    setRoleDest(u.role);
    setModalOpen(true);
  };

  const confirmDelete = () => {
    if (!userToDelete) return;
    sileo.promise(deleteDoc(doc(db, 'users', userToDelete.id)), {
      loading: { title: 'Revoking Global Access...' },
      success: () => {
        setUserToDelete(null);
        return { title: 'Access Purged', description: 'The custom user tree block has been cleanly detached dynamically!' };
      },
      error: (e) => ({ title: 'Failed to Drop Table', description: String(e) })
    });
  };

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    u.office.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="User Management"
        description="Manage system users tracking exact real-time FireStore statuses"
        icon={Users}
        actions={
          <Button onClick={() => { resetForm(); setModalOpen(true); }} size="sm" className="gap-2 text-xs" style={{ background: '#1D4ED8' }}>
            <PlusCircle className="w-3.5 h-3.5" /> Add User
          </Button>
        }
      />

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Users', value: users.length, color: 'text-slate-800' },
          { label: 'Admins', value: users.filter(u => u.role === 'admin').length, color: 'text-blue-700' },
          { label: 'POPS Users', value: users.filter(u => u.role === 'pops').length, color: 'text-emerald-700' },
          { label: 'Central Users', value: users.filter(u => u.destination === 'Central Users').length, color: 'text-cyan-700' },
        ].map(s => (
          <Card key={s.label} className="shadow-sm border-slate-100">
            <CardContent className="p-4 text-center">
              <p className={`text-3xl font-bold font-mono ${s.color}`}>{s.value}</p>
              <p className="text-xs text-slate-500 mt-1">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="shadow-sm border-slate-100">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-base font-semibold">All Authorized Users</CardTitle>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <Input placeholder="Search user..." className="pl-8 h-8 text-xs w-48" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
             <div className="py-12 text-center text-slate-400 text-sm font-medium">No users mapped in Firebase Database. Hit "Add User" to begin!</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[700px]">
                <thead>
                  <tr className="border-b-2 border-slate-100">
                    {['Account', 'Employee ID', 'Destination / Role', 'Office', 'Status', ''].map(h => (
                      <th key={h} className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider pb-3 pr-4 last:pr-0">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filtered.map(u => {
                    const initials = u.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
                    return (
                      <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                              style={{ background: u.role === 'admin' ? 'linear-gradient(135deg,#1D4ED8,#7C3AED)' : u.role === 'pops' ? 'linear-gradient(135deg,#16A34A,#059669)' : 'linear-gradient(135deg,#0EA5E9,#0284C7)' }}>
                              {initials}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-800">{u.name}</p>
                              <p className="text-[10px] text-slate-400">@{u.username} • {u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 pr-4 text-xs font-mono text-slate-600">{u.employeeId || '—'}</td>
                        <td className="py-3 pr-4">
                          <div className={`inline-flex flex-col gap-0.5 px-2.5 py-1 rounded-lg border ${u.role === 'admin' ? 'bg-blue-50/50 border-blue-100 text-blue-700' : u.role === 'pops' ? 'bg-emerald-50/50 border-emerald-100 text-emerald-700' : 'bg-slate-50 border-slate-100 text-slate-600'}`}>
                             <span className="flex items-center gap-1 font-bold text-[11px] uppercase tracking-wide">
                               {u.role === 'admin' ? <ShieldCheck className="w-3 h-3" /> : <UserIcon className="w-3 h-3" />}
                               {u.role} Account
                             </span>
                             <span className="text-[10px] opacity-70 font-medium">Dest: {u.destination}</span>
                          </div>
                        </td>
                        <td className="py-3 pr-4 text-xs font-medium text-slate-600 max-w-[150px] truncate">{u.office}</td>
                        <td className="py-3 pr-4">
                          <span className={`text-xs font-bold px-2 py-1 rounded-full ${u.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                            {u.status}
                          </span>
                        </td>
                        <td className="py-3 pr-2">
                          <div className="flex items-center justify-end gap-1.5">
                            <button onClick={() => handleEditClick(u)} className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors" title="Edit Properties">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button onClick={() => setUserToDelete(u)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors" title="Drop Access">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── ADD USER MODAL ──────────────────────────────────────────── */}
      <Dialog open={isModalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden">
          <DialogHeader className="px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 border-b">
            <DialogTitle className="text-white font-bold flex items-center gap-2 text-base">
              {editDocId ? <Edit2 className="w-4 h-4" /> : <PlusCircle className="w-4 h-4" />}
              {editDocId ? 'Edit User Properties' : 'Create User Account'}
            </DialogTitle>
          </DialogHeader>

          <div className="px-6 py-5 flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5 col-span-2">
                <label className="text-xs font-semibold text-slate-600">Full Name</label>
                <Input className="h-9 text-sm" placeholder="Juan Dela Cruz" value={fullName} onChange={e => setFullName(e.target.value)} />
              </div>
              <div className="space-y-1.5 col-span-2">
                <label className="text-xs font-semibold text-slate-600">Office Dept.</label>
                <Input className="h-9 text-sm" placeholder="e.g. Budget Office" value={office} onChange={e => setOffice(e.target.value)} />
              </div>
              <div className="space-y-1.5 col-span-2 sm:col-span-1">
                <label className="text-xs font-semibold text-slate-600">Username</label>
                <Input className="h-9 text-sm" placeholder="e.g. juan.dela" value={username} onChange={e => setUsername(e.target.value.toLowerCase())} />
              </div>
              <div className="space-y-1.5 col-span-2 sm:col-span-1">
                <label className="text-xs font-semibold text-slate-600">Email Address {editDocId && '(Locked)'}</label>
                <Input disabled={!!editDocId} type="email" className={`h-9 text-sm ${editDocId ? 'bg-slate-100/50 cursor-not-allowed text-slate-400' : ''}`} placeholder="juan@opg.gov.ph" value={email} onChange={e => setEmail(e.target.value.toLowerCase())} />
              </div>
            </div>

            {!editDocId && (
              <div className="grid grid-cols-2 gap-4 pt-1">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600">Password</label>
                  <Input type="password" placeholder="••••••••" className="h-9 text-sm" value={password} onChange={e => setPassword(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600">Confirm Password</label>
                  <Input type="password" placeholder="••••••••" className="h-9 text-sm" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
                </div>
              </div>
            )}

            <div className="space-y-1.5 pt-1">
              <label className="text-xs font-semibold text-slate-600">Access Role & Destination</label>
              <div className="grid grid-cols-3 gap-2 mt-1">
                {(['admin', 'user', 'pops'] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setRoleDest(r)}
                    className={`h-11 capitalize text-xs font-bold rounded-lg border-2 transition-all ${roleDest === r ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-100 hover:border-slate-200 text-slate-500'}`}
                  >
                    {r}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Destinations inherently mapped. Admin/User maps to <strong className="text-blue-500">Central Users</strong>. POPS maps to <strong className="text-emerald-500">POPS</strong> exclusively.
              </p>
            </div>
          </div>

          <DialogFooter className="px-6 py-4 bg-slate-50 border-t flex items-center justify-end gap-2">
            <Button variant="ghost" className="h-9 text-xs font-semibold" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button disabled={isSaving} onClick={handleSaveUser} className="h-9 text-xs font-bold text-white px-6" style={{ background: '#1D4ED8' }}>
              {isSaving ? 'Processing...' : editDocId ? 'Save Changes' : 'Save User Access'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── DELETE CONFIRMATION MODAL ───────────────────────────────── */}
      <Dialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden">
          <DialogHeader className="px-6 py-4 bg-red-50 border-b border-red-100">
            <DialogTitle className="text-red-700 font-bold flex items-center gap-2 text-base">
              <Trash2 className="w-5 h-5 text-red-500" />
              Confirm Access Revocation
            </DialogTitle>
          </DialogHeader>
          <div className="px-6 py-5">
            <p className="text-sm text-slate-600 leading-relaxed">
              Are you sure you want to permanently delete the profile mapping for <strong className="text-slate-900">{userToDelete?.name}</strong>?
              This action will instantly block them from accessing the application and cannot be undone.
            </p>
          </div>
          <DialogFooter className="px-6 py-4 bg-slate-50 border-t flex items-center justify-end gap-2">
            <Button variant="ghost" className="h-9 text-xs font-semibold" onClick={() => setUserToDelete(null)}>Cancel</Button>
            <Button onClick={confirmDelete} className="h-9 text-xs font-bold text-white px-6 bg-red-600 hover:bg-red-700">
              Yes, Delete Profile
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
