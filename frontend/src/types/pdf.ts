export interface ManagedPage {
  id: string;
  originalIndex: number; // 0-based index in the original source PDF document
  rotation: number; // 0, 90, 180, 270 (additional rotation applied)
}
