import { useNavigate } from 'react-router';
import { useLanguage } from '../contexts/LanguageContext';
import { ArrowLeft, Check } from 'lucide-react';
import { motion } from 'motion/react';
import { frames } from '../utils/frames';
import { useState } from 'react';
import { FlowStepper } from '../components/FlowStepper';

export function FrameSelection() {
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  const [hoverFrameId, setHoverFrameId] = useState<string | null>(null);

  const handleFrameSelect = (frameId: string) => {
    sessionStorage.setItem('selectedFrameId', frameId);
    navigate('/camera');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FBF8F3] to-[#F3EDE3] text-[#2C2C2C]">
      {/* Header */}
      <div className="bg-white/50 backdrop-blur-sm border-b border-[#2C2C2C]/10 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-[#6B7280] hover:text-[#2C2C2C] transition-colors group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className={language === 'ar' ? "font-['Cairo']" : "font-['Inter']"}>
              {language === 'ar' ? 'رجوع' : 'Back'}
            </span>
          </button>

          <div className="w-20" aria-hidden />
        </div>
      </div>

      <div className="bg-[#FBF8F3]/90 border-b border-[#2C2C2C]/5 px-4 py-2">
        <div className="max-w-6xl mx-auto">
          <FlowStepper phase="frame" />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          {language === 'ar' ? (
            <h1 className="text-4xl md:text-5xl font-['Cairo'] font-bold mb-3" dir="rtl">
              اختر إطارك المفضل
            </h1>
          ) : (
            <h1 className="text-4xl md:text-5xl font-['Playfair_Display'] font-bold mb-3">
              Choose Your Frame
            </h1>
          )}
          <p className="text-[#6B7280] text-lg">
            {language === 'ar' ? (
              <span className="font-['Cairo']" dir="rtl">كل إطار يضيف لمسة خاصة لصورتك</span>
            ) : (
              <span className="font-['Inter']">Each frame adds a special touch to your photo</span>
            )}
          </p>
        </motion.div>

        <div
          className={`grid gap-8 ${
            frames.length === 1 ? 'grid-cols-1 max-w-md mx-auto' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
          }`}
        >
          {frames.map((frame, index) => (
            <motion.button
              key={frame.id}
              type="button"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => handleFrameSelect(frame.id)}
              onMouseEnter={() => setHoverFrameId(frame.id)}
              onMouseLeave={() => setHoverFrameId(null)}
              className={`
                group relative bg-white/80 backdrop-blur rounded-2xl p-5 
                transition-all duration-300 hover:scale-105 hover:shadow-2xl
                border-2
                ${
                  hoverFrameId === frame.id
                    ? 'border-[#D4AF37] shadow-[0_8px_30px_rgba(212,175,55,0.3)]'
                    : 'border-transparent hover:border-[#D4AF37]/30'
                }
              `}
            >
              <div className="bg-gradient-to-br from-[#F9FAFB] to-[#F3F4F6] rounded-xl overflow-hidden mb-4 aspect-[3/4] flex items-center justify-center p-2">
                <img
                  src={frame.imagePath}
                  alt={language === 'ar' ? frame.name.ar : frame.name.en}
                  className="w-full h-full object-contain"
                />
              </div>

              <h3 className="font-semibold text-center text-lg mb-1">
                {language === 'ar' ? (
                  <span className="font-['Cairo']">{frame.name.ar}</span>
                ) : (
                  <span className="font-['Inter']">{frame.name.en}</span>
                )}
              </h3>

              {hoverFrameId === frame.id && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-3 -right-3 w-10 h-10 bg-gradient-to-br from-[#D4AF37] to-[#B8941F] rounded-full flex items-center justify-center shadow-xl"
                >
                  <Check size={20} className="text-white" strokeWidth={3} />
                </motion.div>
              )}
            </motion.button>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-[#9CA3AF] text-sm text-center mt-12 max-w-md mx-auto"
        >
          {language === 'ar' ? (
            <span className="font-['Cairo']" dir="rtl">
              اضغط على أي إطار للمتابعة إلى الكاميرا
            </span>
          ) : (
            <span className="font-['Inter']">Click any frame to continue to the camera</span>
          )}
        </motion.p>
        <p
          className={`text-[11px] text-[#9CA3AF] text-center mt-4 max-w-md mx-auto ${language === 'ar' ? "font-['Cairo']" : "font-['Inter']"}`}
          dir={language === 'ar' ? 'rtl' : 'ltr'}
        >
          {t('privacyLocalShort')}
        </p>
      </div>
    </div>
  );
}
