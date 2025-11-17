/**
 * Loading skeleton components for better UX
 */

export function CardSkeleton() {
  return (
    <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl border border-gray-700 p-6 animate-pulse">
      <div className="space-y-4">
        {/* Header skeleton */}
        <div className="flex items-center justify-between">
          <div className="h-8 bg-gray-700 rounded w-1/3"></div>
          <div className="h-6 bg-gray-700 rounded w-20"></div>
        </div>

        {/* Card image skeleton */}
        <div className="w-full aspect-[3/4] bg-gray-700 rounded-xl"></div>

        {/* Stats skeleton */}
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <div className="h-4 bg-gray-700 rounded"></div>
            <div className="h-6 bg-gray-700 rounded"></div>
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-700 rounded"></div>
            <div className="h-6 bg-gray-700 rounded"></div>
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-700 rounded"></div>
            <div className="h-6 bg-gray-700 rounded"></div>
          </div>
        </div>

        {/* Buttons skeleton */}
        <div className="flex gap-2">
          <div className="h-12 bg-gray-700 rounded flex-1"></div>
          <div className="h-12 bg-gray-700 rounded flex-1"></div>
        </div>
      </div>
    </div>
  );
}

export function StatsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="bg-gray-800/50 backdrop-blur-lg rounded-xl border border-gray-700 p-6"
        >
          <div className="space-y-3">
            <div className="h-4 bg-gray-700 rounded w-2/3"></div>
            <div className="h-10 bg-gray-700 rounded w-1/2"></div>
            <div className="h-3 bg-gray-700 rounded w-3/4"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function LeaderboardSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="bg-gray-800/50 backdrop-blur-lg rounded-xl border border-gray-700 p-4"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-700 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-5 bg-gray-700 rounded w-1/3"></div>
              <div className="h-4 bg-gray-700 rounded w-1/2"></div>
            </div>
            <div className="h-8 bg-gray-700 rounded w-16"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function ReferralSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="h-8 bg-gray-700 rounded mx-auto w-1/2"></div>
        <div className="h-4 bg-gray-700 rounded mx-auto w-2/3"></div>
      </div>

      {/* Rewards banner */}
      <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl border border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2 flex-1">
            <div className="h-6 bg-gray-700 rounded w-1/2"></div>
            <div className="h-4 bg-gray-700 rounded w-2/3"></div>
          </div>
          <div className="space-y-2">
            <div className="h-10 bg-gray-700 rounded w-20"></div>
            <div className="h-3 bg-gray-700 rounded w-16"></div>
          </div>
        </div>
        <div className="mt-4 h-3 bg-gray-700 rounded"></div>
      </div>

      {/* Stats grid */}
      <div className="grid md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-gray-800/50 backdrop-blur-lg rounded-xl border border-gray-700 p-6"
          >
            <div className="space-y-3">
              <div className="h-4 bg-gray-700 rounded w-1/2"></div>
              <div className="h-10 bg-gray-700 rounded w-1/3"></div>
              <div className="h-3 bg-gray-700 rounded w-2/3"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Referral link */}
      <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl border border-gray-700 p-6">
        <div className="h-6 bg-gray-700 rounded w-1/3 mb-4"></div>
        <div className="flex gap-2">
          <div className="h-12 bg-gray-700 rounded flex-1"></div>
          <div className="h-12 bg-gray-700 rounded w-24"></div>
        </div>
      </div>
    </div>
  );
}

export function AnalysisProgressSkeleton({ progress = 0 }: { progress?: number }) {
  return (
    <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl border border-gray-700 p-8">
      <div className="space-y-6">
        {/* Title */}
        <div className="text-center">
          <div className="h-8 bg-gray-700 rounded mx-auto w-2/3 mb-3 animate-pulse"></div>
          <div className="h-4 bg-gray-700 rounded mx-auto w-1/2 animate-pulse"></div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-300 animate-pulse"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        {/* Progress text */}
        <div className="text-center">
          <div className="text-cyan-400 font-bold text-lg">{progress}%</div>
        </div>

        {/* Loading steps */}
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-6 h-6 bg-gray-700 rounded-full animate-pulse"></div>
              <div className="h-4 bg-gray-700 rounded flex-1 animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ComparisonSkeleton() {
  return (
    <div className="grid md:grid-cols-2 gap-8 animate-pulse">
      {[1, 2].map((i) => (
        <div
          key={i}
          className="bg-gray-800/50 backdrop-blur-lg rounded-2xl border border-gray-700 p-6"
        >
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="h-6 bg-gray-700 rounded w-1/3"></div>
              <div className="h-8 bg-gray-700 rounded w-20"></div>
            </div>

            {/* Card image */}
            <div className="w-full aspect-[3/4] bg-gray-700 rounded-xl"></div>

            {/* Stats */}
            <div className="space-y-3">
              {[1, 2, 3, 4].map((j) => (
                <div key={j} className="flex justify-between items-center">
                  <div className="h-4 bg-gray-700 rounded w-1/3"></div>
                  <div className="h-6 bg-gray-700 rounded w-16"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
