import { http } from '@/shared/services/http';
import type { CoverLetter, ParseJobPayload, ParseJobResult, GeneratePayload, GenerateResult } from './types';

export const coverLettersApi = {
  list: () => http.get<CoverLetter[]>('/api/cover-letters'),
  getOne: (id: number) => http.get<CoverLetter>(`/api/cover-letters/${id}`),
  createDraft: (payload: Partial<CoverLetter>) => http.post<CoverLetter>('/api/cover-letters', payload),
  updateDraft: (id: number, payload: Partial<CoverLetter>) => http.put<CoverLetter>(`/api/cover-letters/${id}`, payload),
  deleteDraft: (id: number) => http.del<{ success: boolean }>(`/api/cover-letters/${id}`),
  parseJob: (payload: ParseJobPayload) => http.post<ParseJobResult>('/api/cover-letters/parse', payload),
  generate: (payload: GeneratePayload) => http.post<GenerateResult>('/api/cover-letters/generate', payload),
};
