export interface LoadingState {
  open: boolean;
  message: string;
}

export interface LoadingContextValue {
  show: (message?: string) => void;
  hide: () => void;
  run: <T>(
    message: string,
    task: () => Promise<T>
  ) => Promise<T>;
}