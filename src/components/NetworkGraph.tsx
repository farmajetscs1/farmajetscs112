import React, { useState, useMemo } from 'react';
import { SimulationResult } from '../model/types';

interface NetworkGraphProps {
  sim: SimulationResult;
  dynamicMasses?: number[];
  dynamicTime?: number;
}

export const NetworkGraph: React.FC<NetworkGraphProps> = ({
  sim,
  dynamicMasses,
  dynamicTime,
}) => {
  const [selectedNode, setSelectedNode] = useState<number | null>(null);
  const [showFluxEdges, setShowFluxEdges] = useState<boolean>(true);
  const [edgeThreshold, setEdgeThreshold] = useState<number>(0.05);

  const { params, parsed, matrices, stationary } = sim;
  const n = params.n;
  const activeMasses = dynamicMasses || stationary.mu;

  // Layout calculation: circular positioning
  const width = 560;
  const height = 480;
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(centerX, centerY) - 75;

  const nodes = useMemo(() => {
    const maxMass = Math.max(...activeMasses, 0.001);

    return Array.from({ length: n }, (_, i) => {
      const angle = (2 * Math.PI * i) / n - Math.PI / 2;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      const mass = activeMasses[i] || 0;
      const statMass = stationary.mu[i] || 0;

      // Role flags
      const isInput = i === parsed.a || i === (params.ent - 1);
      const isEnt = i === (params.ent - 1);
      const isLeak = parsed.g[i] > 0;
      const isEvent = i === (params.nEv - 1);
      const isNodeA = i === 0;
      const isNodeB = i === 1;

      // Sizing
      const normalizedMass = Math.sqrt(mass / maxMass);
      const nodeR = 14 + normalizedMass * 18;

      return {
        id: i + 1,
        index: i,
        x,
        y,
        angle,
        mass,
        statMass,
        nodeR,
        isEnt,
        isLeak,
        isEvent,
        isNodeA,
        isNodeB,
        gamma: parsed.g[i],
        input: parsed.s[i],
        eventInput: parsed.e[i],
      };
    });
  }, [n, activeMasses, stationary.mu, parsed, params, radius, centerX, centerY]);

  // Edges based on transition matrix Pk or Flux J
  const edges = useMemo(() => {
    if (!showFluxEdges) return [];
    const res: Array<{
      from: number;
      to: number;
      x1: number;
      y1: number;
      x2: number;
      y2: number;
      val: number;
      flux: number;
    }> = [];

    const J = stationary.J;
    const maxFlux = Math.max(...J.flatMap(row => row), 0.001);

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (i === j) continue;
        const flux = J[i][j];
        const prob = matrices.Pk[i][j];
        const normalized = flux / maxFlux;

        if (normalized >= edgeThreshold || prob >= 0.2) {
          const fromNode = nodes[i];
          const toNode = nodes[j];
          res.push({
            from: i + 1,
            to: j + 1,
            x1: fromNode.x,
            y1: fromNode.y,
            x2: toNode.x,
            y2: toNode.y,
            val: normalized,
            flux,
          });
        }
      }
    }
    return res;
  }, [showFluxEdges, edgeThreshold, stationary.J, matrices.Pk, n, nodes]);

  const activeSelected = selectedNode !== null ? nodes[selectedNode - 1] : null;

  return (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <div>
          <h3 className="font-serif font-bold text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <span>Topología y Flujo de la Red</span>
            {dynamicTime !== undefined ? (
              <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                Paso t = {dynamicTime}
              </span>
            ) : (
              <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                Estado Estacionario
              </span>
            )}
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Distribución de investidura y arcos de transición entre los {n} nodos del sistema.
          </p>
        </div>

        {/* Graph Controls */}
        <div className="flex items-center gap-3 text-xs">
          <label className="flex items-center gap-1.5 cursor-pointer text-zinc-600 dark:text-zinc-300">
            <input
              type="checkbox"
              checked={showFluxEdges}
              onChange={e => setShowFluxEdges(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500"
            />
            <span>Mostrar Arcos</span>
          </label>

          {showFluxEdges && (
            <div className="flex items-center gap-1.5 text-zinc-500">
              <span>Umbral:</span>
              <input
                type="range"
                min="0.01"
                max="0.3"
                step="0.02"
                value={edgeThreshold}
                onChange={e => setEdgeThreshold(parseFloat(e.target.value))}
                className="w-16 accent-indigo-600 cursor-pointer"
              />
            </div>
          )}
        </div>
      </div>

      <div className="relative w-full aspect-[1.15/1] min-h-[380px] bg-zinc-50/50 dark:bg-zinc-950/40 rounded-xl border border-zinc-100 dark:border-zinc-800/80 overflow-hidden flex items-center justify-center">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full select-none"
        >
          <defs>
            <marker
              id="arrowhead"
              markerWidth="8"
              markerHeight="6"
              refX="7"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 8 3, 0 6" fill="#8ea0ff" opacity="0.7" />
            </marker>
          </defs>

          {/* Central Guide Circle */}
          <circle
            cx={centerX}
            cy={centerY}
            r={radius}
            fill="none"
            stroke="currentColor"
            className="text-zinc-200/70 dark:text-zinc-800/70 stroke-[1]"
            strokeDasharray="4,6"
          />

          {/* Directed Edges / Flux Curves */}
          {edges.map((edge, idx) => {
            // Offset control point towards center for subtle curve
            const midX = (edge.x1 + edge.x2) / 2;
            const midY = (edge.y1 + edge.y2) / 2;
            const bendFactor = 0.15;
            const ctrlX = midX + (centerX - midX) * bendFactor;
            const ctrlY = midY + (centerY - midY) * bendFactor;

            const isConnectedToSelected =
              selectedNode !== null &&
              (edge.from === selectedNode || edge.to === selectedNode);

            const opacity = isConnectedToSelected
              ? 0.85
              : selectedNode !== null
              ? 0.1
              : 0.2 + edge.val * 0.55;

            const strokeWidth = 1 + edge.val * 3;

            return (
              <path
                key={idx}
                d={`M ${edge.x1} ${edge.y1} Q ${ctrlX} ${ctrlY} ${edge.x2} ${edge.y2}`}
                fill="none"
                stroke={isConnectedToSelected ? '#f0b24a' : '#8ea0ff'}
                strokeWidth={strokeWidth}
                strokeOpacity={opacity}
                markerEnd="url(#arrowhead)"
              />
            );
          })}

          {/* Nodes */}
          {nodes.map(node => {
            const isSelected = selectedNode === node.id;
            let fillColor = '#ffffff';
            let strokeColor = '#3f55d1';

            if (node.isEnt) {
              strokeColor = '#10b981'; // Green for input
            } else if (node.isLeak) {
              strokeColor = '#f59e0b'; // Amber for leak
            } else if (node.isEvent) {
              strokeColor = '#a855f7'; // Purple for event
            }

            return (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                className="cursor-pointer transition-transform duration-150 hover:scale-110"
                onClick={() => setSelectedNode(isSelected ? null : node.id)}
              >
                {/* Aura glow if selected or input/leak */}
                {(isSelected || node.isEnt || node.isLeak || node.isEvent) && (
                  <circle
                    r={node.nodeR + 6}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth={isSelected ? 3 : 1.5}
                    strokeDasharray={node.isLeak ? '4,3' : undefined}
                    className="opacity-70 animate-pulse"
                  />
                )}

                {/* Main Node Circle */}
                <circle
                  r={node.nodeR}
                  fill={fillColor}
                  className="fill-white dark:fill-zinc-800"
                  stroke={strokeColor}
                  strokeWidth={isSelected ? 3 : 2}
                />

                {/* Node ID label */}
                <text
                  textAnchor="middle"
                  dy="0.35em"
                  className="fill-zinc-900 dark:fill-zinc-100 font-bold text-xs font-mono pointer-events-none"
                >
                  {node.id}
                </text>

                {/* Badges around node */}
                {node.isEnt && (
                  <g transform={`translate(0, -${node.nodeR + 9})`}>
                    <rect
                      x="-14"
                      y="-7"
                      width="28"
                      height="14"
                      rx="4"
                      className="fill-emerald-600"
                    />
                    <text
                      textAnchor="middle"
                      dy="3.5"
                      className="fill-white font-bold text-[9px]"
                    >
                      ENT
                    </text>
                  </g>
                )}

                {node.isLeak && (
                  <g transform={`translate(0, ${node.nodeR + 10})`}>
                    <rect
                      x="-16"
                      y="-7"
                      width="32"
                      height="14"
                      rx="4"
                      className="fill-amber-600"
                    />
                    <text
                      textAnchor="middle"
                      dy="3.5"
                      className="fill-white font-bold text-[9px]"
                    >
                      FUGA
                    </text>
                  </g>
                )}

                {node.isEvent && (
                  <g transform={`translate(${node.nodeR + 12}, 0)`}>
                    <rect
                      x="-12"
                      y="-7"
                      width="24"
                      height="14"
                      rx="4"
                      className="fill-purple-600"
                    />
                    <text
                      textAnchor="middle"
                      dy="3.5"
                      className="fill-white font-bold text-[9px]"
                    >
                      EV
                    </text>
                  </g>
                )}

                {(node.isNodeA || node.isNodeB) && (
                  <g transform={`translate(-${node.nodeR + 12}, 0)`}>
                    <rect
                      x="-10"
                      y="-7"
                      width="20"
                      height="14"
                      rx="4"
                      className="fill-blue-600"
                    />
                    <text
                      textAnchor="middle"
                      dy="3.5"
                      className="fill-white font-bold text-[9px]"
                    >
                      {node.isNodeA ? 'mA' : 'mB'}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>

        {/* Selected Node Details Card Overlay */}
        {activeSelected && (
          <div className="absolute bottom-3 left-3 right-3 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md p-3 rounded-lg border border-zinc-200 dark:border-zinc-700 shadow-lg text-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center font-mono">
                {activeSelected.id}
              </span>
              <div>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                  Nodo {activeSelected.id}
                </span>
                <span className="text-zinc-500 dark:text-zinc-400 ml-2">
                  {activeSelected.isEnt && '(Entrada principal) '}
                  {activeSelected.isLeak && `(Fuga γ = ${activeSelected.gamma}) `}
                  {activeSelected.isEvent && '(Nodo de evento s_ev) '}
                  {activeSelected.isNodeA && `(Masa inscripta mA = ${params.mA}) `}
                  {activeSelected.isNodeB && `(Masa inscripta mB = ${params.mB}) `}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4 font-mono">
              <div>
                <span className="text-zinc-500">Masa actual: </span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">
                  {activeSelected.mass.toFixed(3)}
                </span>
              </div>
              <div>
                <span className="text-zinc-500">Masa estac. μ: </span>
                <span className="font-bold text-zinc-700 dark:text-zinc-300">
                  {activeSelected.statMass.toFixed(3)}
                </span>
              </div>
              {activeSelected.isLeak && (
                <div>
                  <span className="text-zinc-500">Descarga: </span>
                  <span className="font-bold text-amber-600">
                    {(activeSelected.gamma * activeSelected.mass).toFixed(3)}
                  </span>
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedNode(null)}
              className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 font-bold px-2 py-0.5 rounded text-xs ml-auto"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* Legend & Guide footer */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[11px] text-zinc-500 dark:text-zinc-400 pt-2 border-t border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
            Entrada (s={params.s})
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
            Fuga ({params.fuga})
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block" />
            Evento ({params.nEv})
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
            Inscriptos (1, 2)
          </span>
        </div>
        <div>Hacé click en cualquier nodo para inspeccionar sus investiduras.</div>
      </div>
    </div>
  );
};
