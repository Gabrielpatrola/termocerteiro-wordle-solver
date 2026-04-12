import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Home } from "@/pages/Home";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1 },
    mutations: { retry: 0 },
  },
});

export function App(): React.JSX.Element {
  return (
    <QueryClientProvider client={queryClient}>
      <Home />
    </QueryClientProvider>
  );
}
