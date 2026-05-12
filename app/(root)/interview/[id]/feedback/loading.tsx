export default function FeedbackLoading() {
  return (
    <section className="section-feedback animate-pulse">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-3/4 bg-dark-200 rounded" />
        <div className="flex flex-row gap-5">
          <div className="h-6 w-36 bg-dark-200 rounded" />
          <div className="h-6 w-36 bg-dark-200 rounded" />
        </div>
      </div>

      <hr />

      <div className="h-20 w-full bg-dark-200 rounded" />

      <div className="flex flex-col gap-4">
        <div className="h-6 w-64 bg-dark-200 rounded" />
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-16 w-full bg-dark-200 rounded" />
        ))}
      </div>
    </section>
  );
}
