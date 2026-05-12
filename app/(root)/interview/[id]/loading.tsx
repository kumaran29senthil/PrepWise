export default function InterviewLoading() {
  return (
    <div className="flex flex-col gap-8 animate-pulse">
      <div className="flex flex-row gap-4 justify-between">
        <div className="flex flex-row gap-4 items-center">
          <div className="rounded-full bg-dark-200 size-[40px]" />
          <div className="h-6 w-48 bg-dark-200 rounded" />
        </div>
        <div className="h-8 w-24 bg-dark-200 rounded-lg" />
      </div>

      <div className="call-view">
        <div className="w-[180px] h-[180px] bg-dark-200 rounded-2xl" />
        <div className="w-[180px] h-[180px] bg-dark-200 rounded-2xl" />
      </div>

      <div className="flex justify-center">
        <div className="h-12 w-24 bg-primary-200/20 rounded-full" />
      </div>
    </div>
  );
}
