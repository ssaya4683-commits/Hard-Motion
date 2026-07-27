import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type {
  LoadingContextValue,
  LoadingState,
} from "../../types/loading";

const LoadingContext =
  createContext<LoadingContextValue | null>(null);

export function LoadingProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [state, setState] = useState<LoadingState>({
    open: false,
    message: "",
  });

  const show = useCallback((message = "Memproses...") => {
    setState({
      open: true,
      message,
    });
  }, []);

  const hide = useCallback(() => {
    setState({
      open: false,
      message: "",
    });
  }, []);

  const run = useCallback(
    async <T,>(
      message: string,
      task: () => Promise<T>
    ) => {
      show(message);

      try {
        return await task();
      } finally {
        hide();
      }
    },
    [show, hide]
  );

  const value = useMemo(
    () => ({
      show,
      hide,
      run,
    }),
    [show, hide, run]
  );

  return (
    <LoadingContext.Provider value={value}>
      {children}

      {state.open && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-72 rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-300 border-t-black dark:border-slate-700 dark:border-t-white" />

            <h3 className="text-center text-lg font-bold">
              Hard Motion
            </h3>

            <p className="mt-2 text-center text-sm text-slate-500 dark:text-slate-400">
              {state.message}
            </p>
          </div>
        </div>
      )}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const context = useContext(LoadingContext);

  if (!context) {
    throw new Error(
      "useLoading must be used inside LoadingProvider."
    );
  }

  return context;
}