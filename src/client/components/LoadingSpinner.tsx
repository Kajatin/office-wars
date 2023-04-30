export default function LoadingSpinner() {
  return (
    <div className="flex justify-center p-3">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-300 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
    </div>
  );
}
