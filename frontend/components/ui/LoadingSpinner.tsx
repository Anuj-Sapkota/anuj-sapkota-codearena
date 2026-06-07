export default function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-primary-1" />
      <p className="text-sm font-medium text-gray-500">Loading...</p>
    </div>
  );
}