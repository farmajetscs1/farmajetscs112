import React, { useState, useEffect } from 'react';
import { EmmaTestResult } from '../model/types';
import { Play, Pause, RotateCcw, SkipBack, SkipForward, Zap } from 'lucide-react';

interface EmmaTimelineProps {
  emma: EmmaTestResult;
  T: number;
  tev: number;
  n: number;
  currentTime: number;
  onTimeChange: (t: number) => void;
}

export const EmmaTimeline: React.FC<EmmaTimelineProps> = ({
  emma,
  T,
  tev,
  n,
  currentTime,
  onTimeChange,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(200); // ms per step

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      onTimeChange(currentTime >= T ? 0 : currentTime + 1);
      if (currentTime >= T) {
        setIsPlaying(false);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [isPlaying, currentTime, T, speed, onTimeChange]);

  const stepData = emma.history[currentTime] || emma.history[0];
  const maxStepMass = Math.max(...(stepData.masses || [1]), 0.5);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div>
          <h3 className="font-serif font-bold text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <span>Dinámica Temporal de la Prueba de Emma</span>
            {stepData.eventActive && (
              <span className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 animate-pulse">
                <Zap size={12} />
                Evento Activo (t ≥ {tev})
              </span>
            )}
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Paso a paso de la circulación de investidura, activación del recuerdo y descarga.
          </p>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setIsPlaying(false);
              onTimeChange(0);
            }}
            title="Reiniciar a t=0"
            className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 transition-colors"
          >
            <RotateCcw size={15} />
          </button>
          <button
            onClick={() => onTimeChange(Math.max(0, currentTime - 1))}
            disabled={currentTime <= 0}
            title="Paso anterior"
            className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-40 text-zinc-600 dark:text-zinc-300 transition-colors"
          >
            <SkipBack size={15} />
          </button>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs transition-colors shadow-xs"
          >
            {isPlaying ? <Pause size={14} /> : <Play size={14} />}
            <span>{isPlaying ? 'Pausar' : 'Reproducir'}</span>
          </button>
          <button
            onClick={() => onTimeChange(Math.min(T, currentTime + 1))}
            disabled={currentTime >= T}
            title="Paso siguiente"
            className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-40 text-zinc-600 dark:text-zinc-300 transition-colors"
          >
            <SkipForward size={15} />
          </button>

          {/* Speed Selector */}
          <select
            value={speed}
            onChange={e => setSpeed(Number(e.target.value))}
            className="text-xs py-1 px-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
          >
            <option value={400}>0.5x</option>
            <option value={200}>1x</option>
            <option value={100}>2x</option>
          </select>
        </div>
      </div>

      {/* Timeline Scrubber */}
      <div className="bg-zinc-50 dark:bg-zinc-800/40 p-3 rounded-lg border border-zinc-200/80 dark:border-zinc-700/60 mb-4">
        <div className="flex justify-between items-center text-xs font-mono mb-1.5 text-zinc-600 dark:text-zinc-300">
          <span>Paso Actual: <strong className="text-indigo-600 dark:text-indigo-400 font-bold text-sm">t = {currentTime}</strong> / {T}</span>
          <span>
            Descarga acumulada: <strong className="text-amber-600 dark:text-amber-400">{stepData.cumulativeDischarge.toFixed(3)}</strong>
            {' '}(Inscripta: {emma.inscribedMass.toFixed(2)})
          </span>
        </div>

        <div className="relative flex items-center">
          <input
            type="range"
            min={0}
            max={T}
            value={currentTime}
            onChange={e => onTimeChange(parseInt(e.target.value, 10))}
            className="w-full accent-indigo-600 cursor-pointer h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none"
          />
          {/* Event onset pin on slider */}
          <div
            className="absolute top-1/2 -translate-y-1/2 pointer-events-none w-1 h-4 bg-purple-500 rounded-full"
            style={{ left: `${(Math.min(tev, T) / T) * 100}%` }}
            title={`Evento en t = ${tev}`}
          />
        </div>
        <div className="flex justify-between text-[10px] text-zinc-400 mt-1 font-mono">
          <span>t = 0 (Inscripción)</span>
          <span className="text-purple-500 font-semibold">t = {tev} (Evento trauma)</span>
          <span>t = {T} (Final)</span>
        </div>
      </div>

      {/* Bar Chart: Node Masses at Current Step */}
      <div className="flex-1 flex flex-col justify-end">
        <div className="flex justify-between items-center mb-1 text-xs text-zinc-500 dark:text-zinc-400">
          <span className="font-medium">Masa de investidura por nodo en t = {currentTime}:</span>
          <span className="text-[11px] font-mono">Max: {maxStepMass.toFixed(2)}</span>
        </div>

        <div className="h-44 bg-zinc-50/50 dark:bg-zinc-950/40 rounded-lg border border-zinc-100 dark:border-zinc-800 p-2.5 flex items-end gap-1.5 overflow-x-auto">
          {Array.from({ length: n }, (_, i) => {
            const mass = stepData.masses[i] || 0;
            const heightPercent = Math.max(3, (mass / maxStepMass) * 100);
            const isNode1 = i === 0;
            const isNode2 = i === 1;

            return (
              <div
                key={i}
                className="flex-1 min-w-[20px] flex flex-col items-center gap-1 group relative h-full justify-end"
              >
                {/* Value tooltip on hover */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-7 text-[10px] font-mono bg-zinc-900 text-white px-1.5 py-0.5 rounded pointer-events-none whitespace-nowrap z-10">
                  {mass.toFixed(3)}
                </div>

                {/* Bar */}
                <div
                  style={{ height: `${heightPercent}%` }}
                  className={`w-full rounded-t-sm transition-all duration-150 ${
                    isNode1 || isNode2
                      ? 'bg-blue-500 dark:bg-blue-400'
                      : 'bg-indigo-500 dark:bg-indigo-400'
                  } group-hover:brightness-110 shadow-xs`}
                />

                {/* Node ID */}
                <span className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400">
                  {i + 1}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
