/* Control Room Ledger: protected routes read server-authenticated JWT-backed context. */
import { useEffect } from "react";
import { Route, Switch, useLocation, useRoute } from "wouter";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { useAuth } from "./_core/hooks/useAuth";
import Home from "./pages/Home";
import Login from "./pages/Login";
import ModulePage from "./pages/ModulePage";
import { BackendConnectivityMonitor, BackendUnavailablePanel, useBrowserOffline } from "./components/BackendConnectivityState";
import { isBackendUnavailable } from "./lib/backendStatus";

function Protected({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  const offline = useBrowserOffline();
  const [, navigate] = useLocation();
  const backendUnavailable = offline || isBackendUnavailable(auth.error);
  useEffect(() => {
    if (!auth.loading && !auth.isAuthenticated) navigate("/login");
  }, [auth.loading, auth.isAuthenticated, navigate]);
  if (auth.loading) return <div className="auth-loading"><span className="live-dot" /> AUTHENTICATING SERVER SESSION…</div>;
  if (!auth.isAuthenticated && backendUnavailable) return <main className="auth-fallback"><BackendUnavailablePanel offline={offline} onRetry={() => void auth.refresh()} /></main>;
  if (!auth.isAuthenticated) return <div className="auth-loading"><span className="live-dot" /> REDIRECTING TO SECURE SIGN-IN…</div>;
  return <>{children}</>;
}

function RequestDetailRoute() {
  const [, params] = useRoute<{ id: string }>("/requests/:id");
  return <Protected><ModulePage type={`detail:${params?.id ?? ""}`} /></Protected>;
}

function CatalogImportDetailRoute() {
  const [, params] = useRoute<{ id: string }>("/catalog-imports/:id");
  return <Protected><ModulePage type={`import-detail:${params?.id || "0"}`} /></Protected>;
}

function LoginRoute() {
  const [, navigate] = useLocation();
  const auth = useAuth();
  useEffect(() => { if (!auth.loading && auth.isAuthenticated) navigate("/operations"); }, [auth.loading, auth.isAuthenticated, navigate]);
  return <Login />;
}

export default function App() {
  return <ErrorBoundary><ThemeProvider defaultTheme="light"><TooltipProvider><Toaster theme="light" /><BackendConnectivityMonitor /><Switch>
    <Route path="/login" component={LoginRoute} />
    <Route path="/"><Protected><Home /></Protected></Route>
    <Route path="/operations"><Protected><Home /></Protected></Route>
    <Route path="/dashboard"><Protected><Home /></Protected></Route>
    <Route path="/requests"><Protected><ModulePage type="requests" /></Protected></Route>
    <Route path="/requests/:id" component={RequestDetailRoute} />
    <Route path="/catalog-imports/:id" component={CatalogImportDetailRoute} />
    <Route path="/approvals"><Protected><ModulePage type="approvals" /></Protected></Route>
    <Route path="/validation"><Protected><ModulePage type="validation" /></Protected></Route>
    <Route path="/audit"><Protected><ModulePage type="audit" /></Protected></Route>
    <Route path="/history"><Protected><ModulePage type="audit" /></Protected></Route>
    <Route path="/system-health"><Protected><ModulePage type="system-health" /></Protected></Route>
    <Route path="/analytics"><Protected><ModulePage type="analytics" /></Protected></Route>
    <Route path="/compliance"><Protected><ModulePage type="compliance" /></Protected></Route>
    <Route path="/configuration"><Protected><ModulePage type="configuration" /></Protected></Route>
    <Route><LoginRoute /></Route>
  </Switch></TooltipProvider></ThemeProvider></ErrorBoundary>;
}
