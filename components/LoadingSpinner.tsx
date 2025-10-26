const LoadingSpinner = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary"></div>
      <p className="text-lg text-gray-600">Fetching product details...</p>
      <p className="text-sm text-gray-500">This may take a few seconds</p>
    </div>
  );
};

export default LoadingSpinner;
