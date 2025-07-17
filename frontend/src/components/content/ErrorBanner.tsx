
import { X } from "lucide-react";

interface ErrorBannerProps {
  message: string;
  onClose?: () => void;
}

export const ErrorBanner = ({ message, onClose }: ErrorBannerProps) => (
  <div className="max-w-2xl mx-auto my-4 px-4 py-2 rounded bg-red-50 border border-red-200 text-red-700 shadow-sm relative">
    <div className="flex items-center justify-between">
      <div>
        <strong>Terjadi Error!</strong> {message}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="ml-2 p-1 hover:bg-red-100 rounded transition-colors"
          aria-label="Close error banner"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  </div>
);
