export interface StageInstance {
  host: HTMLElement;
  svg: SVGSVGElement;
  paused: boolean;
  frame(scenes: any[]): void;
  goTo(scene: any, options?: { instant?: boolean }): void;
  retheme(): void;
  fit(): void;
  refit(): void;
  clear(): void;
  destroy(): void;
  onCards?: ((visible: boolean) => void) | null;
  onView?: ((zoomed: boolean) => void) | null;
}

export declare const Stage: {
  new (host: HTMLElement): StageInstance;
};

export declare function setStageTranslation(lang: string, dict: Record<string, string>): void;
export declare function stageT(key: string, params?: Record<string, any>): string;
export declare function renderIcon(name: string, options?: { size?: number; stroke?: number; cls?: string; fill?: string }): string;
export declare const iconDefs: Record<string, any>;

