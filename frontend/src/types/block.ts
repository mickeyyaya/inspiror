export type BlockCategory =
  | "setup"
  | "character"
  | "movement"
  | "collision"
  | "event"
  | "score"
  | "timer"
  | "visual"
  | "sound"
  | "custom";

export interface BlockParam {
  key: string;
  label: string;
  type: "number" | "color" | "string" | "boolean" | "enum";
  value: string | number | boolean;
  min?: number;
  max?: number;
  step?: number;
  options?: string[];
}

export interface Block {
  id: string;
  type: BlockCategory;
  label: string;
  emoji: string;
  enabled: boolean;
  params: BlockParam[];
  code: string;
  css?: string;
  order: number;
}
