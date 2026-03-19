import { useNavigate } from 'react-router';
import { useLanguage } from '../contexts/LanguageContext';
import { ArrowLeft, Camera as CameraIcon, RefreshCcw, Timer, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CaptureMode, FilterType, CapturedPhoto, Frame } from '../types/photobooth';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { frames } from '../utils/frames';
import { useCamera } from '../hooks/useCamera';
import { usePhotoCapture } from '../hooks/usePhotoCapture';
import { FlowStepper } from '../components/FlowStepper';

export function Camera() {
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const [captureMode, setCaptureMode] = useState<CaptureMode>('single');
  const [selectedFrame, setSelectedFrame] = useState<Frame | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('none');
  const [timerDuration, setTimerDuration] = useState<number>(3);
  const [capturedPhotos, setCapturedPhotos] = useState<CapturedPhoto[]>([]);
  const [cameraMessage, setCameraMessage] = useState('');
  const [flashEffect, setFlashEffect] = useState(false);
  const [customText, setCustomText] = useState({
    arabic: 'عيد سعيد',
    familyName: '',
    yearLabel: 'Eid 2026',
  });

  const filters: FilterType[] = ['none', 'soft', 'bw', 'warm', 'vintage', 'cool'];
  const frameRatio = selectedFrame?.ratio ?? 3 / 4;
  const photoAreaStyle = useMemo(() => {
    if (!selectedFrame) return { inset: '0%' };
    const { x, y, width, height } = selectedFrame.photoArea;
    return {
      left: `${x}%`,
      top: `${y}%`,
      width: `${width}%`,
      height: `${height}%`,
    };
  }, [selectedFrame]);

  const {
    stream,
    isStarting,
    permissionState,
    errorMessage,
    facingMode,
    startCamera,
    switchCamera,
  } = useCamera({ videoRef, defaultFacingMode: 'user' });

  const playShutterSound = () => {
    try {
      const ctx = new (window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext)();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      oscillator.type = 'triangle';
      oscillator.frequency.value = 900;
      gainNode.gain.value = 0.04;
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      oscillator.start();
      oscillator.stop(ctx.currentTime + 0.07);
    } catch {
      // Audio feedback is optional and may fail on restricted browsers.
    }
  };

  const {
    countdown,
    isCapturing,
    isProcessing,
    startCaptureSequence,
    finishProcessing,
  } = usePhotoCapture({
    videoRef,
    mode: captureMode,
    timerDuration,
    selectedFilter,
    isMirrored: facingMode === 'user',
    onFlash: () => {
      setFlashEffect(true);
      setTimeout(() => setFlashEffect(false), 200);
    },
    onShutter: playShutterSound,
    onPhotoCaptured: (photo) => {
      setCapturedPhotos((prev) => [...prev, photo]);
    },
  });

  useEffect(() => {
    const mode = sessionStorage.getItem('captureMode') as CaptureMode;
    const frameId = sessionStorage.getItem('selectedFrameId');
    
    if (!mode || !frameId) {
      navigate('/mode');
      return;
    }
    
    const frame = frames.find(f => f.id === frameId);
    if (!frame) {
      navigate('/frames');
      return;
    }
    if (frame.mode !== mode) {
      navigate('/frames');
      return;
    }
    
    setCaptureMode(mode);
    setSelectedFrame(frame);
  }, [navigate]);

  useEffect(() => {
    if (!selectedFrame) return;
    startCamera();
  }, [selectedFrame, startCamera]);

  useEffect(() => {
    if (permissionState === 'denied') {
      setCameraMessage(language === 'ar' ? 'تم رفض إذن الكاميرا. فعّل الإذن ثم أعد المحاولة.' : 'Camera permission denied. Enable camera access and try again.');
    } else if (permissionState === 'unsupported') {
      setCameraMessage(language === 'ar' ? 'المتصفح لا يدعم الوصول للكاميرا.' : 'This browser does not support camera access.');
    } else if (permissionState === 'error') {
      if (errorMessage.includes('HTTPS') || errorMessage.includes('secure')) {
        setCameraMessage(
          language === 'ar'
            ? 'الكاميرا تحتاج اتصالاً آمناً (HTTPS). استخدم رابط يبدأ بـ https أو جرّب على شبكة مختلفة.'
            : errorMessage
        );
      } else {
        setCameraMessage(language === 'ar' ? 'تعذر تشغيل الكاميرا.' : 'Could not start camera.');
      }
    } else {
      setCameraMessage('');
    }
  }, [errorMessage, language, permissionState]);

  const startCountdownCapture = async () => {
    if (!stream || isCapturing || isProcessing) return;
    setCapturedPhotos([]);
    setCameraMessage('');
    const photos = await startCaptureSequence();
    if (!photos.length) {
      finishProcessing();
      return;
    }
    if (captureMode === 'strip' && photos.length < 4) {
      setCameraMessage(language === 'ar' ? 'تعذر التقاط ٤ صور كاملة، حاول مرة أخرى.' : 'Could not capture all 4 strip photos. Please retry.');
      finishProcessing();
      return;
    }

    sessionStorage.setItem('capturedPhotos', JSON.stringify(photos));
    sessionStorage.setItem('customText', JSON.stringify(customText));
    setTimeout(() => {
      finishProcessing();
      navigate('/preview');
    }, 450);
  };

  const statusText = useMemo(() => {
    if (isProcessing) return language === 'ar' ? '✨ جاري معالجة الصورة...' : '✨ Processing final image...';
    if (isCapturing) return language === 'ar' ? '⏱️ جاري التصوير...' : '⏱️ Capturing...';
    if (captureMode === 'strip') return language === 'ar' ? '4 صور متتالية' : '4 photos in sequence';
    return language === 'ar' ? 'جاهز للتصوير' : 'Ready to capture';
  }, [captureMode, isCapturing, isProcessing, language]);

  if (!selectedFrame) return null;

  return (
    <div className="min-h-[100dvh] bg-[#2C2C2C] text-white flex flex-col">
      {/* Flash effect */}
      <AnimatePresence>
        {flashEffect && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white z-50 pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* Countdown overlay */}
      <AnimatePresence>
        {countdown !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 backdrop-blur-sm pointer-events-none"
          >
            <motion.div
              key={countdown}
              initial={{ scale: 2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              className="text-[clamp(4.5rem,22vw,11rem)] font-bold text-white drop-shadow-[0_0_40px_rgba(212,175,55,0.8)]"
            >
              {countdown === 0 ? '📸' : countdown}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="bg-black/50 backdrop-blur-md border-b border-white/10 z-10 shrink-0">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-3 flex items-center justify-between gap-2">
          <button
            onClick={() => navigate('/frames')}
            className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors group min-h-11 min-w-11 sm:min-w-0 touch-manipulation"
            disabled={isCapturing}
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform shrink-0" />
            <span className={`text-sm sm:text-base ${language === 'ar' ? "font-['Cairo']" : "font-['Inter']"}`}>
              {language === 'ar' ? 'رجوع' : 'Back'}
            </span>
          </button>
          
          <div className="flex items-center gap-2 sm:gap-3 bg-[#D4AF37]/20 border border-[#D4AF37]/30 rounded-full px-3 sm:px-4 py-1.5 sm:py-2 shrink-0">
            <div className="w-2 h-2 bg-[#D4AF37] rounded-full animate-pulse motion-reduce:animate-none" />
            <span className={`text-xs sm:text-sm font-medium text-[#D4AF37] whitespace-nowrap ${language === 'ar' ? "font-['Cairo']" : "font-['Inter']"}`}>
              {captureMode === 'single' 
                ? (language === 'ar' ? 'صورة واحدة' : 'Single Photo')
                : `${Math.min(capturedPhotos.length + 1, 4)}/4`
              }
            </span>
          </div>
          
          <div className="w-11 sm:w-20 shrink-0" aria-hidden />
        </div>
        <div className="max-w-6xl mx-auto px-3 sm:px-4 pb-3">
          <FlowStepper phase="camera" />
        </div>
      </div>

      {/* Camera view with frame overlay */}
      <div className="flex-1 min-h-0 relative bg-gray-900 flex items-center justify-center overflow-hidden px-2 pt-2 pb-1 sm:px-4 sm:py-3">
        <div
          className="relative w-full max-w-4xl mx-auto"
        >
          <div
            className="relative w-full mx-auto rounded-lg overflow-hidden bg-black shadow-2xl max-h-[min(76dvh,calc(100dvh-16.25rem))] sm:max-h-[min(82vh,calc(100dvh-14rem))]"
            style={{ aspectRatio: `${frameRatio}` }}
          >
          {/* Video feed aligned to frame photo area */}
          <div className="absolute inset-0">
            <div className="absolute overflow-hidden rounded-sm" style={photoAreaStyle}>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`absolute inset-0 w-full h-full object-cover ${
                  facingMode === 'user' ? 'object-[center_35%]' : 'object-center'
                }`}
                style={{ transform: facingMode === 'user' ? 'scaleX(-1)' : 'none' }}
              />
            </div>
          </div>
          
          {/* Frame overlay */}
          <div className="absolute inset-0 pointer-events-none z-10">
            <img
              src={selectedFrame.imagePath}
              alt=""
              className="absolute inset-0 w-full h-full object-fill drop-shadow-2xl"
              style={{ 
                opacity: 0.9,
                filter: 'drop-shadow(0 0 20px rgba(0,0,0,0.5))'
              }}
              draggable={false}
            />
          </div>

          {(isStarting || cameraMessage) && (
            <div
              className="absolute inset-0 z-20 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4"
              role={isStarting ? 'status' : 'alert'}
              aria-live="polite"
            >
              <div className="text-center max-w-sm">
                {isStarting ? (
                  <>
                    <div
                      className="mx-auto mb-4 h-12 w-12 rounded-full border-2 border-[#D4AF37] border-t-transparent animate-spin motion-reduce:animate-none"
                      aria-hidden
                    />
                    <p className={`text-sm sm:text-base ${language === 'ar' ? "font-['Cairo']" : "font-['Inter']"}`}>
                      {language === 'ar' ? 'جاري تشغيل الكاميرا...' : 'Preparing your camera…'}
                    </p>
                    <p className={`mt-2 text-xs text-gray-400 ${language === 'ar' ? "font-['Cairo']" : "font-['Inter']"}`}>
                      {t('privacyLocalShort')}
                    </p>
                  </>
                ) : (
                  <>
                    <p className={`mb-4 text-sm sm:text-base leading-relaxed ${language === 'ar' ? "font-['Cairo']" : "font-['Inter']"}`}>
                      {cameraMessage || errorMessage}
                    </p>
                    <button
                      type="button"
                      onClick={() => startCamera()}
                      className="min-h-12 px-6 py-3 rounded-xl bg-[#D4AF37] text-[#2C2C2C] font-semibold touch-manipulation w-full sm:w-auto"
                    >
                      {language === 'ar' ? 'إعادة المحاولة' : 'Try again'}
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Photo strip progress */}
          {captureMode === 'strip' && capturedPhotos.length > 0 && (
            <div className="absolute top-3 end-3 flex gap-2 bg-black/50 backdrop-blur-sm rounded-lg p-2">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`w-2 h-10 rounded-full transition-all ${
                    i < capturedPhotos.length ? 'bg-[#D4AF37]' : 'bg-white/20'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-[#1F1F1F] border-t border-white/10 p-4 sm:p-5 pb-[max(1rem,env(safe-area-inset-bottom))] shrink-0">
        <div className="max-w-4xl mx-auto">
          {/* Filter selector */}
          <div className="mb-4 sm:mb-5 overflow-x-auto scrollbar-hide -mx-1 px-1">
            <div className="flex gap-2 pb-2 justify-center">
              {filters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setSelectedFilter(filter)}
                  disabled={isCapturing}
                  className={`
                    px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-colors touch-manipulation
                    ${selectedFilter === filter
                      ? 'bg-gradient-to-r from-[#D4AF37] to-[#B8941F] text-white shadow-lg shadow-[#D4AF37]/30'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10'
                    }
                  `}
                >
                  <Sparkles size={14} className="inline mr-1.5 mb-0.5" />
                  {filter === 'none' ? (language === 'ar' ? 'عادي' : 'Original') : filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Custom text */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3 sm:mb-4">
            <input
              value={customText.arabic}
              onChange={(e) => setCustomText((prev) => ({ ...prev, arabic: e.target.value }))}
              disabled={isCapturing || isProcessing}
              dir="rtl"
              className="bg-white/5 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#D4AF37]/60 min-h-11"
              placeholder={language === 'ar' ? 'عيد سعيد' : 'Arabic greeting'}
            />
            <input
              value={customText.familyName}
              onChange={(e) => setCustomText((prev) => ({ ...prev, familyName: e.target.value }))}
              disabled={isCapturing || isProcessing}
              className="bg-white/5 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#D4AF37]/60 min-h-11"
              placeholder={language === 'ar' ? 'اسم العائلة' : 'Family name'}
            />
            <input
              value={customText.yearLabel}
              onChange={(e) => setCustomText((prev) => ({ ...prev, yearLabel: e.target.value }))}
              disabled={isCapturing || isProcessing}
              className="bg-white/5 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#D4AF37]/60 min-h-11"
              placeholder="Eid 2026"
            />
          </div>

          {/* Timer and Capture */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
            {/* Timer selector */}
            <div className="flex gap-2 sm:gap-3 justify-center sm:justify-start order-2 sm:order-1">
              {[3, 5, 10].map((duration) => (
                <button
                  key={duration}
                  onClick={() => setTimerDuration(duration)}
                  disabled={isCapturing || isProcessing}
                  className={`
                    w-12 h-12 sm:w-14 sm:h-14 rounded-xl text-xs sm:text-sm font-bold transition-colors flex flex-col items-center justify-center touch-manipulation
                    ${timerDuration === duration
                      ? 'bg-white text-[#2C2C2C] shadow-lg'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10'
                    }
                  `}
                >
                  <Timer size={16} className="mb-0.5 shrink-0" />
                  <span>{duration}s</span>
                </button>
              ))}
            </div>

            {/* Capture button */}
            <div className="flex items-center justify-center gap-4 order-1 sm:order-2">
              <button
                type="button"
                onClick={switchCamera}
                disabled={isCapturing || isProcessing || !stream}
                className="min-h-[52px] min-w-[52px] rounded-xl bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center touch-manipulation"
                aria-label={language === 'ar' ? 'تبديل الكاميرا' : 'Switch camera'}
              >
                <RefreshCcw size={22} />
              </button>
              <motion.button
                type="button"
                whileHover={{ scale: isCapturing || isProcessing ? 1 : 1.04 }}
                whileTap={{ scale: isCapturing || isProcessing ? 1 : 0.96 }}
                onClick={startCountdownCapture}
                disabled={isCapturing || isProcessing || !stream}
                className={`
                  flex-shrink-0 w-[5.75rem] h-[5.75rem] sm:w-24 sm:h-24 rounded-full flex items-center justify-center
                  transition-colors duration-300 relative touch-manipulation
                  ${isCapturing || isProcessing
                    ? 'bg-gray-600 cursor-not-allowed'
                    : 'bg-gradient-to-br from-[#D4AF37] to-[#B8941F] shadow-2xl shadow-[#D4AF37]/40 active:shadow-[#D4AF37]/60'
                  }
                `}
              >
                <div
                  className={`absolute inset-0 rounded-full motion-reduce:hidden ${!isCapturing && stream && !isProcessing ? 'animate-ping bg-[#D4AF37]/25' : ''}`}
                />
                <CameraIcon size={40} className="text-white relative z-10" strokeWidth={2} />
              </motion.button>
            </div>

            <div className="w-full sm:w-48 sm:text-end order-3 text-center sm:text-right">
              <p className={`text-gray-400 text-xs sm:text-sm ${language === 'ar' ? "font-['Cairo']" : "font-['Inter']"}`}>
                {statusText}
              </p>
            </div>
          </div>
          <p
            className={`mt-3 text-center text-[10px] sm:text-[11px] text-gray-500 ${language === 'ar' ? "font-['Cairo']" : "font-['Inter']"}`}
            dir={language === 'ar' ? 'rtl' : 'ltr'}
          >
            {t('privacyLocalShort')}
          </p>
        </div>
      </div>
    </div>
  );
}
