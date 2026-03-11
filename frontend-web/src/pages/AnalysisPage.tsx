import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from 'recharts';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3002';

const gradeColor: Record<string, string> = {
  S: '#fbbf24', A: '#4ade80', B: '#60a5fa', C: '#fb923c', D: '#f87171', F: '#ef4444'
};

export default function AnalysisPage() {
  const { id } = useParams();
  const { data, isLoading } = useQuery({
    queryKey: ['analysis', id],
    queryFn: async () => {
      const res = await fetch(`${API}/api/analysis/${id}`);
      return res.json();
    },
    refetchInterval: (query) => {
      const status = query.state.data?.data?.status;
      return status === 'ANALYZING' ? 3000 : false;
    }
  });

  const analysis = data?.data;
  const scores = analysis?.aguaFlowScores;

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="w-12 h-12 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-400">Cargando análisis...</p>
      </div>
    </div>
  );

  if (!analysis) return <div className="p-8 text-center text-slate-400">Análisis no encontrado</div>;

  const radarData = scores ? [
    { subject: 'Agilidad', value: scores.agilidad.score },
    { subject: 'Crecimiento', value: scores.crecimiento.score },
    { subject: 'Unidad', value: scores.unidad.score },
    { subject: 'Adaptabilidad', value: scores.adaptabilidad.score },
    { subject: 'Flujo', value: scores.flujo.score }
  ] : [];

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">{analysis.company?.name}</h1>
          <p className="text-slate-400">Análisis AGUA FLOW · {new Date(analysis.createdAt).toLocaleDateString('es-ES')}</p>
        </div>
        {scores && (
          <div className="text-center">
            <p className="text-6xl font-black" style={{ color: gradeColor[scores.grade] }}>{scores.grade}</p>
            <p className="text-slate-400 text-sm">{scores.overall}/100</p>
          </div>
        )}
      </div>

      {analysis.status === 'ANALYZING' && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6 flex items-center gap-3">
          <div className="w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-yellow-400 font-medium">Analizando conectores en tiempo real...</p>
        </div>
      )}

      {scores && (
        <>
          <div className="grid grid-cols-2 gap-6 mb-6">
            {/* Radar chart */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
              <h2 className="font-semibold text-white mb-4">Perfil AGUA FLOW</h2>
              <ResponsiveContainer width="100%" height={250}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#334155" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <Radar name="Score" dataKey="value" stroke="#60a5fa" fill="#60a5fa" fillOpacity={0.2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            {/* Score cards */}
            <div className="space-y-3">
              {[
                { key: 'agilidad', label: 'A — Agilidad', color: '#60a5fa' },
                { key: 'crecimiento', label: 'G — Crecimiento', color: '#4ade80' },
                { key: 'unidad', label: 'U — Unidad', color: '#c084fc' },
                { key: 'adaptabilidad', label: 'A — Adaptabilidad', color: '#fbbf24' },
                { key: 'flujo', label: 'F — Flujo', color: '#22d3ee' }
              ].map(({ key, label, color }) => {
                const s = (scores as any)[key];
                return (
                  <div key={key} className="bg-slate-800 border border-slate-700 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-white">{label}</span>
                      <span className="text-sm font-bold" style={{ color }}>{s.score}/100</span>
                    </div>
                    <div className="h-1.5 bg-slate-700 rounded-full">
                      <div className="h-full rounded-full transition-all" style={{ width: `${s.score}%`, backgroundColor: color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recommendations */}
          {scores.recommendations.length > 0 && (
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
              <h2 className="font-semibold text-white mb-4">Recomendaciones</h2>
              <ul className="space-y-2">
                {scores.recommendations.map((rec: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                    <span className="text-blue-400 mt-0.5">→</span>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}
