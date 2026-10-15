'use client';
export const dynamic = 'force-dynamic';
import { useState } from 'react';
import { getSupabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Lock, User } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const supabase = getSupabase();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError('بيانات الدخول غلط، حاول تاني');
    } else {
      router.push('/dashboard');
    }
    setLoading(false);
  };

    if (error) {
      setError('بيانات الدخول غلط، حاول تاني');
    } else {
      router.push('/dashboard');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <div className="w-full max-w-md space-y-8 bg-zinc-900 p-8 rounded-2xl border border-zinc-800 shadow-2xl">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-white tracking-tight">اللعبة</h1>
          <p className="text-zinc-400 text-sm">ادخل عشان تبدأ التحدي</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-4">
            <div className="relative">
              <User className="absolute left-3 top-3 text-zinc-500 w-5 h-5" />
              <input
                type="email"
                placeholder="الايميل"
                className="w-full bg-zinc-800 border border-zinc-700 text-white pl-10 pr-4 py-3 rounded-lg focus:ring-2 focus:ring-red-600 outline-none transition-all text-right"
                dir="rtl"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-zinc-500 w-5 h-5" />
              <input
                type="password"
                placeholder="الباسورد"
                className="w-full bg-zinc-800 border border-zinc-700 text-white pl-10 pr-4 py-3 rounded-lg focus:ring-2 focus:ring-red-600 outline-none transition-all text-right"
                dir="rtl"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'جاري الدخول...' : 'دخول'}
          </button>
        </form>
      </div>
    </div>
  );
}
