export function Spinner({ className }: { className?: string }) {
  return (
    <div className={className}>
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-bb-sand border-t-bb-pineapple" />
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <Spinner />
    </div>
  );
}
