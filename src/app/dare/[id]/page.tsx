'use client';
export const dynamic = 'force-dynamic';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, CheckCircle2, AlertCircle } from 'lucide-react';
import imageCompression from 'browser-image-compression';

export default function DarePage() {
  const { id } = useParams();
  const router = useRouter();
  const [dare, setDare] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'submitted' | 'error'>('idle');

  useEffect(() => {
    async function loadDare() {
      const { data } = await supabase
        .from('dares')
        .select('*')
        .eq('id', id)
        .single();
      setDare(data);
      setLoading(false);
    }
    loadDare();
  }, [id]);

  const playVoice = () => {
    if (!dare?.description_slang) return;

    // Web Speech API for zero-cost Egyptian vibe
    const utterance = new SpeechSynthesisUtterance(dare.description_slang);
    utterance.lang = 'ar-EG';
    utterance.rate = 0.9;
    utterance.pitch = 1.1;
    window.speechSynthesis.speak(utterance);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setStatus('idle');

    try {
      // Client-side compression to stay under free tier limits
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      };
      const compressedFile = await imageCompression(file, options);

      const fileName = `${Date.now()}_${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('submissions')
        .upload(`proofs/${fileName}`, compressedFile);

      if (uploadError) throw uploadError;

      const { error: submitError } = await supabase
        .from('submissions')
        .insert({
          dare_id: id,
          user_id: (await supabase.auth.getUser()).data.user?.id,
          proof_url: uploadData.path,
          judge_status: 'pending',
        });

      if (submitError) throw submitError;

      setStatus('submitted');
    } catch (err) {
      console.error(err);
      setStatus('error');
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center">جاري التحميل...</div>;
  if (!dare) return <div className="min-h-screen bg-black text-white flex items-center justify-center">التحدي غير موجود</div>;

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-red-600/20 blur-[100px] rounded-full"></div>

      <div className="z-10 w-full max-w-md text-center space-y-12">
        {/* Pulsing Character */}
        <motion.div
          animate={{
            scale: [1, 1.05, 1],
            opacity: [0.9, 1, 0.9],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="relative inline-block cursor-pointer group"
          onClick={playVoice}
        >
          <div className="absolute -inset-4 bg-red-600/30 blur-xl rounded-full group-hover:bg-red-600/50 transition-all"></div>
          <img
            src={dare.character_image_url || 'https://via.placeholder.com/200'}
            alt="The Game Master"
            className="w-48 h-48 rounded-full border-4 border-red-600 shadow-2xl relative z-10 object-cover"
          />
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-widest z-20">
            اضغط للاستماع
          </div>
        </motion.div>

        <div className="space-y-4">
          <h1 className="text-3xl font-black text-white tracking-tight">{dare.title}</h1>
          <p className="text-zinc-400 text-lg leading-relaxed px-4">
            {dare.description_slang}
          </p>
        </div>

        <div className="space-y-6">
          {status === 'submitted' ? (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center gap-3 text-green-500"
            >
              <CheckCircle2 className="w-16 h-16" />
              <p className="font-bold text-xl">تم إرسال الدليل!</p>
              <p className="text-sm text-zinc-500">استنى حكم المدير دلوقتي...</p>
            </motion.div>
          ) : (
            <div className="relative group">
              <input
                type="file"
                accept="image/*,video/*"
                className="hidden"
                id="proof-upload"
                onChange={handleUpload}
                disabled={uploading}
              />
              <label
                htmlFor="proof-upload"
                className={`
                  flex items-center justify-center gap-3 w-full py-4 rounded-2xl font-bold text-lg transition-all cursor-pointer
                  ${uploading
                    ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                    : 'bg-white text-black hover:bg-zinc-200 active:scale-95 shadow-lg'}
                `}
              >
                {uploading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-zinc-500 border-t-transparent animate-spin rounded-full"></div>
                    جاري الرفع...
                  </>
                ) : (
                  <>
                    <Upload className="w-6 h-6" />
                    ارفع الدليل
                  </>
                )}
              </label>
              {status === 'error' && (
                <div className="flex items-center justify-center gap-2 text-red-500 text-sm mt-3">
                  <AlertCircle className="w-4 h-4" />
                  حصلت مشكلة، حاول تاني
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
