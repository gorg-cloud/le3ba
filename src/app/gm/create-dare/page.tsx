'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Sparkles, Send } from 'lucide-react';

export default function CreateDare() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [playerEmail, setPlayerEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSlangify = async () => {
    if (!description) return;

    // In a real app, this would call a Gemini API endpoint to convert text to Egyptian slang.
    // For now, we simulate the "AI Polish"
    alert('جاري تحويل الكلام للغة الشارع المصرية... (This would call Gemini API)');
    setDescription(description + ' (بلهجة مصرية صايعة)');
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Find player ID by email
    const { data: user } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', playerEmail) // Simplified: using username as email for demo
      .single();

    if (!user) {
      alert('اللاعب ده مش موجود');
      setLoading(false);
      return;
    }

    const { error } = await supabase
      .from('dares')
      .insert({
        title,
        description_slang: description,
        player_id: user.id,
        status: 'active',
        point_value: 10,
      });

    if (error) {
      alert('حصلت مشكلة في إنشاء التحدي');
    } else {
      router.push('/gm/dashboard');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <header className="flex items-center gap-4 mb-8">
        <button onClick={() => router.back()} className="p-2 hover:bg-zinc-900 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-bold">إنشاء تحدي جديد</h1>
      </header>

      <form onSubmit={handleCreate} className="max-w-xl mx-auto space-y-6">
        <div className="space-y-2">
          <label className="text-zinc-500 text-sm block">اسم اللاعب</label>
          <input
            type="text"
            className="w-full bg-zinc-900 border border-zinc-800 p-3 rounded-xl focus:ring-2 focus:ring-red-600 outline-none"
            placeholder="مثلاً: mohamed_123"
            value={playerEmail}
            onChange={(e) => setPlayerEmail(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-zinc-500 text-sm block">عنوان التحدي</label>
          <input
            type="text"
            className="w-full bg-zinc-900 border border-zinc-800 p-3 rounded-xl focus:ring-2 focus:ring-red-600 outline-none"
            placeholder="مثلاً: مهمة السوبر ماركت"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-zinc-500 text-sm block">وصف التحدي (بالعامية المصرية)</label>
            <button
              type="button"
              onClick={handleSlangify}
              className="flex items-center gap-1 text-xs text-red-500 hover:text-red-400 font-bold transition-colors"
            >
              <Sparkles className="w-3 h-3" />
              تحويل لعامية
            </button>
          </div>
          <textarea
            className="w-full bg-zinc-900 border border-zinc-800 p-3 rounded-xl focus:ring-2 focus:ring-red-600 outline-none h-32 resize-none"
            placeholder="اكتب التحدي هنا..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2"
        >
          {loading ? 'جاري الإرسال...' : (
            <>
              <Send className="w-5 h-5" />
              إرسال التحدي الآن
            </>
          )}
        </button>
      </form>
    </div>
  );
}
