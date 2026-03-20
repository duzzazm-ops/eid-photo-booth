import { useLanguage } from '../contexts/LanguageContext';

export type FlowPhase = 'start' | 'frame' | 'camera' | 'result';

const PHASE_ORDER: FlowPhase[] = ['start', 'frame', 'camera', 'result'];

const phaseLabelKey: Record<FlowPhase, string> = {
  start: 'flowStepStart',
  frame: 'flowStepFrame',
  camera: 'flowStepCapture',
  result: 'flowStepResult',
};

interface FlowStepperProps {
  phase: FlowPhase;
  className?: string;
}

export function FlowStepper({ phase, className = '' }: FlowStepperProps) {
  const { t } = useLanguage();
  const index = Math.max(0, PHASE_ORDER.indexOf(phase));
  const total = PHASE_ORDER.length;
  const pct = total > 1 ? ((index + 1) / total) * 100 : 100;

  return (
    <div className={`w-full ${className}`} role="navigation" aria-label={t('flowStepAria')}>
      <div className="h-1.5 w-full rounded-full bg-black/10 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#D4AF37] to-[#B8941F] transition-[width] duration-500 ease-out motion-reduce:transition-none"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p
        className="mt-1.5 text-center text-[11px] sm:text-xs text-[#6B7280] font-medium tracking-wide"
        aria-live="polite"
      >
        {t('flowStepOf')
          .replace('{{n}}', String(index + 1))
          .replace('{{total}}', String(total))}{' '}
        · {t(phaseLabelKey[phase])}
      </p>
    </div>
  );
}
