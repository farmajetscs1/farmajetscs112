/**
 * Mathematical Engine for Model B: Open System Simulator
 * Includes:
 * - Pseudorandom sequence generation (seed-based)
 * - Trace learning matrix D and symmetric W
 * - Stochastic transition matrices P_l, P_g, and P_kappa
 * - Linear equation solving via Gaussian elimination with partial pivoting
 * - Reversibility / Detailed balance coefficient λ(J)
 * - Closed system invariant measure and λ
 * - Open system stationary state with flux conservation
 * - Emma test dynamical simulation with retroactive event injection
 */

import {
  SimParams,
  ParsedInputs,
  BuiltMatrices,
  StationaryState,
  EmmaStep,
  EmmaTestResult,
  KappaPoint,
  SimulationResult
} from './types';

export const DEFAULT_PARAMS: SimParams = {
  n: 12,
  rho: 1,
  L: 300,
  eps: 0.001,
  seed: 1,
  kappa: 0.5,
  ent: 1,
  s: 1,
  fuga: '12',
  gamma: 0.5,
  T: 60,
  tev: 30,
  mA: 3,
  mB: 2,
  nEv: 3,
  sEv: 1,
};

export const PRESETS: { name: string; description: string; params: SimParams }[] = [
  {
    name: 'Estándar (Especificación)',
    description: 'Parámetros base: red de 12 nodos, ρ=1 (secuencia ordenada), entrada en 1 y fuga en 12 con evento en paso 30.',
    params: { ...DEFAULT_PARAMS },
  },
  {
    name: 'Equilibrio Cerrado Puro',
    description: 'Sin fugas (γ=0) ni entradas continuas: sistema cerrado donde κ=0 garantiza reversibilidad microscópica (λ=1).',
    params: {
      ...DEFAULT_PARAMS,
      s: 0,
      gamma: 0,
      kappa: 0,
      sEv: 0,
    },
  },
  {
    name: 'Doble Vía de Descarga',
    description: 'Fuga simultánea en nodos 6 y 12. Mayor disipación de investidura.',
    params: {
      ...DEFAULT_PARAMS,
      fuga: '6, 12',
      gamma: 0.6,
    },
  },
  {
    name: 'Fuerte Trauma Retroactivo',
    description: 'Evento temprano (tev=15) con alta intensidad (sEv=3), probando la ruptura del principio de constancia.',
    params: {
      ...DEFAULT_PARAMS,
      tev: 15,
      sEv: 3,
      T: 75,
    },
  },
  {
    name: 'Fuerte Ligadura Yoica (κ = 0.95)',
    description: 'Predominio casi total de las huellas mnémicas dirigidas Pg sobre la difusión simétrica Pl.',
    params: {
      ...DEFAULT_PARAMS,
      kappa: 0.95,
    },
  },
  {
    name: 'Libre Circulación (κ = 0.05)',
    description: 'Primacía de la red simétrica W (proceso primario no ligado). Flujo cuasi-reversible.',
    params: {
      ...DEFAULT_PARAMS,
      kappa: 0.05,
    },
  },
];

/**
 * Deterministic PRNG with 32-bit state
 */
export function rng(seed: number): () => number {
  let a = (seed >>> 0) || 1;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Validate and parse raw parameters into mathematical vectors
 */
export function validateAndParse(p: SimParams): ParsedInputs {
  const n = p.n;
  if (!Number.isInteger(n) || n < 3 || n > 40) {
    throw new Error('El número de nodos (n) debe ser un entero entre 3 y 40.');
  }
  if (p.rho < 0 || p.rho > 1) {
    throw new Error('ρ (orden de la secuencia) debe estar entre 0 y 1.');
  }
  if (p.kappa < 0 || p.kappa > 1) {
    throw new Error('κ (ligadura del Yo) debe estar entre 0 y 1.');
  }
  if (p.gamma < 0 || p.gamma >= 1) {
    throw new Error('γ (tasa de fuga) debe estar entre 0 y 0,99.');
  }
  if (p.eps <= 0) {
    throw new Error('ε (suavizado) debe ser mayor que 0.');
  }
  if (p.L < 1) {
    throw new Error('La longitud L debe ser al menos 1.');
  }
  if (p.T < 1) {
    throw new Error('El horizonte T debe ser al menos 1.');
  }

  const parseNode = (val: number, label: string) => {
    const num = Math.round(val);
    if (num < 1 || num > n) {
      throw new Error(`${label} debe ser un nodo entre 1 y ${n}.`);
    }
    return num - 1;
  };

  const g = new Array(n).fill(0);
  const leakNodes: number[] = [];
  const parts = String(p.fuga).split(',').map(x => x.trim()).filter(Boolean);

  for (const part of parts) {
    const parsed = parseInt(part, 10);
    if (isNaN(parsed) || parsed < 1 || parsed > n) {
      throw new Error(`Nodo de fuga '${part}' inválido. Debe estar entre 1 y ${n}.`);
    }
    g[parsed - 1] = p.gamma;
    leakNodes.push(parsed);
  }

  if (p.gamma > 0 && leakNodes.length === 0) {
    throw new Error('Indicá al menos un nodo de fuga cuando γ > 0.');
  }

  const s = new Array(n).fill(0);
  s[parseNode(p.ent, 'El nodo de entrada')] = p.s;

  const e = new Array(n).fill(0);
  e[parseNode(p.nEv, 'El nodo del evento')] = p.sEv;

  return {
    g,
    s,
    e,
    a: 0, // Node 1 (0-indexed)
    b: 1, // Node 2 (0-indexed)
    leakNodes,
  };
}

/**
 * Build directed sequence transition matrix D and symmetric W
 */
export function buildMatrices(p: SimParams): { D: number[][]; W: number[][] } {
  const n = p.n;
  const r = rng(p.seed);
  const D = Array.from({ length: n }, () => new Array(n).fill(p.eps));

  let cur = Math.floor(r() * n);
  for (let k = 0; k < p.L; k++) {
    const nx = r() < p.rho ? (cur + 1) % n : Math.floor(r() * n);
    D[cur][nx] += 1;
    cur = nx;
  }

  const W = D.map((row, i) => row.map((v, j) => (v + D[j][i]) / 2));
  return { D, W };
}

/**
 * Row-normalize a matrix to form a row-stochastic transition matrix
 */
export function norm(M: number[][]): number[][] {
  return M.map(row => {
    const sum = row.reduce((a, b) => a + b, 0);
    const safeSum = sum > 0 ? sum : 1e-12;
    return row.map(v => v / safeSum);
  });
}

/**
 * Calculate stochastic transition matrix P(κ) = (1 - κ) P_l + κ P_g
 */
export function computePk(Pl: number[][], Pg: number[][], kappa: number): number[][] {
  return Pl.map((row, i) =>
    row.map((v, j) => (1 - kappa) * v + kappa * Pg[i][j])
  );
}

/**
 * Solve system Ax = b using Gaussian elimination with partial pivoting
 */
export function solve(A: number[][], b: number[]): number[] {
  const n = b.length;
  const M = A.map((r, i) => [...r, b[i]]);

  for (let c = 0; c < n; c++) {
    let pivotRow = c;
    for (let r = c + 1; r < n; r++) {
      if (Math.abs(M[r][c]) > Math.abs(M[pivotRow][c])) {
        pivotRow = r;
      }
    }

    [M[c], M[pivotRow]] = [M[pivotRow], M[c]];
    const diag = M[c][c];
    if (Math.abs(diag) < 1e-14) {
      throw new Error('Sistema singular o matriz no invertible en la resolución del estado estacionario.');
    }

    for (let r = 0; r < n; r++) {
      if (r === c) continue;
      const factor = M[r][c] / diag;
      if (Math.abs(factor) > 1e-15) {
        for (let j = c; j <= n; j++) {
          M[r][j] -= factor * M[c][j];
        }
      }
    }
  }

  return M.map((r, i) => r[n] / r[i]);
}

/**
 * Reversibility / Detailed Balance measure λ(J) ∈ [0, 1]
 * λ(J) = ∑ min(J_ij, J_ji) / ∑ J_ij
 */
export function lamJ(J: number[][]): number {
  let totalFlux = 0;
  let symmetricFlux = 0;
  const n = J.length;

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      totalFlux += J[i][j];
      symmetricFlux += Math.min(J[i][j], J[j][i]);
    }
  }

  if (totalFlux <= 1e-15) return 1;
  return Math.max(0, Math.min(1, symmetricFlux / totalFlux));
}

/**
 * Compute closed system stationary distribution and λ
 */
export function lamClosed(P: number[][]): number {
  const n = P.length;
  // (P^T - I) * pi = 0, with sum(pi) = 1
  const A = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => P[j][i] - (i === j ? 1 : 0))
  );

  A[n - 1] = new Array(n).fill(1);
  const b = new Array(n).fill(0);
  b[n - 1] = 1;

  try {
    const pi = solve(A, b);
    const J = P.map((row, i) => row.map(v => Math.max(0, pi[i] * v)));
    return lamJ(J);
  } catch {
    return 1;
  }
}

/**
 * Compute open system stationary distribution mu and flux matrix J
 */
export function computeOpenState(
  P: number[][],
  s: number[],
  g: number[]
): { mu: number[]; J: number[][] } {
  const n = P.length;
  // A_ij = delta_ij - (1 - g_j) * P_ji
  const A = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => (i === j ? 1 : 0) - (1 - g[j]) * P[j][i])
  );

  const mu = solve(A, s);
  const safeMu = mu.map(v => Math.max(0, v));
  const J = P.map((row, i) =>
    row.map(v => safeMu[i] * (1 - g[i]) * v)
  );

  return { mu: safeMu, J };
}

/**
 * Simulate Emma's test over time T
 */
export function simulateEmma(
  p: SimParams,
  q: ParsedInputs,
  Pk: number[][]
): EmmaTestResult {
  const n = p.n;
  let mu = new Array(n).fill(0);
  mu[q.a] = p.mA;
  mu[q.b] += p.mB;

  const inscribedMass = p.mA + p.mB;
  let cumulativeDischarge = 0;
  const history: EmmaStep[] = [];
  let crossoverStep: number | null = null;

  // Step 0 initial condition
  history.push({
    t: 0,
    discharge: 0,
    cumulativeDischarge: 0,
    masses: [...mu],
    eventActive: false,
  });

  for (let t = 0; t < p.T; t++) {
    // Discharge at current state
    let stepDischarge = 0;
    for (let i = 0; i < n; i++) {
      stepDischarge += q.g[i] * mu[i];
    }
    cumulativeDischarge += stepDischarge;

    // Check crossover
    if (crossoverStep === null && cumulativeDischarge > inscribedMass) {
      crossoverStep = t + 1;
    }

    // Mass transition
    const nextMu = new Array(n).fill(0);
    for (let i = 0; i < n; i++) {
      const outflow = mu[i] * (1 - q.g[i]);
      for (let j = 0; j < n; j++) {
        nextMu[j] += outflow * Pk[i][j];
      }
    }

    // Event input injection in t + 1 >= tev
    const isEventActive = t + 1 >= p.tev;
    if (isEventActive) {
      for (let j = 0; j < n; j++) {
        nextMu[j] += q.e[j];
      }
    }

    mu = nextMu;

    history.push({
      t: t + 1,
      discharge: stepDischarge,
      cumulativeDischarge,
      masses: [...mu],
      eventActive: isEventActive,
    });
  }

  const excess = cumulativeDischarge - inscribedMass;
  const requiresSource = excess > 1e-9;

  return {
    inscribedMass,
    cumulativeDischarge,
    excess,
    requiresSource,
    history,
    crossoverStep,
  };
}

/**
 * Run full simulation suite
 */
export function runSimulation(p: SimParams): SimulationResult {
  const parsed = validateAndParse(p);
  const { D, W } = buildMatrices(p);

  const Pl = norm(W);
  const Pg = norm(D);
  const Pk = computePk(Pl, Pg, p.kappa);

  // Compute lambda curve across kappa range [0, 1] in 21 steps
  const kappaCurve: KappaPoint[] = [];
  const steps = 20;
  for (let i = 0; i <= steps; i++) {
    const k = i / steps;
    const Pk_step = computePk(Pl, Pg, k);
    const lamC = lamClosed(Pk_step);
    const { J: J_open } = computeOpenState(Pk_step, parsed.s, parsed.g);
    const lamO = lamJ(J_open);
    kappaCurve.push({
      kappa: k,
      lambdaClosed: lamC,
      lambdaOpen: lamO,
    });
  }

  // Stationary state for current kappa
  const { mu, J } = computeOpenState(Pk, parsed.s, parsed.g);
  const lambdaClosed = lamClosed(Pk);
  const lambdaOpen = lamJ(J);

  const totalInput = parsed.s.reduce((a, b) => a + b, 0);
  const totalDischarge = mu.reduce((a, m, i) => a + parsed.g[i] * m, 0);
  const totalMass = mu.reduce((a, b) => a + b, 0);
  const isBalanced = Math.abs(totalInput - totalDischarge) < 1e-5;

  const stationary: StationaryState = {
    mu,
    J,
    lambdaClosed,
    lambdaOpen,
    diffLambda: lambdaClosed - lambdaOpen,
    totalMass,
    totalInput,
    totalDischarge,
    isBalanced,
  };

  const emma = simulateEmma(p, parsed, Pk);

  return {
    params: p,
    parsed,
    matrices: {
      D,
      W,
      Pl,
      Pg,
      Pk,
    },
    stationary,
    kappaCurve,
    emma,
  };
}
