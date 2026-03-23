import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { DarkModeProvider } from "./contexts/DarkModeContext";
import { ComboDisplay } from "./components/ComboDisplay";
import Home from "./pages/Home";
import VickiDashboard from "./pages/VickiDashboard";
import ParentLogin from "./pages/ParentLogin";
import ParentDashboard from "./pages/ParentDashboard";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/vicki"} component={VickiDashboard} />
      <Route path={"/pais/login"} component={ParentLogin} />
      <Route path={"/pais/dashboard"} component={ParentDashboard} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <DarkModeProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
            <ComboDisplay />
          </TooltipProvider>
        </DarkModeProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;