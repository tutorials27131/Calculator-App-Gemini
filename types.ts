
export type Operation = '+' | '-' | '*' | '/' | '=' | 'clear' | 'percentage' | 'plusMinus';

export interface HistoryItem {
  id: string;
  expression: string;
  result: string;
  timestamp: number;
  isAiGenerated?: boolean;
}

export interface CalculationResult {
  result: string;
  explanation?: string;
}
