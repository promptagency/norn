// Types for the vendored timestral.js (ours, not upstream's).
import type * as Ort from "onnxruntime-web";

type Values = (number | null)[];

export const LEVELS: number[];
export const MAX_CONTEXT: number;

export function forecast(
  ort: typeof Ort,
  session: Ort.InferenceSession,
  request: {
    target: Values[];
    horizon: number;
    pastCovariates?: Values[] | null;
    knownCovariates?: Values[] | null;
    symmetric?: boolean;
    clipNonnegative?: boolean;
    maxContext?: number;
  },
): Promise<{ quantiles: number[][][]; levels: number[] }>;
