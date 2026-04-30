export default function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-mono text-[10px] tracking-[2.5px] uppercase text-gray-600 mb-2.5">
      {children}
    </div>
  );
}
