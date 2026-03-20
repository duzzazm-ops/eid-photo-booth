import { useNavigate } from 'react-router';
import { useLanguage } from '../contexts/LanguageContext';
import { Camera, Image as ImageIcon, Shield, ArrowRight, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';
import { FlowStepper } from '../components/FlowStepper';

export function Home() {
  const navigate = useNavigate();
  const { language, t, isRTL } = useLanguage();

  return (
    <div className="min-h-screen bg-[#FAFAF7] text-[#1A1A1A] relative flex items-center justify-center p-4 sm:p-8 overflow-hidden">
      {/* Elegant Frame Borders */}
      <div className="absolute inset-4 sm:inset-8 border border-[#C1A67B]/30 pointer-events-none z-0"></div>
      <div className="absolute inset-[1.25rem] sm:inset-[2.25rem] border border-[#C1A67B]/10 pointer-events-none z-0"></div>

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-4xl flex flex-col items-center justify-center text-center px-6">
        
        {/* Top Accent */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="mb-12 flex flex-col items-center"
        >
          <div className="h-16 w-[1px] bg-gradient-to-b from-transparent via-[#C1A67B] to-transparent mb-6"></div>
          <span className={`text-[#C1A67B] uppercase tracking-[0.3em] text-xs font-medium ${isRTL ? "font-['Tajawal']" : "font-['Montserrat']"}`}>
            {isRTL ? 'مجموعة العيد' : 'Eid Collection'}
          </span>
        </motion.div>

        {/* Main Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="mb-8"
        >
          {isRTL ? (
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-['Amiri'] text-[#1A1A1A] leading-tight" dir="rtl">
              {t('welcome')}
            </h1>
          ) : (
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-['Cormorant_Garamond'] font-medium text-[#1A1A1A] leading-tight tracking-tight">
              {t('welcome')}
            </h1>
          )}
        </motion.div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.4 }}
          className={`max-w-2xl text-[#666666] md:text-lg leading-relaxed mb-16 ${isRTL ? "font-['Tajawal']" : "font-['Montserrat'] font-light"}`}
          dir={isRTL ? 'rtl' : 'ltr'}
        >
          {t('welcomeSubtitle')}
        </motion.p>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
        >
          <button
            onClick={() => navigate('/frames')}
            className={`group relative flex items-center justify-center gap-4 bg-[#1A1A1A] text-white px-10 py-5 overflow-hidden transition-all duration-500 hover:bg-[#2A2A2A]`}
          >
            <span className={`relative z-10 text-sm tracking-[0.2em] uppercase ${isRTL ? "font-['Tajawal']" : "font-['Montserrat']"}`}>
              {t('getStarted')}
            </span>
            <div className="relative z-10 transform transition-transform duration-500 group-hover:translate-x-2">
              {isRTL ? <ArrowLeft size={16} strokeWidth={1.5} /> : <ArrowRight size={16} strokeWidth={1.5} />}
            </div>
            {/* Subtle light effect on hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#C1A67B]/0 via-[#C1A67B]/10 to-[#C1A67B]/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out"></div>
          </button>
          <p
            className={`mt-5 text-xs text-[#888888] max-w-md mx-auto leading-relaxed ${isRTL ? "font-['Tajawal']" : "font-['Montserrat']"}`}
            dir={isRTL ? 'rtl' : 'ltr'}
          >
            {t('privacyLocalShort')}
          </p>
          <FlowStepper phase="start" className="mt-6 max-w-sm mx-auto" />
        </motion.div>

        {/* Features - Minimalist */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-12 w-full max-w-4xl border-t border-[#C1A67B]/20 pt-12"
        >
          {[
            {
              icon: <Camera size={24} strokeWidth={1} className="text-[#C1A67B]" />,
              titleEn: 'Curated Styles',
              titleAr: 'أنماط مُنتقاة',
              descEn: 'Festive frames for your portrait',
              descAr: 'إطارات احتفالية لصورتك'
            },
            {
              icon: <ImageIcon size={24} strokeWidth={1} className="text-[#C1A67B]" />,
              titleEn: 'Exclusive Frames',
              titleAr: 'إطارات حصرية',
              descEn: 'Designed for the festive season',
              descAr: 'مصممة خصيصاً لموسم الأعياد'
            },
            {
              icon: <Shield size={24} strokeWidth={1} className="text-[#C1A67B]" />,
              titleEn: 'Absolute Privacy',
              titleAr: 'خصوصية تامة',
              descEn: 'On-device processing only',
              descAr: 'تتم المعالجة على جهازك فقط'
            }
          ].map((feature, index) => (
            <div key={index} className="flex flex-col items-center text-center">
              <div className="mb-4">{feature.icon}</div>
              <h3 className={`text-sm tracking-widest uppercase mb-2 text-[#1A1A1A] ${isRTL ? "font-['Tajawal']" : "font-['Montserrat']"}`}>
                {isRTL ? feature.titleAr : feature.titleEn}
              </h3>
              <p className={`text-xs text-[#888888] ${isRTL ? "font-['Tajawal']" : "font-['Montserrat'] font-light"}`}>
                {isRTL ? feature.descAr : feature.descEn}
              </p>
            </div>
          ))}
        </motion.div>

      </div>
    </div>
  );
}