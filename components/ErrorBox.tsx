import { useEffect } from "react";

export const ErrorBox = ({
  context = 'Error',
  error,
  onClose,
}: {
  error: string;
  context?: string;
  onClose: () => void;
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    error && (
      <div className="fixed top-4 right-4 max-w-xs w-full flex items-center justify-between">
        <div
          className="bg-red-50 border border-red-400 text-red-500 px-6 py-4 rounded-xl relative"
          role="alert"
        >
          <strong className="font-medium">{context}: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    )
  );
};