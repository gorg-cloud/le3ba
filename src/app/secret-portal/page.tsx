'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Key } from 'lucide-react';

export default function SecretPortal() {
  const [key, setKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleElevate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // In a real app, this would call a Supabase Edge Function for security.
    // For now, we simulate the key check and role update.
    const MASTER_KEY = 'LE3BA_MASTER_2026'; // This should be in an env var

    if (key === MASTER_KEY) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error } = await supabase
          .from('profiles')
          .update({ role: 'GM' })
          .eq('id', user.id);

        if (error) {
          setError('حصلت مشكلة في الترقية');
        } else {
          router.push('/gm/dashboard');
        }
      } else {
        setError('لازم تسجل دخول الأول');
      }
    } else {
      setError('الكود غلط، ابعد عن هنا');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <div className="w-full max-w-md space-y-8 bg-zinc-900 p-8 rounded-2xl border border-red-900/30 shadow-[0_0_50px_rgba(153,27,27,0.2)]">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <Key className="text-red-600 w-12 h-12 animate-pulse" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">بوابة المدير</h1>
          <p className="text-zinc-500 text-sm">مكان مخصص للـ GM بس</p>
        </div>

        <form onSubmit={handleElevate} className="space-y-6">
          <div className="relative">
            <input
              type="password"
              placeholder="كود الدخول السري"
              className="w-full bg-zinc-800 border border-zinc-700 text-white px-4 py-3 rounded-lg focus:ring-2 focus:ring-red-600 outline-none transition-all text-center"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              required
            />
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-zinc-100 hover:bg-white text-black font-bold py-3 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'جاري التحقق...' : 'فتح البوابة'}
          </button>
        </form>
      </div>
    </div>
  );
}
