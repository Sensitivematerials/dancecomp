export default function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div className="border border-dashed rounded-[14px] p-8 text-center font-mono text-[12px] tracking-wide text-gray-600 mb-4"
      style={{ borderColor: "var(--border)" }}>
      {children}
    </div>
  );
}
