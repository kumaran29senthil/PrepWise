export default function Loading() {
  return (
    <div className="flex flex-col gap-8 animate-pulse">
      {/* Hero skeleton */}
      <div className="card-cta">
        <div className="flex flex-col gap-4 max-w-lg">
          <div className="h-8 w-3/4 bg-dark-200 rounded" />
          <div className="h-5 w-1/2 bg-dark-200 rounded" />
          <div className="h-10 w-40 bg-primary-200/20 rounded-lg" />
        </div>
      </div>

      {/* Interview cards skeleton */}
      <div className="flex flex-col gap-4">
        <div className="h-6 w-48 bg-dark-200 rounded" />
        <div className="flex flex-row gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="w-[360px] h-96 bg-dark-200 rounded-2xl"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
