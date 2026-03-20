import { useNavigate } from 'react-router';
import { useLanguage } from '../contexts/LanguageContext';
import { Download, RotateCcw, Home, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { CapturedPhoto } from '../types/photobooth';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { frames, renderPhotoWithFrame } from '../utils/frames';
import { FlowStepper } from '../components/FlowStepper';
import { savePhotoToDevice } from '../utils/saveImage';

export function Preview() {
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  const [capturedPhotos, setCapturedPhotos] = useState<CapturedPhoto[]>([]);
  const [frameId, setFrameId] = useState<string>('');
  const [finalImageUrl, setFinalImageUrl] = useState<string>('');
  const [isRendering, setIsRendering] = useState(true);
  const [renderError, setRenderError] = useState(false);
  const [iosHelpOpen, setIosHelpOpen] = useState(false);
  const [tapToOpenUrl, setTapToOpenUrl] = useState<string | null>(null);
  const [downloadBusy, setDownloadBusy] = useState(false);
  const tapToOpenRevokeRef = useRef<string | null>(null);

  const selectedFrame = useMemo(() => frames.find((f) => f.id === frameId), [frameId]);
  const previewAspect = selectedFrame?.ratio ?? 3 / 4;

  useEffect(() => {
    const fId = sessionStorage.getItem('selectedFrameId');
    const photosJson = sessionStorage.getItem('capturedPhotos');

    if (!fId || !photosJson) {
      navigate('/frames');
      return;
    }

    setFrameId(fId);
    try {
      const parsed = JSON.parse(photosJson) as unknown;
      if (!Array.isArray(parsed) || parsed.length === 0) {
        navigate('/camera');
        return;
      }
      setCapturedPhotos(parsed as CapturedPhoto[]);
    } catch {
      navigate('/camera');
    }
  }, [navigate]);

  const renderFinalImage = useCallback(async () => {
    setIsRendering(true);
    setRenderError(false);

    const frame = frames.find((f) => f.id === frameId);
    if (!frame) {
      setIsRendering(false);
      setRenderError(true);
      return;
    }

    try {
      const photoUrls = capturedPhotos.map((p) => p.dataUrl);
      const facing = sessionStorage.getItem('cameraFacing');
      const finalUrl = await renderPhotoWithFrame(frame, photoUrls, {
        outputWidth: 1200,
        previewFacingUser: facing === 'user',
      });
      setFinalImageUrl(finalUrl);
    } catch (error) {
      console.error('Error rendering final image:', error);
      setRenderError(true);
    } finally {
      setIsRendering(false);
    }
  }, [capturedPhotos, frameId]);

  useEffect(() => {
    if (capturedPhotos.length > 0 && frameId) {
      void renderFinalImage();
    }
  }, [capturedPhotos, frameId, renderFinalImage]);

  const closeIosHelp = useCallback(() => {
    setIosHelpOpen(false);
    if (tapToOpenRevokeRef.current) {
      try {
        URL.revokeObjectURL(tapToOpenRevokeRef.current);
      } catch {
        /* ignore */
      }
      tapToOpenRevokeRef.current = null;
    }
    setTapToOpenUrl(null);
  }, []);

  useEffect(() => {
    return () => {
      if (tapToOpenRevokeRef.current) {
        try {
          URL.revokeObjectURL(tapToOpenRevokeRef.current);
        } catch {
          /* ignore */
        }
      }
    };
  }, []);

  const handleDownload = useCallback(async () => {
    if (!finalImageUrl || downloadBusy) return;
    setDownloadBusy(true);
    setIosHelpOpen(false);
    if (tapToOpenRevokeRef.current) {
      try {
        URL.revokeObjectURL(tapToOpenRevokeRef.current);
      } catch {
        /* ignore */
      }
      tapToOpenRevokeRef.current = null;
    }
    setTapToOpenUrl(null);

    const timestamp = Date.now();
    const filename = `eid-photobooth-${timestamp}.png`;
    const title = language === 'ar' ? 'صورة العيد' : 'Eid photo';

    try {
      const result = await savePhotoToDevice({ dataUrl: finalImageUrl, filename, title });
      if (result.tapToOpenHref) {
        setTapToOpenUrl(result.tapToOpenHref);
        if (result.tapToOpenHref.startsWith('blob:')) {
          tapToOpenRevokeRef.current = result.tapToOpenHref;
        }
      }
      if (result.showIosSaveHint) {
        setIosHelpOpen(true);
      }
    } finally {
      setDownloadBusy(false);
    }
  }, [downloadBusy, finalImageUrl, language]);

  const handleRetake = () => {
    navigate('/camera');
  };

  const handleStartOver = () => {
    sessionStorage.clear();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FBF8F3] to-[#F3EDE3] text-[#2C2C2C] relative">
      {iosHelpOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm motion-reduce:backdrop-blur-none"
          role="dialog"
          aria-modal="true"
          aria-labelledby="ios-save-title"
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-5 sm:p-6 shadow-2xl border border-[#2C2C2C]/10 mb-[env(safe-area-inset-bottom)] sm:mb-0"
            dir={language === 'ar' ? 'rtl' : 'ltr'}
          >
            <h2 id="ios-save-title" className={`text-lg font-bold text-[#2C2C2C] mb-3 ${language === 'ar' ? "font-['Cairo']" : "font-['Inter']"}`}>
              {t('iosSaveTitle')}
            </h2>
            <p className={`text-sm text-[#4B5563] leading-relaxed mb-3 ${language === 'ar' ? "font-['Cairo']" : "font-['Inter']"}`}>
              {t('iosSaveBody')}
            </p>
            <p className={`text-xs text-[#6B7280] mb-4 ${language === 'ar' ? "font-['Cairo']" : "font-['Inter']"}`}>
              {t('iosSaveShareAlt')}
            </p>
            {tapToOpenUrl && (
              <a
                href={tapToOpenUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`mb-4 block w-full rounded-xl bg-[#D4AF37]/15 px-4 py-3 text-center text-sm font-semibold text-[#8B6914] ring-1 ring-[#D4AF37]/40 ${language === 'ar' ? "font-['Cairo']" : "font-['Inter']"}`}
              >
                {t('iosTapToOpen')}
              </a>
            )}
            <button
              type="button"
              onClick={closeIosHelp}
              className={`w-full rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B8941F] py-3 text-white font-semibold touch-manipulation ${language === 'ar' ? "font-['Cairo']" : "font-['Inter']"}`}
            >
              {t('iosSaveGotIt')}
            </button>
          </div>
        </div>
      )}

      <div className="bg-white/50 backdrop-blur-sm border-b border-[#2C2C2C]/10 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 text-center">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex flex-wrap items-center justify-center gap-2 sm:gap-3 bg-gradient-to-r from-[#D4AF37] to-[#B8941F] text-white px-5 sm:px-6 py-3 rounded-2xl shadow-lg">
              <Sparkles size={22} className="shrink-0" />
              <h1 className={`text-lg sm:text-2xl font-bold ${language === 'ar' ? "font-['Cairo']" : "font-['Playfair_Display']"}`}>
                {language === 'ar' ? 'صورتك جاهزة!' : 'Your Photo is Ready!'}
              </h1>
              <Sparkles size={22} className="shrink-0" />
            </div>
          </motion.div>
        </div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-4">
          <FlowStepper phase="result" />
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 sm:p-6 pb-32 md:pb-6">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-white backdrop-blur-sm border-2 border-[#2C2C2C]/10 rounded-3xl p-4 sm:p-6 mb-6 shadow-2xl"
          >
            {isRendering ? (
              <div
                className="w-full max-w-full bg-gradient-to-br from-[#F9FAFB] to-[#F3F4F6] rounded-2xl animate-pulse flex items-center justify-center min-h-[200px]"
                style={{ aspectRatio: previewAspect }}
              >
                <div className="text-center px-4">
                  <div className="w-14 h-14 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto mb-4 motion-reduce:animate-none"></div>
                  <p className={`text-[#6B7280] text-sm ${language === 'ar' ? "font-['Cairo']" : "font-['Inter']"}`}>
                    {language === 'ar' ? 'جاري تجهيز الصورة النهائية...' : 'Finishing your photo…'}
                  </p>
                </div>
              </div>
            ) : renderError ? (
              <div className="w-full rounded-2xl border border-red-200 bg-red-50 p-6 text-center" role="alert">
                <p className={`text-red-800 text-sm mb-4 ${language === 'ar' ? "font-['Cairo']" : "font-['Inter']"}`}>
                  {language === 'ar'
                    ? 'حدث خطأ أثناء إنشاء الصورة. حاول مرة أخرى.'
                    : 'Something went wrong creating your image. Please try again.'}
                </p>
                <button
                  type="button"
                  onClick={() => void renderFinalImage()}
                  className="rounded-xl bg-[#D4AF37] px-5 py-3 text-sm font-semibold text-[#2C2C2C] touch-manipulation"
                >
                  {language === 'ar' ? 'إعادة المحاولة' : 'Retry'}
                </button>
              </div>
            ) : finalImageUrl ? (
              <motion.img
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                src={finalImageUrl}
                alt="Final photo"
                className="w-full rounded-2xl shadow-xl bg-white"
              />
            ) : null}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="hidden md:grid md:grid-cols-3 gap-4 mb-6"
          >
            <button
              type="button"
              onClick={handleStartOver}
              className="order-3 flex items-center justify-center gap-2 bg-white hover:bg-gray-50 border-2 border-[#2C2C2C]/10 rounded-2xl py-4 font-semibold transition-shadow hover:shadow-lg group touch-manipulation"
            >
              <Home size={20} className="group-hover:scale-110 transition-transform" />
              <span className={language === 'ar' ? "font-['Cairo']" : "font-['Inter']"}>
                {language === 'ar' ? 'البداية' : 'Start Over'}
              </span>
            </button>

            <button
              type="button"
              onClick={handleRetake}
              className="order-2 flex items-center justify-center gap-2 bg-white hover:bg-gray-50 border-2 border-[#D4AF37]/40 rounded-2xl py-4 font-semibold transition-shadow hover:shadow-lg group touch-manipulation ring-2 ring-transparent hover:ring-[#D4AF37]/20"
            >
              <RotateCcw size={22} className="text-[#B8941F] group-hover:rotate-180 transition-transform duration-500" />
              <span className={`font-semibold ${language === 'ar' ? "font-['Cairo']" : "font-['Inter']"}`}>
                {language === 'ar' ? 'إعادة التصوير' : 'Retake photo'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => void handleDownload()}
              disabled={!finalImageUrl || downloadBusy}
              className="order-1 flex items-center justify-center gap-3 bg-gradient-to-r from-[#D4AF37] to-[#B8941F] hover:from-[#E5C158] hover:to-[#D4AF37] text-white rounded-2xl py-4 font-semibold transition-all shadow-xl hover:shadow-2xl hover:shadow-[#D4AF37]/30 disabled:opacity-50 disabled:cursor-not-allowed group touch-manipulation"
            >
              <Download size={24} className="group-hover:translate-y-0.5 transition-transform shrink-0 motion-reduce:transition-none" />
              <span className={language === 'ar' ? "font-['Cairo']" : "font-['Inter']"}>
                {downloadBusy
                  ? language === 'ar'
                    ? 'جاري التحضير…'
                    : 'Preparing…'
                  : language === 'ar'
                    ? 'تحميل الصورة الآن'
                    : 'Download now'}
              </span>
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-gradient-to-r from-[#D4E8D4] to-[#D6E9F5] rounded-2xl p-6 text-center"
          >
            <p className={`text-[#2C2C2C] mb-2 ${language === 'ar' ? "font-['Cairo'] font-medium" : "font-['Inter'] font-medium"}`}>
              {language === 'ar' ? '✨ شارك فرحتك مع أحبائك' : '✨ Share your joy with loved ones'}
            </p>
            <p className={`text-[#6B7280] text-sm ${language === 'ar' ? "font-['Cairo']" : "font-['Inter']"}`}>
              {language === 'ar'
                ? 'حمّل الصورة وشاركها في وسائل التواصل الاجتماعي'
                : 'Download and share on your favorite social media'}
            </p>
            <p className={`text-[#9CA3AF] text-xs mt-3 ${language === 'ar' ? "font-['Cairo']" : "font-['Inter']"}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
              {t('privacyLocalShort')}
            </p>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-[#9CA3AF] text-[11px] sm:text-xs text-center mt-6 max-w-md mx-auto leading-relaxed"
          >
            <span className={language === 'ar' ? "font-['Cairo']" : "font-['Inter']"} dir={language === 'ar' ? 'rtl' : 'ltr'}>
              {t('privacyLocalShort')}
            </span>
          </motion.p>
        </div>
      </div>

      <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 border-t border-[#2C2C2C]/10 bg-[#FBF8F3]/95 backdrop-blur-md px-4 pt-3 shadow-[0_-8px_30px_rgba(0,0,0,0.06)] pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <button
          type="button"
          onClick={() => void handleDownload()}
          disabled={!finalImageUrl || isRendering || downloadBusy}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#D4AF37] to-[#B8941F] py-4 text-base font-bold text-white shadow-lg disabled:opacity-45 disabled:cursor-not-allowed touch-manipulation"
        >
          <Download size={22} />
          {downloadBusy
            ? language === 'ar'
              ? 'جاري التحضير…'
              : 'Preparing…'
            : language === 'ar'
              ? 'تحميل الصورة'
              : 'Download photo'}
        </button>
        <button
          type="button"
          onClick={handleRetake}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-[#D4AF37]/50 bg-white py-3.5 text-base font-semibold text-[#2C2C2C] touch-manipulation"
        >
          <RotateCcw size={20} className="text-[#B8941F]" />
          {language === 'ar' ? 'إعادة التصوير' : 'Retake'}
        </button>
        <button type="button" onClick={handleStartOver} className="mt-2 w-full py-2 text-sm font-medium text-[#6B7280] touch-manipulation">
          {language === 'ar' ? 'البدء من جديد' : 'Start over from the beginning'}
        </button>
      </div>
    </div>
  );
}
