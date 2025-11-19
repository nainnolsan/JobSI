export type CoverLetterStatus = 'draft' | 'generated' | 'completed';

export interface CoverLetter {
  id: number;
  title: string;
  company?: string | null;
  status: CoverLetterStatus;
  raw_job_text?: string | null;
  parsed?: unknown | null;
  generated_draft?: string | null;
  variants?: unknown | null;
  created_at?: string;
  updated_at?: string;
}

export interface ParseJobPayload {
  raw_job_text: string;
}

export interface ParseJobResult {
  parsed: unknown;
  confidence?: number;
  usedHeuristic?: boolean;
  language?: string;
}

export interface GeneratePayload {
  cover_letter_id?: number;
  parsed?: unknown;
  config?: unknown;
}

export interface GenerateResult {
  content: string;
  language?: string;
}

// Parsed job description shape used across modal and view
export interface ParsedResult {
  title: string;
  company: string;
  responsibilities: string[];
  requirements: string[];
  confidence: number;
  method: 'ai' | 'heuristic';
  language: string;
}
