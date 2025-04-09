import { useState } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import DocumentsPage from "@/pages/Documents";
import RanchPortal from "@/pages/RanchPortal";
import Events from "@/pages/Events";
import Blog from "@/pages/Blog";
import ScrollToTop from "@/components/ScrollToTop";
import { AccessLevelContext, NavbarAccessLevel } from "@/components/Navbar";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/documents" component={DocumentsPage} />
      <Route path="/ranch-portal" component={RanchPortal} />
      <Route path="/events" component={Events} />
      <Route path="/blog" component={Blog} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Manage access level state at the app level
  const [accessLevel, setAccessLevel] = useState<NavbarAccessLevel>('none');
  
  return (
    <QueryClientProvider client={queryClient}>
      <AccessLevelContext.Provider value={{ accessLevel, setAccessLevel }}>
        <Router />
        <ScrollToTop />
        <Toaster />
      </AccessLevelContext.Provider>
    </QueryClientProvider>
  );
}

export default App;
