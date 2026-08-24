/* Control Room Ledger: route access is gated by a session boundary before any operational content renders. */
import { useEffect } from "react";
import { Route, Switch, useLocation, useRoute } from "wouter";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import ModulePage from "./pages/ModulePage";

function Protected({ children }: { children: React.ReactNode }) {
  const [location, navigate] = useLocation();
  const authenticated = Boolean(sessionStorage.getItem("vor-session"));
  useEffect(() => { if (!authenticated && location !== "/login") navigate("/login"); }, [authenticated, location, navigate]);
  if (!authenticated) return null;
  return <>{children}</>;
}

function RequestDetailRoute() {
  const [, params] = useRoute<{ id: string }>("/requests/:id");
  return <Protected><ModulePage type={`detail:${params?.id || "VOR-2026-0824-017"}`} /></Protected>;
}

function LoginRoute() {
  const [, navigate] = useLocation();
  if (sessionStorage.getItem("vor-session")) { navigate("/operations"); return null; }
  return <Login />;
}

export default function App() {
  return <ErrorBoundary><ThemeProvider defaultTheme="dark"><TooltipProvider><Toaster theme="dark" /><Switch>
    <Route path="/login" component={LoginRoute} />
    <Route path="/"><Protected><Home /></Protected></Route>
    <Route path="/operations"><Protected><Home /></Protected></Route>
    <Route path="/requests"><Protected><ModulePage type="requests" /></Protected></Route>
    <Route path="/requests/:id" component={RequestDetailRoute} />
    <Route path="/approvals"><Protected><ModulePage type="approvals" /></Protected></Route>
    <Route path="/validation"><Protected><ModulePage type="validation" /></Protected></Route>
    <Route path="/audit"><Protected><ModulePage type="audit" /></Protected></Route>
    <Route path="/system-health"><Protected><ModulePage type="system-health" /></Protected></Route>
    <Route path="/analytics"><Protected><ModulePage type="analytics" /></Protected></Route>
    <Route path="/configuration"><Protected><ModulePage type="configuration" /></Protected></Route>
    <Route><LoginRoute /></Route>
  </Switch></TooltipProvider></ThemeProvider></ErrorBoundary>;
}
