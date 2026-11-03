import React, { useState, useRef } from 'react';
import { KappaPoint } from '../model/types';

interface LambdaChartProps {
  data: KappaPoint[];
  currentKappa: number;
  onKappaSelect?: (kappa: number) => void;
}

export const LambdaChart: React.FC<LambdaChartProps> = ({
  data,
  currentKappa,
  onKappaSelect,
}) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Dimensions & padding
  const width = 640;
  const height = 280;
  const padLeft = 45;
  const padRight = 20;
  const padTop = 20;
  const padBottom = 35;

  const chartW = width - padLeft - padRight;
  const chartH = height - padTop - padBottom;

  const xMin = 0;
  const xMax = 1;
  const yMin = 0;
  const yMax = 1.05;

  const getX = (k: number) => padLeft + ((k - xMin) / (xMax - xMin)) * chartW;
  const getY = (v: number) => height - padBottom - ((v - yMin) / (yMax - yMin)) * chartH;

  // Build path strings
  const closedPath = data
    .map((pt, i) => `${i === 0 ? 'M' : 'L'} ${getX(pt.kappa).toFixed(1)} ${getY(pt.lambdaClosed).toFixed(1)}`)
    .join(' ');

  const openPath = data
    .map((pt, i) => `${i === 0 ? 'M' : 'L'} ${getX(pt.kappa).toFixed(1)} ${getY(pt.lambdaOpen).toFixed(1)}`)
    .join(' ');

  // Handle mouse move for interactive inspection
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const scale = width / rect.width;
    const svgX = mouseX * scale;

    const relX = (svgX - padLeft) / chartW;
    const clampedRelX = Math.max(0, Math.min(1, relX));
    const closestIdx = Math.round(clampedRelX * (data.length - 1));
    setHoverIndex(closestIdx);
  };

  const handleMouseLeave = () => {
    setHoverIndex(null);
  };

  const handleClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!onKappaSelect || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const scale = width / rect.width;
    const svgX = mouseX * scale;
    const relX = (svgX - padLeft) / chartW;
    const k = Math.max(0, Math.min(1, Math.round(relX * 100) / 100));
    onKappaSelect(k);
  };

  const hoveredPoint = hoverIndex !== null ? data[hoverIndex] : null;

  // Selected kappa point
  const currentClosed = data.find(p => Math.abs(p.kappa - currentKappa) < 0.03)?.lambdaClosed ?? 1;
  const currentOpen = data.find(p => Math.abs(p.kappa - currentKappa) < 0.03)?.lambdaOpen ?? 0;

  return (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <div>
          <h3 className="font-serif font-bold text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <span>λ según κ</span>
            <span className="text-xs font-sans font-normal px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
              Reversibilidad / Balance detallado
            </span>
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Comparación entre red cerrada (aislada) y red abierta con entrada y fuga.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-medium">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-[#3f55d1] dark:bg-[#8ea0ff] inline-block shadow-xs" />
            <span className="text-zinc-700 dark:text-zinc-300">Cerrado (s=0, γ=0)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-[#c27a12] dark:bg-[#f0b24a] inline-block shadow-xs" />
            <span className="text-zinc-700 dark:text-zinc-300">Abierto (s, γ)</span>
          </div>
        </div>
      </div>

      <div ref={containerRef} className="relative w-full aspect-[2.3/1] min-h-[220px]">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full cursor-crosshair select-none"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onClick={handleClick}
        >
          {/* Grid lines horizontal */}
          {[0, 0.25, 0.5, 0.75, 1.0].map(v => {
            const y = getY(v);
            return (
              <g key={v}>
                <line
                  x1={padLeft}
                  y1={y}
                  x2={width - padRight}
                  y2={y}
                  stroke="currentColor"
                  className="text-zinc-200 dark:text-zinc-800 stroke-[1]"
                  strokeDasharray={v === 1.0 ? 'none' : '3,3'}
                />
                <text
                  x={padLeft - 6}
                  y={y + 3.5}
                  textAnchor="end"
                  className="fill-zinc-400 dark:fill-zinc-500 text-[10px] font-mono"
                >
                  {v.toFixed(2)}
                </text>
              </g>
            );
          })}

          {/* Grid lines vertical */}
          {[0, 0.2, 0.4, 0.6, 0.8, 1.0].map(v => {
            const x = getX(v);
            return (
              <g key={v}>
                <line
                  x1={x}
                  y1={padTop}
                  x2={x}
                  y2={height - padBottom}
                  stroke="currentColor"
                  className="text-zinc-200 dark:text-zinc-800 stroke-[1]"
                />
                <text
                  x={x}
                  y={height - padBottom + 15}
                  textAnchor="middle"
                  className="fill-zinc-400 dark:fill-zinc-500 text-[10px] font-mono"
                >
                  {v.toFixed(1)}
                </text>
              </g>
            );
          })}

          {/* Axis Labels */}
          <text
            x={width - padRight}
            y={height - padBottom + 15}
            textAnchor="end"
            className="fill-zinc-500 dark:fill-zinc-400 text-[11px] font-semibold"
          >
            κ (ligadura)
          </text>
          <text
            x={padLeft}
            y={padTop - 6}
            textAnchor="start"
            className="fill-zinc-500 dark:fill-zinc-400 text-[11px] font-semibold"
          >
            λ
          </text>

          {/* Lines */}
          <path
            d={closedPath}
            fill="none"
            className="stroke-[#3f55d1] dark:stroke-[#8ea0ff] stroke-[2.5]"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d={openPath}
            fill="none"
            className="stroke-[#c27a12] dark:stroke-[#f0b24a] stroke-[2.5]"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Current selected kappa vertical guideline */}
          <g>
            <line
              x1={getX(currentKappa)}
              y1={padTop}
              x2={getX(currentKappa)}
              y2={height - padBottom}
              stroke="currentColor"
              className="text-zinc-600 dark:text-zinc-400 stroke-[1.5]"
              strokeDasharray="4,4"
            />
            {/* Markers on current curves */}
            <circle
              cx={getX(currentKappa)}
              cy={getY(currentClosed)}
              r={4}
              className="fill-[#3f55d1] dark:fill-[#8ea0ff] stroke-white dark:stroke-zinc-900 stroke-[2]"
            />
            <circle
              cx={getX(currentKappa)}
              cy={getY(currentOpen)}
              r={4}
              className="fill-[#c27a12] dark:fill-[#f0b24a] stroke-white dark:stroke-zinc-900 stroke-[2]"
            />
          </g>

          {/* Hover highlight if active */}
          {hoveredPoint && (
            <g>
              <line
                x1={getX(hoveredPoint.kappa)}
                y1={padTop}
                x2={getX(hoveredPoint.kappa)}
                y2={height - padBottom}
                stroke="currentColor"
                className="text-amber-500/70 stroke-[1]"
              />
              <circle
                cx={getX(hoveredPoint.kappa)}
                cy={getY(hoveredPoint.lambdaClosed)}
                r={4.5}
                className="fill-[#3f55d1] dark:fill-[#8ea0ff] stroke-white dark:stroke-zinc-900 stroke-[1.5]"
              />
              <circle
                cx={getX(hoveredPoint.kappa)}
                cy={getY(hoveredPoint.lambdaOpen)}
                r={4.5}
                className="fill-[#c27a12] dark:fill-[#f0b24a] stroke-white dark:stroke-zinc-900 stroke-[1.5]"
              />
            </g>
          )}
        </svg>

        {/* Hover / Current Tooltip overlay */}
        {hoveredPoint ? (
          <div
            className="absolute top-2 right-2 pointer-events-none bg-zinc-900/90 dark:bg-zinc-800/95 text-white text-[11px] rounded-lg px-2.5 py-1.5 backdrop-blur-xs border border-zinc-700/50 shadow-md font-mono"
          >
            <div className="font-bold text-zinc-300">κ = {hoveredPoint.kappa.toFixed(2)}</div>
            <div className="text-[#8ea0ff] flex justify-between gap-3">
              <span>λ Cerrado:</span>
              <span>{hoveredPoint.lambdaClosed.toFixed(3)}</span>
            </div>
            <div className="text-[#f0b24a] flex justify-between gap-3">
              <span>λ Abierto:</span>
              <span>{hoveredPoint.lambdaOpen.toFixed(3)}</span>
            </div>
            <div className="text-zinc-400 flex justify-between gap-3 pt-0.5 border-t border-zinc-700/50 mt-0.5">
              <span>Δλ:</span>
              <span>{(hoveredPoint.lambdaClosed - hoveredPoint.lambdaOpen).toFixed(3)}</span>
            </div>
          </div>
        ) : (
          <div className="absolute top-2 right-2 pointer-events-none bg-zinc-100/80 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 text-[11px] rounded-lg px-2 py-1 backdrop-blur-xs font-mono">
            <span>κ seleccionado: {currentKappa.toFixed(2)}</span>
          </div>
        )}
      </div>

      <div className="mt-2 text-xs text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800/50 p-2.5 rounded-lg border border-zinc-100 dark:border-zinc-800">
        <span className="font-semibold text-zinc-700 dark:text-zinc-300">Lema 6:</span> Con κ = 0 el sistema cerrado da λ = 1 (reversibilidad exacta por simetría de W). En el sistema abierto, λ &lt; 1 refleja la asimetría impuesta por la entrada s y la disipación γ en nodos específicos.
      </div>
    </div>
  );
};
