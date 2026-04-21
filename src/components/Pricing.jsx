// src/components/Pricing.jsx
import { Check, Star } from "lucide-react";

const plans = [
  {
    name: "Mensal",
    price: 97,
    period: "/mês",
    description1: "Perfeito para começar",
    description2: "Por 30 dias",
    features: [
      "Score financeiro 0-100",
      "Gráficos claros de gastos",
      "Principais problemas detectados",
      "Plano de ação de 30 dias",
      "PDF profissional"
    ],
    buttonText: "Assinar Mensal",
    buttonLink: "https://pay.hotmart.com/Y105310131F?off=jvdmfsq3&bid=1775957680382", // link real do Hotmart
    popular: false
  },
  {
    name: "Semestral",
    price: 474,
    period: "em 06 vezes • Economia de R$ 108",
    description1: "Consolide seu controle financeiro.",
    description2: "Por 06 meses",
    features: [
      "Tudo do plano Mensal",
      "Histórico de 6 meses",
      "Comparação mês a mês",
      "Economia de R$ 108",
      "Suporte via e-mail"
    ],
    buttonText: "Assinar Semestral",
    buttonLink: "https://pay.hotmart.com/Y105310131F?off=29c5ku25&bid=1775957703561", // link real do Hotmart
    popular: false
  },
  {
    name: "Anual",
    price: 588,
    period: "em 12 vezes • Economia de R$ 576",
    description1: "Melhor custo-benefício",
    description2: "Por 12 meses",
    features: [
      "Tudo do plano Semestral",
      "Evolução patrimonial anual",
      "Suporte via WhatsApp",
      "Acesso antecipado a novos recursos",
      "Para quem quer transformar a vida financeira de verdade."
    ],
    buttonText: "Assinar Anual",
    buttonLink: "https://pay.hotmart.com/Y105310131F?off=0a6kjg63&bid=1775957719603", // link real do Hotmart
    popular: true
  }
];

export default function Pricing() {
  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 py-16 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-black mb-4">Escolha seu plano</h1>
          <p className="text-xl text-slate-400">Análise inteligente todo mês. Resultados reais na sua vida financeira.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-7">
          {plans.map((plan) => (
            <div 
              key={plan.name}
              className={`relative bg-slate-900 border rounded-3xl p-8 flex flex-col ${plan.popular ? 'border-emerald-500 scale-105 shadow-2xl' : 'border-slate-700'}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-emerald-500 text-black text-xs font-bold px-6 py-1.5 rounded-full flex items-center gap-1.5">
                  <Star size={18} fill="currentColor" /> MAIS POPULAR
                </div>
              )}

              <h2 className="text-3xl font-bold mb-2">{plan.name}</h2>
              <p className="text-slate-400 mb-1 min-h-[18px]">{plan.description1}</p>
              <p className="text-slate-400 mb-1 min-h-[38px]">{plan.description2}</p>

              <div className="mb-10">
                <span className="text-5xl font-black">R$ {plan.price}</span>
                <span className="text-slate-400 ml-2">{plan.period}</span>
              </div>

              <ul className="space-y-4 mb-auto text-slate-300">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className="text-emerald-400 mt-1 flex-shrink-0" size={20} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <a
                href={plan.buttonLink}
                className={`mt-10 block text-center py-4 rounded-2xl font-bold text-lg transition-all ${
                  plan.popular 
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-black' 
                    : 'bg-slate-700 hover:bg-slate-600 text-white'
                }`}
              >
                {plan.buttonText}
              </a>
            </div>
          ))}
        </div>

        <div className="text-center mt-16 text-slate-400 text-sm">
          Garantia de 7 dias • Cancele quando quiser
        </div>
      </div>
    </div>
  );
}