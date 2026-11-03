import React, { useState } from 'react';
import { SimParams } from '../model/types';
import { PRESETS, DEFAULT_PARAMS } from '../model/simulation';
import { RotateCcw, Play, FileJson, Sparkles, Sliders } from 'lucide-react';

interface ParametersPanelProps {
  params: SimParams;
  onChange: (params: SimParams) => void;
  onOpenJsonModal: () => void;
  onReset: () => void;
  error: string | null;
}

export const ParametersPanel: React.FC<ParametersPanelProps> = ({
  params,
  onChange,
  onOpenJsonModal,
  onReset,
  error,
}) => {
  const [activeGroup, setActiveGroup] = useState<'network' | 'dynamics' | 'emma'>('dynamics');

  const update = <K extends keyof SimParams>(key: K, value: SimParams[K]) => {
    onChange({
      ...params,
      [key]: value,
    });
  };

  const handlePresetSelect = (presetIndex: number) => {
    if (PRESETS[presetIndex]) {
      onChange({ ...PRESETS[presetIndex].params });
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-xs flex flex-col gap-4">
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
        <div className="flex items-center gap-2">
          <Sliders size={18} className="text-indigo-600 dark:text-indigo-400" />
          <h2 className="font-serif font-bold text-lg text-zinc-900 dark:text-zinc-100">
            Parámetros del Modelo
          </h2>
        </div>

        <button
          onClick={onOpenJsonModal}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors"
          title="Importar o Exportar JSON"
        >
          <FileJson size={14} />
          <span>JSON</span>
        </button>
      </div>

      {/* Preset Selector */}
      <div>
        <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1 flex items-center gap-1">
          <Sparkles size={12} className="text-amber-500" />
          <span>Configuraciones Predefinidas</span>
        </label>
        <select
          onChange={e => handlePresetSelect(parseInt(e.target.value, 10))}
          defaultValue={0}
          className="w-full text-xs py-2 px-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
        >
          {PRESETS.map((p, idx) => (
            <option key={idx} value={idx}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {/* Group Navigation Tabs */}
      <div className="flex rounded-lg bg-zinc-100 dark:bg-zinc-800/80 p-1 text-xs font-medium text-zinc-600 dark:text-zinc-400">
        <button
          type="button"
          onClick={() => setActiveGroup('network')}
          className={`flex-1 py-1.5 rounded-md transition-colors text-center ${
            activeGroup === 'network'
              ? 'bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-300 font-bold shadow-xs'
              : 'hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          Red y Matriz D
        </button>
        <button
          type="button"
          onClick={() => setActiveGroup('dynamics')}
          className={`flex-1 py-1.5 rounded-md transition-colors text-center ${
            activeGroup === 'dynamics'
              ? 'bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-300 font-bold shadow-xs'
              : 'hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          Dinámica Abierta
        </button>
        <button
          type="button"
          onClick={() => setActiveGroup('emma')}
          className={`flex-1 py-1.5 rounded-md transition-colors text-center ${
            activeGroup === 'emma'
              ? 'bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-300 font-bold shadow-xs'
              : 'hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          Prueba de Emma
        </button>
      </div>

      {/* Section 1: Network & Learning */}
      {activeGroup === 'network' && (
        <div className="space-y-3">
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <label htmlFor="param-n" className="font-medium text-zinc-700 dark:text-zinc-300">Nodos n (3 a 40)</label>
              <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{params.n}</span>
            </div>
            <input
              id="param-n"
              type="range"
              min={3}
              max={40}
              step={1}
              value={params.n}
              onChange={e => update('n', parseInt(e.target.value, 10))}
              className="w-full accent-indigo-600"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <label htmlFor="param-rho" className="font-medium text-zinc-700 dark:text-zinc-300">Orden de secuencia ρ (0 a 1)</label>
              <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{params.rho.toFixed(2)}</span>
            </div>
            <input
              id="param-rho"
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={params.rho}
              onChange={e => update('rho', parseFloat(e.target.value))}
              className="w-full accent-indigo-600"
            />
            <p className="text-[11px] text-zinc-400">1 = ciclo determinista (i→i+1), 0 = aleatorio puro.</p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label htmlFor="param-L" className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Longitud L
              </label>
              <input
                id="param-L"
                type="number"
                min={10}
                max={5000}
                step={50}
                value={params.L}
                onChange={e => update('L', parseInt(e.target.value, 10) || 10)}
                className="w-full font-mono text-xs p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label htmlFor="param-seed" className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Semilla
              </label>
              <input
                id="param-seed"
                type="number"
                min={1}
                max={99999}
                value={params.seed}
                onChange={e => update('seed', parseInt(e.target.value, 10) || 1)}
                className="w-full font-mono text-xs p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
              />
            </div>
          </div>

          <div>
            <label htmlFor="param-eps" className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Suavizado ε (regularización)
            </label>
            <input
              id="param-eps"
              type="number"
              step="any"
              min={0.00001}
              max={1}
              value={params.eps}
              onChange={e => update('eps', parseFloat(e.target.value) || 0.001)}
              className="w-full font-mono text-xs p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
            />
          </div>
        </div>
      )}

      {/* Section 2: Open Dynamics */}
      {activeGroup === 'dynamics' && (
        <div className="space-y-3">
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <label htmlFor="param-kappa" className="font-medium text-zinc-700 dark:text-zinc-300">
                κ (ligadura del Yo, 0 a 1)
              </label>
              <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                {params.kappa.toFixed(2)}
              </span>
            </div>
            <input
              id="param-kappa"
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={params.kappa}
              onChange={e => update('kappa', parseFloat(e.target.value))}
              className="w-full accent-indigo-600"
            />
            <div className="flex justify-between text-[10px] text-zinc-400">
              <span>0 (Difusión simétrica W)</span>
              <span>1 (Huella dirigida D)</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label htmlFor="param-ent" className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Nodo Entrada s (1..{params.n})
              </label>
              <input
                id="param-ent"
                type="number"
                min={1}
                max={params.n}
                value={params.ent}
                onChange={e => update('ent', parseInt(e.target.value, 10) || 1)}
                className="w-full font-mono text-xs p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label htmlFor="param-s" className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Intensidad Entrada s
              </label>
              <input
                id="param-s"
                type="number"
                step="any"
                min={0}
                value={params.s}
                onChange={e => update('s', parseFloat(e.target.value) || 0)}
                className="w-full font-mono text-xs p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label htmlFor="param-fuga" className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Nodos Fuga (ej: &quot;12&quot; o &quot;6, 12&quot;)
              </label>
              <input
                id="param-fuga"
                type="text"
                value={params.fuga}
                onChange={e => update('fuga', e.target.value)}
                placeholder="12"
                className="w-full font-mono text-xs p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label htmlFor="param-gamma" className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Fuga γ (0 a 0,99)
              </label>
              <input
                id="param-gamma"
                type="number"
                step="0.05"
                min={0}
                max={0.99}
                value={params.gamma}
                onChange={e => update('gamma', parseFloat(e.target.value) || 0)}
                className="w-full font-mono text-xs p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
              />
            </div>
          </div>
        </div>
      )}

      {/* Section 3: Emma's Test */}
      {activeGroup === 'emma' && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label htmlFor="param-T" className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Pasos T
              </label>
              <input
                id="param-T"
                type="number"
                min={10}
                max={300}
                value={params.T}
                onChange={e => update('T', parseInt(e.target.value, 10) || 10)}
                className="w-full font-mono text-xs p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label htmlFor="param-tev" className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Paso del Evento tev
              </label>
              <input
                id="param-tev"
                type="number"
                min={1}
                max={params.T}
                value={params.tev}
                onChange={e => update('tev', parseInt(e.target.value, 10) || 1)}
                className="w-full font-mono text-xs p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label htmlFor="param-mA" className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Masa Inscripta mA (Nodo 1)
              </label>
              <input
                id="param-mA"
                type="number"
                step="any"
                min={0}
                value={params.mA}
                onChange={e => update('mA', parseFloat(e.target.value) || 0)}
                className="w-full font-mono text-xs p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label htmlFor="param-mB" className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Masa Inscripta mB (Nodo 2)
              </label>
              <input
                id="param-mB"
                type="number"
                step="any"
                min={0}
                value={params.mB}
                onChange={e => update('mB', parseFloat(e.target.value) || 0)}
                className="w-full font-mono text-xs p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label htmlFor="param-nEv" className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Nodo del Evento nEv
              </label>
              <input
                id="param-nEv"
                type="number"
                min={1}
                max={params.n}
                value={params.nEv}
                onChange={e => update('nEv', parseInt(e.target.value, 10) || 1)}
                className="w-full font-mono text-xs p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label htmlFor="param-sEv" className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Entrada Evento s_ev
              </label>
              <input
                id="param-sEv"
                type="number"
                step="any"
                min={0}
                value={params.sEv}
                onChange={e => update('sEv', parseFloat(e.target.value) || 0)}
                className="w-full font-mono text-xs p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
              />
            </div>
          </div>
        </div>
      )}

      {/* Error message display */}
      {error && (
        <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-medium">
          {error}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
        <button
          onClick={onReset}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-semibold transition-colors"
        >
          <RotateCcw size={14} />
          <span>Restablecer</span>
        </button>
      </div>
    </div>
  );
};
