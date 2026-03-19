import { useNavigate } from 'react-router';
import { useLanguage } from '../contexts/LanguageContext';
import { Camera, Film, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';
import { CaptureMode } from '../types/photobooth';
import { FlowStepper } from '../components/FlowStepper';

export function ModeSelection() {
  const navigate = useNavigate();
  const { language, t } = useLanguage();

  const handleModeSelect = (mode: CaptureMode) => {
    sessionStorage.setItem('captureMode', mode);
    navigate('/frames');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FBF8F3] to-[#F3EDE3] text-[#2C2C2C]">
      {/* Header */}
      <div className="bg-white/50 backdrop-blur-sm border-b border-[#2C2C2C]/10 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-[#6B7280] hover:text-[#2C2C2C] transition-colors group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className={language === 'ar' ? "font-['Cairo']" : "font-['Inter']"}>
              {language === 'ar' ? 'رجوع' : 'Back'}
            </span>
          </button>
        </div>
      </div>

      <div className="bg-[#FBF8F3]/90 border-b border-[#2C2C2C]/5 px-4 py-2">
        <div className="max-w-6xl mx-auto">
          <FlowStepper phase="mode" />
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col items-center justify-center px-6 py-16 min-h-[calc(100vh-80px)]">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          {language === 'ar' ? (
            <h1 className="text-4xl md:text-5xl font-['Cairo'] font-bold mb-3" dir="rtl">
              اختر نمط الالتقاط
            </h1>
          ) : (
            <h1 className="text-4xl md:text-5xl font-['Playfair_Display'] font-bold mb-3">
              Choose Your Style
            </h1>
          )}
          <p className="text-[#6B7280] text-lg">
            {language === 'ar' ? (
              <span className="font-['Cairo']" dir="rtl">كيف تود أن تلتقط لحظاتك؟</span>
            ) : (
              <span className="font-['Inter']">How would you like to capture your moments?</span>
            )}
          </p>
        </motion.div>

        {/* Mode Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl w-full">
          {/* Single Photo Mode */}
          <motion.button
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            onClick={() => handleModeSelect('single')}
            className="group relative bg-white/80 backdrop-blur rounded-3xl p-6 sm:p-10 hover:shadow-2xl transition-shadow duration-300 border-2 border-transparent hover:border-[#D4AF37]/30 overflow-hidden touch-manipulation text-left sm:text-center"
          >
            {/* Gradient overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <div className="relative flex flex-col items-center">
              {/* Icon */}
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-[#D4AF37] to-[#B8941F] rounded-2xl flex items-center justify-center mb-5 sm:mb-6 group-hover:scale-105 transition-transform duration-300 shadow-lg group-hover:shadow-[#D4AF37]/30">
                <Camera size={40} className="text-white" strokeWidth={1.5} />
              </div>
              
              {/* Title */}
              <h2 className="text-2xl md:text-3xl font-bold mb-3">
                {language === 'ar' ? (
                  <span className="font-['Cairo']">صورة واحدة</span>
                ) : (
                  <span className="font-['Playfair_Display']">Single Photo</span>
                )}
              </h2>
              
              {/* Description */}
              <p className="text-[#6B7280] text-center mb-6 leading-relaxed">
                {language === 'ar' ? (
                  <span className="font-['Cairo']" dir="rtl">
                    التقط صورة واحدة مميزة<br />مع إطار كامل احتفالي
                  </span>
                ) : (
                  <span className="font-['Inter']">
                    Capture one beautiful photo<br />with a full festive frame
                  </span>
                )}
              </p>

              {/* Preview illustration */}
              <div className="w-40 h-40 bg-gradient-to-br from-[#FBF8F3] to-[#F3EDE3] rounded-2xl border-2 border-[#2C2C2C]/10 flex items-center justify-center shadow-inner">
                <div className="w-32 h-32 bg-gradient-to-br from-[#D4E8D4] to-[#D6E9F5] rounded-xl"></div>
              </div>
            </div>
          </motion.button>

          {/* Photo Strip Mode */}
          <motion.button
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            onClick={() => handleModeSelect('strip')}
            className="group relative bg-white/80 backdrop-blur rounded-3xl p-6 sm:p-10 hover:shadow-2xl transition-shadow duration-300 border-2 border-transparent hover:border-[#D4AF37]/30 overflow-hidden touch-manipulation text-left sm:text-center"
          >
            {/* Gradient overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <div className="relative flex flex-col items-center">
              {/* Icon */}
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-[#D4AF37] to-[#B8941F] rounded-2xl flex items-center justify-center mb-5 sm:mb-6 group-hover:scale-105 transition-transform duration-300 shadow-lg group-hover:shadow-[#D4AF37]/30">
                <Film size={40} className="text-white" strokeWidth={1.5} />
              </div>
              
              {/* Title */}
              <h2 className="text-2xl md:text-3xl font-bold mb-3">
                {language === 'ar' ? (
                  <span className="font-['Cairo']">شريط صور</span>
                ) : (
                  <span className="font-['Playfair_Display']">Photo Strip</span>
                )}
              </h2>
              
              {/* Description */}
              <p className="text-[#6B7280] text-center mb-6 leading-relaxed">
                {language === 'ar' ? (
                  <span className="font-['Cairo']" dir="rtl">
                    أربع صور متتالية<br />على شكل شريط كلاسيكي
                  </span>
                ) : (
                  <span className="font-['Inter']">
                    Four sequential photos<br />in a classic strip format
                  </span>
                )}
              </p>

              {/* Preview illustration */}
              <div className="w-40 h-48 bg-gradient-to-br from-[#FBF8F3] to-[#F3EDE3] rounded-2xl border-2 border-[#2C2C2C]/10 p-3 flex flex-col gap-2 shadow-inner">
                {[1, 2, 3, 4].map((i) => (
                  <div 
                    key={i} 
                    className="flex-1 bg-gradient-to-br from-[#D4E8D4] to-[#D6E9F5] rounded-lg"
                  ></div>
                ))}
              </div>
            </div>
          </motion.button>
        </div>

        {/* Info text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-[#9CA3AF] text-sm text-center mt-12 max-w-md"
        >
          {language === 'ar' ? (
            <span className="font-['Cairo']" dir="rtl">
              اختر النمط ثم الإطار ثم التقاط الصورة — الخطوات واضحة أدناه
            </span>
          ) : (
            <span className="font-['Inter']">
              Next: choose a frame, then capture — follow the steps above.
            </span>
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
