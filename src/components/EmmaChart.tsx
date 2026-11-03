import React, { useState, useRef } from 'react';
import { EmmaTestResult } from '../model/types';

interface EmmaChartProps {
  emma: EmmaTestResult;
  T: number;
  tev: number;
  hoverTime?: number | null;
  onTimeSelect?: (t: number) => void;
}

export const EmmaChart: React.FC<EmmaChartProps> = ({
  emma,
  T,
  tev,
  hoverTime,
  onTimeSelect,
}) => {
  const [internalHover, setInternalHover] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const activeTime = hoverTime ?? internalHover;

  const width = 640;
  const height = 280;
  const padLeft = 45;
  const padRight = 20;
  const padTop = 25;
  const padBottom = 35;

  const chartW = width - padLeft - padRight;
  const chartH = height - padTop - padBottom;

  const maxVal = Math.max(emma.cumulativeDischarge, emma.inscribedMass) * 1.15 || 1;
  const xMin = 0;
  const xMax = T;
  const yMin = 0;
  const yMax = maxVal;

  const getX = (t: number) => padLeft + ((t - xMin) / (xMax - xMin || 1)) * chartW;
  const getY = (v: number) => height - padBottom - ((v - yMin) / (yMax - yMin)) * chartH;

  // Path for cumulative discharge line
  const cumPath = emma.history
    .map((step, i) => `${i === 0 ? 'M' : 'L'} ${getX(step.t).toFixed(1)} ${getY(step.cumulativeDischarge).toFixed(1)}`)
    .join(' ');

  // Area under cumulative discharge
  const areaPath = `${cumPath} L ${getX(T)} ${getY(0)} L ${getX(0)} ${getY(0)} Z`;

  // Horizontal line for inscribed mass
  const yInsc = getY(emma.inscribedMass);

  // Event vertical line
  const xTev = getX(Math.min(tev, T));

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const scale = width / rect.width;
    const svgX = mouseX * scale;
    const relX = (svgX - padLeft) / chartW;
    const t = Math.max(0, Math.min(T, Math.round(relX * T)));
    setInternalHover(t);
  };

  const handleMouseLeave = () => {
    setInternalHover(null);
  };

  const handleClick = () => {
    if (onTimeSelect && activeTime !== null) {
      onTimeSelect(activeTime);
    }
  };

  const currentStep = activeTime !== null && activeTime >= 0 && activeTime < emma.history.length
    ? emma.history[activeTime]
    : emma.history[emma.history.length - 1];

  return (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <div>
          <h3 className="font-serif font-bold text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <span>Prueba de Emma: Descarga Acumulada</span>
            {emma.requiresSource ? (
              <span className="text-xs font-sans font-semibold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
                Requiere fuente (Exceso &gt; 0)
              </span>
            ) : (
              <span className="text-xs font-sans font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900">
                Conservativo (Sin fuente)
              </span>
            )}
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Comprobación de la conservación energética del trauma: masa inscripta vs descarga a través del tiempo.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-medium">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-[#c27a12] dark:bg-[#f0b24a] inline-block shadow-xs" />
            <span className="text-zinc-700 dark:text-zinc-300">Descarga acumulada</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-[#3f55d1] dark:bg-[#8ea0ff] inline-block" />
            <span className="text-zinc-700 dark:text-zinc-300">Masa inscripta (mA + mB)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 border-t border-dashed border-zinc-400 inline-block" />
            <span className="text-zinc-500">Evento (tev)</span>
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
          <defs>
            <linearGradient id="cumGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f0b24a" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#c27a12" stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {/* Grid lines horizontal */}
          {[0, 0.25, 0.5, 0.75, 1.0].map(ratio => {
            const val = yMin + ratio * (yMax - yMin);
            const y = getY(val);
            return (
              <g key={ratio}>
                <line
                  x1={padLeft}
                  y1={y}
                  x2={width - padRight}
                  y2={y}
                  stroke="currentColor"
                  className="text-zinc-200 dark:text-zinc-800 stroke-[1]"
                  strokeDasharray="3,3"
                />
                <text
                  x={padLeft - 6}
                  y={y + 3.5}
                  textAnchor="end"
                  className="fill-zinc-400 dark:fill-zinc-500 text-[10px] font-mono"
                >
                  {val.toFixed(2)}
                </text>
              </g>
            );
          })}

          {/* Grid lines vertical */}
          {[0, 0.25, 0.5, 0.75, 1.0].map(ratio => {
            const tVal = Math.round(ratio * T);
            const x = getX(tVal);
            return (
              <g key={ratio}>
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
                  {tVal}
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
            t (pasos)
          </text>
          <text
            x={padLeft}
            y={padTop - 8}
            textAnchor="start"
            className="fill-zinc-500 dark:fill-zinc-400 text-[11px] font-semibold"
          >
            Investidura / Descarga
          </text>

          {/* Area under curve */}
          <path d={areaPath} fill="url(#cumGradient)" />

          {/* Cumulative Discharge Curve */}
          <path
            d={cumPath}
            fill="none"
            className="stroke-[#c27a12] dark:stroke-[#f0b24a] stroke-[2.5]"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Horizontal line for Inscribed Mass */}
          <line
            x1={padLeft}
            y1={yInsc}
            x2={width - padRight}
            y2={yInsc}
            className="stroke-[#3f55d1] dark:stroke-[#8ea0ff] stroke-[2]"
            strokeDasharray="5,3"
          />
          <text
            x={width - padRight - 4}
            y={yInsc - 5}
            textAnchor="end"
            className="fill-[#3f55d1] dark:fill-[#8ea0ff] text-[10px] font-mono font-bold"
          >
            mA + mB = {emma.inscribedMass.toFixed(2)}
          </text>

          {/* Event onset vertical line */}
          <line
            x1={xTev}
            y1={padTop}
            x2={xTev}
            y2={height - padBottom}
            className="stroke-purple-500 dark:stroke-purple-400 stroke-[1.5]"
            strokeDasharray="4,4"
          />
          <text
            x={xTev + 4}
            y={padTop + 10}
            className="fill-purple-600 dark:fill-purple-400 text-[10px] font-mono font-semibold"
          >
            tev = {tev}
          </text>

          {/* Crossover point marker if present */}
          {emma.crossoverStep !== null && (
            <g>
              <circle
                cx={getX(emma.crossoverStep)}
                cy={yInsc}
                r={5}
                className="fill-rose-500 stroke-white dark:stroke-zinc-900 stroke-[2] animate-pulse"
              />
              <text
                x={getX(emma.crossoverStep) + 6}
                y={yInsc + 12}
                className="fill-rose-600 dark:fill-rose-400 text-[9px] font-bold font-mono"
              >
                Cruce t* = {emma.crossoverStep}
              </text>
            </g>
          )}

          {/* Interactive cursor line */}
          {activeTime !== null && currentStep && (
            <g>
              <line
                x1={getX(activeTime)}
                y1={padTop}
                x2={getX(activeTime)}
                y2={height - padBottom}
                className="stroke-zinc-500 stroke-[1]"
                strokeDasharray="2,2"
              />
              <circle
                cx={getX(activeTime)}
                cy={getY(currentStep.cumulativeDischarge)}
                r={4.5}
                className="fill-[#c27a12] dark:fill-[#f0b24a] stroke-white dark:stroke-zinc-900 stroke-[1.5]"
              />
            </g>
          )}
        </svg>

        {/* Dynamic Tooltip */}
        {currentStep && (
          <div className="absolute top-2 right-2 pointer-events-none bg-zinc-900/90 dark:bg-zinc-800/95 text-white text-[11px] rounded-lg px-2.5 py-1.5 backdrop-blur-xs border border-zinc-700/50 shadow-md font-mono">
            <div className="font-bold text-zinc-300 flex justify-between gap-4">
              <span>Paso t = {currentStep.t}</span>
              {currentStep.eventActive && (
                <span className="text-purple-400 font-semibold">[Evento activo]</span>
              )}
            </div>
            <div className="text-[#f0b24a] flex justify-between gap-4">
              <span>Descarga acum:</span>
              <span>{currentStep.cumulativeDischarge.toFixed(3)}</span>
            </div>
            <div className="text-[#8ea0ff] flex justify-between gap-4">
              <span>Masa inscripta:</span>
              <span>{emma.inscribedMass.toFixed(3)}</span>
            </div>
            <div className="text-zinc-400 flex justify-between gap-4 pt-0.5 border-t border-zinc-700/50 mt-0.5">
              <span>Exceso temporal:</span>
              <span className={currentStep.cumulativeDischarge > emma.inscribedMass ? 'text-rose-400 font-bold' : ''}>
                {(currentStep.cumulativeDischarge - emma.inscribedMass).toFixed(3)}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="mt-2 text-xs text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800/50 p-2.5 rounded-lg border border-zinc-100 dark:border-zinc-800">
        <span className="font-semibold text-zinc-700 dark:text-zinc-300">Consistencia Teórica:</span> Antes del evento no hay entrada. En t ≥ tev se activa s_ev en el nodo del evento. Si la descarga acumulada supera lo inscripto (mA + mB), el modelo requiere una fuente pulsional externa continuada.
      </div>
    </div>
  );
};
