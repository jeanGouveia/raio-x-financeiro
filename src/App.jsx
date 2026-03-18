import { useState, useEffect } from "react";
import { parseExcel } from "./services/parser";
import { analyzeData } from "./services/analyzer";
import "./index.css";

function App() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [unlocked, setUnlocked] = useState(false);
  const [animatedScore, setAnimatedScore] = useState(0);

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setLoading(true);

      const data = await parseExcel(file);
      const analysis = analyzeData(data);

      setResult(analysis);
      setUnlocked(false);
      setAnimatedScore(0);
    } catch (error) {
      console.error(error);
      alert("Erro ao processar.");
    } finally {
      setLoading(false);
    }
  };

  // 🎬 animação do score
  useEffect(() => {
    if (!result) return;

    let current = 0;
    const interval = setInterval(() => {
      current += 2;
      if (current >= result.summary.score) {
        current = result.summary.score;
        clearInterval(interval);
      }
      setAnimatedScore(current);
    }, 20);

    return () => clearInterval(interval);
  }, [result]);

  const getColor = (score) => {
    if (score < 40) return "text-red-600";
    if (score < 70) return "text-yellow-500";
    return "text-green-600";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 flex items-center justify-center p-4">
      <div className="bg-white shadow-2xl rounded-3xl p-6 w-full max-w-xl">

        {/* HEADLINE */}
        <h1 className="text-2xl font-bold text-center mb-2">
          Descubra se sua vida financeira está saudável
        </h1>
        <p className="text-center text-gray-500 mb-6 text-sm">
          Em menos de 1 minuto você verá onde está perdendo dinheiro
        </p>

        <input
          type="file"
          onChange={handleFile}
          className="mb-4 w-full border p-2 rounded-lg"
        />

        {loading && (
          <p className="text-center animate-pulse">
            Analisando seus dados...
          </p>
        )}

        {result && (
          <div className="space-y-6">

            {/* SCORE */}
            <div className="text-center">
              <p className="text-gray-500">Seu score financeiro</p>
              <p className={`text-5xl font-bold ${getColor(animatedScore)}`}>
                {animatedScore}%
              </p>

              <p className="text-sm text-gray-500 mt-2">
                {result.benchmark}
              </p>
            </div>

            {/* DIAGNÓSTICO */}
            <div className="bg-yellow-50 p-4 rounded-xl border">
              <p>{result.mainDiagnosis}</p>
              <p className="text-red-600 font-semibold mt-2">
                {result.biggestProblem}
              </p>
            </div>

            {/* BLOQUEIO */}
            {!unlocked && (
              <div className="bg-black text-white p-5 rounded-xl text-center">
                <h2 className="font-bold text-lg mb-2">
                  Veja seu plano completo
                </h2>

                <p className="text-sm text-gray-300 mb-4">
                  Descubra quanto dinheiro você pode recuperar e o que fazer agora.
                </p>

                <button
                  className="bg-green-500 px-5 py-2 rounded-lg font-semibold"
                  onClick={() => alert("Pagamento")}
                >
                  Desbloquear por R$ 19
                </button>

                <div>
                  <button
                    className="text-xs underline mt-3 text-gray-400"
                    onClick={() => setUnlocked(true)}
                  >
                    modo teste
                  </button>
                </div>
              </div>
            )}

            {unlocked && (
              <>
                <div className="bg-green-50 p-4 rounded-xl">
                  <h2 className="font-bold mb-1">Oportunidades</h2>
                  {result.insights.map((i, idx) => (
                    <p key={idx}>{i}</p>
                  ))}
                </div>

                <div className="bg-purple-50 p-4 rounded-xl">
                  <h2 className="font-bold mb-1">Projeção</h2>
                  <p>{result.projection.scenario}</p>
                </div>

                <div className="bg-gray-100 p-4 rounded-xl">
                  <h2 className="font-bold mb-1">Plano de ação</h2>
                  {result.actionPlan.map((step, i) => (
                    <p key={i}>{step}</p>
                  ))}
                </div>
              </>
            )}

          </div>
        )}
      </div>
    </div>
  );
}

export default App;