import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

export interface TextBlock {
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  fontFamily?: string;
  fontWeight?: string;
  fontStyle?: string;
  color?: string;
}


export interface PageTextBlocks {
  pageNumber: number;
  width: number;
  height: number;
  blocks: TextBlock[];
}

export interface BackendTextEdit {
  pageNumber: number;
  x: number;
  y: number;
  width: number;
  height: number;
  newText: string;
  fontSize?: number;
}

export interface RewriteResponse {
  success: boolean;
  replacement_text: string;
  character_count: number;
  overflow_risk: boolean;
}

/**
 * Calculates typographical character budget:
 * Max Characters = floor(W / (0.52 * F)) * Lines
 */
export function calculateCharacterBudget(
  width: number,
  fontSize: number,
  lines: number = 1
): number {
  if (width <= 0 || fontSize <= 0 || lines <= 0) return 80;
  const avgCharWidth = 0.52 * fontSize;
  return Math.max(10, Math.floor(width / avgCharWidth) * lines);
}

/**
 * Ingests an uploaded PDF and extracts positional text blocks with coordinates.
 */
export async function extractBlocks(file: File): Promise<PageTextBlocks[]> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('pdf', file);

  const res = await api.post<{ success: boolean; pages: PageTextBlocks[] }>(

    '/pdf/extract-blocks',
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
    }
  );

  return res.data.pages;
}

/**
 * Sends a selected text snippet with prompt instruction and character limit to OpenAI.
 */
export async function aiRewriteText(params: {
  selectedText: string;
  instruction: string;
  maxCharacters: number;
}): Promise<RewriteResponse> {
  const res = await api.post<RewriteResponse>('/ai/rewrite', {
    selected_text: params.selectedText,
    instruction: params.instruction,
    max_characters: params.maxCharacters,
  });

  return res.data;
}

/**
 * Sends in-place text edits to backend service to whiteout old text and stamp replacement text.
 */
export async function submitBackendEdits(
  file: File,
  edits: BackendTextEdit[]
): Promise<Blob> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('edits', JSON.stringify(edits));

  const res = await api.post('/pdf/edit', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    responseType: 'blob',
  });

  return res.data;
}
