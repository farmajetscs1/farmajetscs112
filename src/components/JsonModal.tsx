import React, { useState, useEffect } from 'react';
import { SimParams } from '../model/types';
import { Copy, Check, Upload, X } from 'lucide-react';

interface JsonModalProps {
  isOpen: boolean;
  onClose: () => void;
  params: SimParams;
  onApply: (params: SimParams) => void;
}

export const JsonModal: React.FC<JsonModalProps> = ({
  isOpen,
  onClose,
  params,
  onApply,
}) => {
  const [jsonText, setJsonText] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setJsonText(JSON.stringify(params, null, 2));
      setError(null);
    }
  }, [isOpen, params]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApply = () => {
    try {
      const parsed = JSON.parse(jsonText);
      // Basic structure check
      if (typeof parsed !== 'object' || parsed === null) {
        throw new Error('El JSON debe ser un objeto con los parámetros de simulación.');
      }
      onApply(parsed as SimParams);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'JSON inválido';
      setError(msg);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
          <h3 className="font-serif font-bold text-base text-zinc-900 dark:text-zinc-100">
            Parámetros en Formato JSON
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
          >
            <X size={18} />
          </button>
        </div>

        {/* Editor */}
        <div className="p-4 flex-1 flex flex-col gap-2">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Copiá los parámetros actuales o pegá tu propio objeto JSON para actualizar la simulación.
          </p>

          <textarea
            value={jsonText}
            onChange={e => {
              setJsonText(e.target.value);
              setError(null);
            }}
            spellCheck={false}
            className="w-full flex-1 min-h-[220px] font-mono text-xs p-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          />

          {error && (
            <div className="text-xs text-rose-600 dark:text-rose-400 font-medium">
              {error}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-4 py-3 bg-zinc-50 dark:bg-zinc-800/40 border-t border-zinc-100 dark:border-zinc-800">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 transition-colors"
          >
            {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
            <span>{copied ? 'Copiado' : 'Copiar JSON'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-semibold text-zinc-600 dark:text-zinc-400 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleApply}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <Upload size={14} />
              <span>Aplicar Parámetros</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
