export default function SectionTitle({ children, className = "" }) {
  return (
    <p className={`text-xs uppercase tracking-widest text-slate-500 mb-4 ${className}`}>
      {children}
    </p>
  );
}