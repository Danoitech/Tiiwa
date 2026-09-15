type Listener = (message: string) => void;

let listener: Listener | null = null;

export function setToastListener(next: Listener | null) {
  listener = next;
}

export function toast(message: string) {
  listener?.(message);
}
