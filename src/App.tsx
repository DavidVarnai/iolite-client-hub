import { lazy, Suspense } from 'react';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import AppLayout from "@/layouts/AppLayout";
import Dashboard from "@/pages/Dashboard";
import Clients from "@/pages/Clients";
import NotFound from "./pages/NotFound";

const ClientHub = lazy(() => import("@/pages/ClientHub"));
const Templates = lazy(() => import("@/pages/Templates"));
const InternalLibrary = lazy(() => import("@/pages/InternalLibrary"));
const AdminHub = lazy(() => import("@/pages/AdminHub"));

const queryClient = new QueryClient();

function LazyFallback() {
  return <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">Loading…</div>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <BrowserRouter>
        <Suspense fallback={<LazyFallback />}>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/clients" element={<Clients />} />
              <Route path="/clients/:clientId" element={<ClientHub />} />
              <Route path="/clients/:clientId/:tab" element={<ClientHub />} />
              <Route path="/templates" element={<Templates />} />
              <Route path="/library" element={<InternalLibrary />} />
              <Route path="/admin" element={<AdminHub />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
