"use client";

export default function OfflinePage() {
  return (
    <div className="flex flex-col justify-center items-center bg-background p-6 min-h-screen">
      <div className="space-y-4 text-center">
        <div className="relative mx-auto mb-8 w-24 h-24">
          <img
            src="/icon-192.png"
            alt="Mascot"
            className="opacity-50 w-full h-full object-contain"
          />
        </div>
        
        <h1 className="font-bold text-foreground text-4xl">
          You&apos;re Offline
        </h1>
        
        <p className="mx-auto max-w-md text-muted-foreground text-lg">
          It looks like you&apos;ve lost your internet connection. 
          Don&apos;t worry, your data is safe!
        </p>

        <div className="pt-8">
          <button
            onClick={() => window.location.reload()}
            className="bg-emerald-500 hover:bg-emerald-600 px-6 py-3 rounded-lg font-medium text-white transition-colors"
          >
            Try Again
          </button>
        </div>

        <div className="pt-8 text-muted-foreground text-sm">
          <p>Some features may be available offline:</p>
          <ul className="space-y-1 mt-2">
            <li>• View recent transactions</li>
            <li>• Browse categories</li>
            <li>• View cached data</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
