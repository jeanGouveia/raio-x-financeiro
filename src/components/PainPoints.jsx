export default function PainPoints() {
  const items = [
    "Você ganha bem, mas nunca sobra dinheiro",
    "Não sabe para onde seu dinheiro está indo",
    "Sente que poderia economizar mais, mas não consegue"
  ];

  return (
    <section className="mb-16">
      <div className="grid md:grid-cols-3 gap-6 text-center">
        {items.map((text, i) => (
          <div
            key={i}
            className="bg-slate-900 border border-slate-700 rounded-2xl p-6"
          >
            <p className="text-slate-300">{text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}