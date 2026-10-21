import { MutationCache, QueryClient } from "@tanstack/react-query";
import { notifyError } from "@/components/ui/Toaster";

declare module "@tanstack/react-query" {
  interface Register {
    mutationMeta: {
      /** Message montré si la mutation échoue (« La suppression du document a échoué. ») */
      errorMessage?: string;
      /** L'écran affiche lui-même l'échec : pas de message global */
      silent?: boolean;
    };
  }
}

/**
 * Toute mutation qui échoue est signalée à l'utilisateur, sans code à écrire dans chaque écran.
 * Les sauvegardes automatiques ont leur propre indicateur (SaveIndicator) et ne passent pas par ici.
 */
export const queryClient = new QueryClient({
  mutationCache: new MutationCache({
    onError: (error, _variables, _context, mutation) => {
      console.error(error);
      if (mutation.meta?.silent) return;
      notifyError(mutation.meta?.errorMessage ?? "L'opération a échoué. Vérifiez votre connexion puis réessayez.");
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30,
      retry: 1,
    },
  },
});
