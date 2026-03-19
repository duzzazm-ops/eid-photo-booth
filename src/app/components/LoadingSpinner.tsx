interface LoadingSpinnerProps {
  size?: number;
}

export function LoadingSpinner({ size = 16 }: LoadingSpinnerProps) {
  return (
    <div className="flex items-center justify-center">
      <div className="relative" style={{ width: size, height: size }}>
        <div className="absolute inset-0 border-4 border-white/20 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-transparent border-t-red-600 rounded-full animate-spin"></div>
      </div>
    </div>
  );
}