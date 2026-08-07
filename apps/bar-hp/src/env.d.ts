declare module "wow.js" {
  interface WOWOptions {
    boxClass?: string;
    animateClass?: string;
    offset?: number;
    mobile?: boolean;
    live?: boolean;
    callback?: ((box: HTMLElement) => void) | null;
    scrollContainer?: string | null;
  }

  export default class WOW {
    constructor(options?: WOWOptions);
    init(): void;
    start(): void;
    stop(): void;
    sync(): void;
  }
}
