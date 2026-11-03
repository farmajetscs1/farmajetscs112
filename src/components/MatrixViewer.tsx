import React, { useState } from 'react';
import { BuiltMatrices, StationaryState } from '../model/types';

interface MatrixViewerProps {
  matrices: BuiltMatrices;
  stationary: StationaryState;
  kappa: number;
}

export const MatrixViewer: React.FC<MatrixViewerProps> = ({
  matrices,
  stationary,
  kappa,
}) => {
  const [activeTab, setActiveTab] = useState<'Pk' | 'D' | 'W' | 'J'>('Pk');
  const [hoveredCell, setHoveredCell] = useState<{ r: number; c: number; v: number } | null>(null);

  const getMatrix = () => {
    switch (activeTab) {
      case 'Pk':
        return { data: matrices.Pk, name: `P(κ = ${kappa.toFixed(2)})`, desc: 'Matriz estocástica de transición combinada (1-κ)Pl + κPg' };
      case 'D':
        return { data: matrices.D, name: 'D (Frecuencias aprendidas)', desc: 'Huellas mnémicas secuenciales no simétricas de longitud L' };
      case 'W':
        return { data: matrices.W, name: 'W (Simetrizada)', desc: 'Investidura ligada localmente W = (D + Dᵀ)/2' };
      case 'J':
        return { data: stationary.J, name: 'J (Flujos estacionarios)', desc: 'Flujo neto entre nodos J_ij = μ_i · (1 - γ_i) · P_ij' };
    }
  };

  const { data: matrix, name, desc } = getMatrix();
  const n = matrix.length;

  const maxVal = Math.max(...matrix.flatMap(row => row), 1e-9);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div>
          <h3 className="font-serif font-bold text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <span>Inspector de Matrices</span>
            <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
              {n} × {n}
            </span>
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">{desc}</p>
        </div>

        {/* Matrix Tab Buttons */}
        <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg text-xs font-medium">
          <button
            onClick={() => setActiveTab('Pk')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              activeTab === 'Pk'
                ? 'bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-300 font-bold shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            P(κ)
          </button>
          <button
            onClick={() => setActiveTab('J')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              activeTab === 'J'
                ? 'bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-300 font-bold shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            Flujo J
          </button>
          <button
            onClick={() => setActiveTab('D')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              activeTab === 'D'
                ? 'bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-300 font-bold shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            D
          </button>
          <button
            onClick={() => setActiveTab('W')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              activeTab === 'W'
                ? 'bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-300 font-bold shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            W
          </button>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="relative flex-1 overflow-auto rounded-lg border border-zinc-200 dark:border-zinc-800 max-h-[380px]">
        <table className="w-full border-collapse font-mono text-[10px] text-center">
          <thead>
            <tr className="sticky top-0 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 z-10 border-b border-zinc-200 dark:border-zinc-700">
              <th className="p-1.5 w-8 font-semibold">i \ j</th>
              {Array.from({ length: n }, (_, j) => (
                <th key={j} className="p-1 min-w-[32px] font-semibold">
                  {j + 1}
                </th>
              ))}
              <th className="p-1 min-w-[40px] text-zinc-400 font-normal">Σ</th>
            </tr>
          </thead>
          <tbody>
            {matrix.map((row, i) => {
              const rowSum = row.reduce((a, b) => a + b, 0);
              return (
                <tr key={i} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                  <td className="sticky left-0 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 font-semibold p-1 border-r border-zinc-200 dark:border-zinc-700">
                    {i + 1}
                  </td>
                  {row.map((val, j) => {
                    const intensity = Math.min(1, val / maxVal);
                    // Blue-indigo heat scale
                    const isHovered =
                      hoveredCell?.r === i && hoveredCell?.c === j;

                    return (
                      <td
                        key={j}
                        onMouseEnter={() => setHoveredCell({ r: i, c: j, v: val })}
                        onMouseLeave={() => setHoveredCell(null)}
                        style={{
                          backgroundColor:
                            intensity > 0.001
                              ? `rgba(63, 85, 209, ${0.08 + intensity * 0.75})`
                              : undefined,
                          color: intensity > 0.45 ? '#ffffff' : undefined,
                        }}
                        className={`p-1 cursor-crosshair transition-colors border-b border-zinc-100 dark:border-zinc-800/60 ${
                          isHovered ? 'ring-2 ring-amber-500 z-10' : ''
                        }`}
                        title={`De nodo ${i + 1} a nodo ${j + 1}: ${val.toFixed(4)}`}
                      >
                        {val >= 10 ? val.toFixed(1) : val >= 0.001 ? val.toFixed(3) : '0'}
                      </td>
                    );
                  })}
                  <td className="p-1 text-zinc-400 dark:text-zinc-500 border-l border-zinc-100 dark:border-zinc-800 text-[9px]">
                    {rowSum.toFixed(2)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer Cell Inspector */}
      <div className="mt-2.5 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 pt-2 border-t border-zinc-100 dark:border-zinc-800 font-mono">
        <div>
          {hoveredCell ? (
            <span>
              Celda ({hoveredCell.r + 1} → {hoveredCell.c + 1}): <strong className="text-indigo-600 dark:text-indigo-400 font-bold">{hoveredCell.v.toFixed(5)}</strong>
            </span>
          ) : (
            <span>Pasa el cursor sobre una celda para ver el valor exacto.</span>
          )}
        </div>
        <div className="text-[11px] font-sans">
          Valor máx: <span className="font-mono font-semibold">{maxVal.toFixed(4)}</span>
        </div>
      </div>
    </div>
  );
};
