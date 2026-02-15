export default function Loading() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-7 w-32 rounded bg-slate-200" />
          <div className="mt-1 h-4 w-20 rounded bg-slate-200" />
        </div>
        <div className="h-11 w-36 rounded-xl bg-slate-200" />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-20 rounded-xl bg-slate-200" />
        ))}
      </div>
      <div className="h-12 rounded-xl bg-slate-200" />
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-24 rounded-xl bg-slate-200" />
      ))}
    </div>
  );
}
