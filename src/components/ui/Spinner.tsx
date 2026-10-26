export function Spinner({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`corise-spin inline-block h-4 w-4 shrink-0 rounded-full border-2 border-current border-t-transparent opacity-80 ${className}`}
    />
  );
}
