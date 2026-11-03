import React, { useState, useMemo, useEffect } from 'react';
import { SimParams, SimulationResult } from './model/types';
import { DEFAULT_PARAMS, runSimulation } from './model/simulation';
import { MetricCard } from './components/MetricCard';
import { LambdaChart } from './components/LambdaChart';
import { EmmaChart } from './components/EmmaChart';
import { NetworkGraph } from './components/NetworkGraph';
import { EmmaTimeline } from './components/EmmaTimeline';
import { MatrixViewer } from './components/MatrixViewer';
import { ParametersPanel } from './components/ParametersPanel';
import { JsonModal } from './components/JsonModal';
import { TheoryModal } from './components/TheoryModal';
import {
  Sun,
  Moon,
  Info,
  Activity,
  Network,
  Clock,
  Grid3X3,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';

export default function App() {
  const [params, setParams] = useState<SimParams>(DEFAULT_PARAMS);
  const [activeTab, setActiveTab] = useState<'charts' | 'network' | 'timeline' | 'matrices'>('charts');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [isJsonModalOpen, setIsJsonModalOpen] = useState<boolean>(false);
  const [isTheoryModalOpen, setIsTheoryModalOpen] = useState<boolean>(false);
  const [timelineStep, setTimelineStep] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  // Sync theme with html root element
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
    }
  }, [theme]);

  // Execute simulation
  const simulation: SimulationResult | null = useMemo(() => {
    try {
      const res = runSimulation(params);
      setError(null);
      return res;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error en la simulación';
      setError(msg);
      return null;
    }
  }, [params]);

  // Reset timeline whenever Emma duration T changes
  useEffect(() => {
    if (timelineStep > params.T) {
      setTimelineStep(params.T);
    }
  }, [params.T, timelineStep]);

  const handleReset = () => {
    setParams({ ...DEFAULT_PARAMS });
    setTimelineStep(0);
  };

  const handleKappaChange = (newKappa: number) => {
    setParams(prev => ({ ...prev, kappa: newKappa }));
  };

  // Helper formatting numbers with 3 decimals
  const f3 = (v: number) => v.toFixed(3);

  return (
    <div className="min-h-screen bg-[#f6f7f9] dark:bg-[#13161c] text-[#1c2230] dark:text-[#e8ebf2] transition-colors duration-200">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-30 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-serif font-bold text-lg shadow-sm shadow-indigo-500/20">
              B
            </div>
            <div>
              <h1 className="font-serif font-bold text-lg sm:text-xl text-zinc-900 dark:text-zinc-100 leading-tight">
                Simulador del Modelo B: Sistema Abierto
              </h1>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 hidden sm:block">
                Red de investidura con entrada <span className="font-mono">s</span> y fuga <span className="font-mono">γ</span> · Matriz <span className="font-mono">W = (D + Dᵀ)/2</span> · Prueba de Emma
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsTheoryModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-medium text-zinc-700 dark:text-zinc-300 transition-colors"
            >
              <Info size={14} className="text-indigo-600 dark:text-indigo-400" />
              <span>Fundamentos</span>
            </button>

            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
              className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors"
            >
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Parameters (4 cols on lg) */}
          <div className="lg:col-span-4 space-y-4">
            <ParametersPanel
              params={params}
              onChange={setParams}
              onOpenJsonModal={() => setIsJsonModalOpen(true)}
              onReset={handleReset}
              error={error}
            />

            {/* Quick summary reminder */}
            <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/60 text-xs text-zinc-500 dark:text-zinc-400 space-y-1.5">
              <div className="font-semibold text-zinc-700 dark:text-zinc-300">
                Parámetros activos:
              </div>
              <div className="font-mono text-[11px] bg-zinc-100 dark:bg-zinc-800/80 p-2 rounded-md break-all">
                n={params.n}, ρ={params.rho}, L={params.L}, κ={params.kappa}, ent={params.ent}, s={params.s}, fuga=&quot;{params.fuga}&quot;, γ={params.gamma}, T={params.T}, tev={params.tev}
              </div>
            </div>
          </div>

          {/* Right Column: Visualizations & Metrics (8 cols on lg) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Simulation Status / Error notification */}
            {error && (
              <div className="p-4 rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-sm flex items-center gap-3">
                <AlertTriangle size={18} />
                <span>{error}</span>
              </div>
            )}

            {simulation && (
              <>
                {/* Metric Summary Rows */}
                <div className="space-y-3">
                  {/* Row 1: Stationary State with Selected Kappa */}
                  <div>
                    <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Activity size={14} className="text-indigo-600 dark:text-indigo-400" />
                      <span>Estado Estacionario (con κ = {params.kappa.toFixed(2)})</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                      <MetricCard
                        label="λ Cerrado"
                        value={f3(simulation.stationary.lambdaClosed)}
                        subtext="s = 0, γ = 0"
                        variant="highlight"
                      />
                      <MetricCard
                        label="λ Abierto"
                        value={f3(simulation.stationary.lambdaOpen)}
                        subtext="Con entrada y fuga"
                        variant="accent"
                      />
                      <MetricCard
                        label="Diferencia"
                        value={f3(simulation.stationary.diffLambda)}
                        subtext="λ_cerr - λ_abie"
                      />
                      <MetricCard
                        label="Masa Total"
                        value={f3(simulation.stationary.totalMass)}
                        subtext="∑ μ_i estacionaria"
                      />
                      <MetricCard
                        label="Entrada = Descarga"
                        value={`${f3(simulation.stationary.totalInput)} / ${f3(simulation.stationary.totalDischarge)}`}
                        variant={simulation.stationary.isBalanced ? 'ok' : 'bad'}
                        badge={simulation.stationary.isBalanced ? 'Balanceado' : 'Desbalance'}
                        icon={simulation.stationary.isBalanced ? <CheckCircle2 size={16} className="text-emerald-500" /> : undefined}
                      />
                    </div>
                  </div>

                  {/* Row 2: Emma's Test Metrics */}
                  <div>
                    <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Clock size={14} className="text-purple-600 dark:text-purple-400" />
                      <span>Prueba de Emma (Consistencia Interna de Investidura)</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <MetricCard
                        label="Masa Inscripta"
                        value={f3(simulation.emma.inscribedMass)}
                        subtext="mA + mB (en t=0)"
                        variant="highlight"
                      />
                      <MetricCard
                        label="Descarga Acumulada"
                        value={f3(simulation.emma.cumulativeDischarge)}
                        subtext={`En T = ${params.T} pasos`}
                        variant="accent"
                      />
                      <MetricCard
                        label="Exceso Energético"
                        value={f3(simulation.emma.excess)}
                        subtext="Descarga - Inscripta"
                        variant={simulation.emma.requiresSource ? 'bad' : 'ok'}
                      />
                      <MetricCard
                        label="¿Requiere Fuente?"
                        value={simulation.emma.requiresSource ? 'Sí' : 'No'}
                        badge={simulation.emma.requiresSource ? 'Fuente Pulsional' : 'Conservativo'}
                        subtext={
                          simulation.emma.crossoverStep
                            ? `Cruce en t* = ${simulation.emma.crossoverStep}`
                            : 'Sin ruptura de umbral'
                        }
                        variant={simulation.emma.requiresSource ? 'bad' : 'ok'}
                      />
                    </div>
                  </div>
                </div>

                {/* Tab Navigation for Detailed Views */}
                <div className="flex border-b border-zinc-200 dark:border-zinc-800 gap-2">
                  <button
                    onClick={() => setActiveTab('charts')}
                    className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
                      activeTab === 'charts'
                        ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                        : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
                    }`}
                  >
                    <Activity size={14} />
                    <span>Curvas y Análisis</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('network')}
                    className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
                      activeTab === 'network'
                        ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                        : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
                    }`}
                  >
                    <Network size={14} />
                    <span>Topología del Grafo</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('timeline')}
                    className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
                      activeTab === 'timeline'
                        ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                        : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
                    }`}
                  >
                    <Clock size={14} />
                    <span>Dinámica de Emma</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('matrices')}
                    className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
                      activeTab === 'matrices'
                        ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                        : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
                    }`}
                  >
                    <Grid3X3 size={14} />
                    <span>Matrices (P, J, D, W)</span>
                  </button>
                </div>

                {/* Tab Views */}
                {activeTab === 'charts' && (
                  <div className="space-y-6">
                    <LambdaChart
                      data={simulation.kappaCurve}
                      currentKappa={params.kappa}
                      onKappaSelect={handleKappaChange}
                    />
                    <EmmaChart
                      emma={simulation.emma}
                      T={params.T}
                      tev={params.tev}
                      onTimeSelect={t => {
                        setTimelineStep(t);
                        setActiveTab('timeline');
                      }}
                    />
                  </div>
                )}

                {activeTab === 'network' && (
                  <NetworkGraph
                    sim={simulation}
                    dynamicMasses={
                      timelineStep > 0
                        ? simulation.emma.history[timelineStep]?.masses
                        : undefined
                    }
                    dynamicTime={timelineStep > 0 ? timelineStep : undefined}
                  />
                )}

                {activeTab === 'timeline' && (
                  <EmmaTimeline
                    emma={simulation.emma}
                    T={params.T}
                    tev={params.tev}
                    n={params.n}
                    currentTime={timelineStep}
                    onTimeChange={setTimelineStep}
                  />
                )}

                {activeTab === 'matrices' && (
                  <MatrixViewer
                    matrices={simulation.matrices}
                    stationary={simulation.stationary}
                    kappa={params.kappa}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </main>

      {/* Modals */}
      <JsonModal
        isOpen={isJsonModalOpen}
        onClose={() => setIsJsonModalOpen(false)}
        params={params}
        onApply={p => {
          setParams(p);
          setTimelineStep(0);
        }}
      />

      <TheoryModal
        isOpen={isTheoryModalOpen}
        onClose={() => setIsTheoryModalOpen(false)}
      />
    </div>
  );
}
