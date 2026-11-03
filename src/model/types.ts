/**
 * Simulation parameters and data structures for Model B: Open System
 */

export interface SimParams {
  n: number;       // Number of nodes (3 to 40)
  rho: number;     // Sequence order ρ (0 to 1)
  L: number;       // Sequence length
  eps: number;     // Smoothing ε (>0)
  seed: number;    // Random seed
  kappa: number;   // κ (Ego binding, 0 to 1)
  ent: number;     // Input node s (1-indexed)
  s: number;       // Input intensity s
  fuga: string;    // Leak nodes (comma-separated, 1-indexed, e.g. "12")
  gamma: number;   // Leak rate γ (0 to 0.99)
  T: number;       // Emma test duration / steps
  tev: number;     // Event step tev
  mA: number;      // Inscribed mass mA (node 1)
  mB: number;      // Inscribed mass mB (node 2)
  nEv: number;     // Event node (1-indexed)
  sEv: number;     // Event input intensity s_ev
}

export interface ParsedInputs {
  g: number[];     // Gamma array per node (0-indexed)
  s: number[];     // Input array per node (0-indexed)
  e: number[];     // Event input array per node (0-indexed)
  a: number;       // Node A index (0)
  b: number;       // Node B index (1)
  leakNodes: number[]; // 1-indexed list of leak nodes
}

export interface BuiltMatrices {
  D: number[][];   // Learned transition frequency matrix
  W: number[][];   // Symmetrized matrix W = (D + D^T)/2
  Pl: number[][];  // Locally bound transition matrix
  Pg: number[][];  // Directed trace transition matrix
  Pk: number[][];  // Combined transition matrix P(κ)
}

export interface StationaryState {
  mu: number[];    // Stationary mass distribution
  J: number[][];   // Stationary flux matrix
  lambdaClosed: number; // λ closed system (s=0, γ=0)
  lambdaOpen: number;   // λ open system
  diffLambda: number;   // λ_closed - λ_open
  totalMass: number;    // Sum of mu
  totalInput: number;   // Sum of s
  totalDischarge: number; // Sum of mu_i * g_i
  isBalanced: boolean;    // Total input ≈ Total discharge
}

export interface EmmaStep {
  t: number;
  discharge: number;
  cumulativeDischarge: number;
  masses: number[];
  eventActive: boolean;
}

export interface EmmaTestResult {
  inscribedMass: number;
  cumulativeDischarge: number;
  excess: number;
  requiresSource: boolean;
  history: EmmaStep[];
  crossoverStep: number | null; // First step where cumulative > inscribed
}

export interface KappaPoint {
  kappa: number;
  lambdaClosed: number;
  lambdaOpen: number;
}

export interface SimulationResult {
  params: SimParams;
  parsed: ParsedInputs;
  matrices: BuiltMatrices;
  stationary: StationaryState;
  kappaCurve: KappaPoint[];
  emma: EmmaTestResult;
}
