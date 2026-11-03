import React from 'react';
import { X, BookOpen, Atom, GitBranch, ShieldCheck } from 'lucide-react';

interface TheoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TheoryModal: React.FC<TheoryModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <BookOpen className="text-indigo-600 dark:text-indigo-400" size={20} />
            <h3 className="font-serif font-bold text-lg text-zinc-900 dark:text-zinc-100">
              Fundamentos Teóricos del Modelo B
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
          {/* Section 1 */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-serif font-bold">
              <Atom size={18} />
              <h4>1. Red de Investidura y Ligadura Yoica (κ)</h4>
            </div>
            <p>
              El <strong>Modelo B</strong> formaliza la dinámica de investidura (<em>Besetzung</em>) y facilitación sináptica descrita por Sigmund Freud en el <em>Proyecto de psicología para neurólogos (1895)</em>.
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800/60 p-3 rounded-lg border border-zinc-100 dark:border-zinc-800 font-mono">
              P(κ) = (1 - κ) P_l + κ P_g
            </p>
            <ul className="list-disc list-inside text-xs space-y-1 pl-1">
              <li>
                <strong>P_l (Proceso primario / Difusión libre):</strong> Normalización de la matriz simetrizada <code>W = (D + Dᵀ)/2</code>. Flujo bidireccional y balanceado.
              </li>
              <li>
                <strong>P_g (Huellas mnémicas aprendidas):</strong> Normalización de la matriz dirigida <code>D</code> obtenida tras la secuencia histórica de activaciones de longitud L.
              </li>
              <li>
                <strong>κ (Ligadura del Yo):</strong> Modula el control inhibidor del Yo. Con κ = 0 impera la difusión simétrica; con κ = 1 impera la dirección estricta de las huellas aprendidas.
              </li>
            </ul>
          </div>

          {/* Section 2 */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-serif font-bold">
              <GitBranch size={18} />
              <h4>2. Coeficiente de Reversibilidad λ y Lema 6</h4>
            </div>
            <p>
              El parámetro <strong>λ</strong> cuantifica el grado de simetría o balance detallado de los flujos microscópicos de investidura entre pares de nodos:
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800/60 p-3 rounded-lg border border-zinc-100 dark:border-zinc-800 font-mono">
              λ(J) = ∑ min(J_ij, J_ji) / ∑ J_ij
            </p>
            <p className="text-xs">
              <strong>Lema 6:</strong> En un <em>sistema cerrado</em> (s = 0, γ = 0), si κ = 0 la matriz de transición es proporcional a W (simétrica), garantizando balance detallado exacto y <strong>λ = 1</strong>. En cambio, en un <em>sistema abierto</em> con entrada continua <code>s</code> y fugas disipativas <code>γ</code>, la divergencia entre los puntos de entrada y descarga rompe la reversibilidad, produciendo <strong>λ &lt; 1</strong> aún con enlaces simétricos.
            </p>
          </div>

          {/* Section 3 */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-serif font-bold">
              <ShieldCheck size={18} />
              <h4>3. La Prueba de Emma: Nachträglichkeit (Eficacia diferida)</h4>
            </div>
            <p>
              Basado en el célebre historial clínico de <em>Emma Eckstein</em> (reprimida por una fobia a entrar sola a una tienda):
            </p>
            <ul className="list-disc list-inside text-xs space-y-1.5 pl-1">
              <li>
                <strong>Inscripción originaria:</strong> En t = 0 se inscriben huellas mnémicas de masas <code>mA</code> y <code>mB</code> en los nodos 1 y 2, inicialmente quiescentes.
              </li>
              <li>
                <strong>Evento desencadenante diferido:</strong> En <code>t = tev</code> irrumpe una excitación externa <code>s_ev</code> en el nodo del evento.
              </li>
              <li>
                <strong>Prueba de consistencia energética:</strong> Si la descarga acumulada total al cabo de T pasos supera estrictamente la masa inscripta originaria (<code>mA + mB</code>), el aparato psíquico demuestra que <em>no puede explicarse como un circuito cerrado conservativo de energía acumulada</em>: necesariamente requiere una <strong>fuente pulsional exógena o somática continua</strong>.
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-zinc-50 dark:bg-zinc-800/40 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs transition-colors"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
