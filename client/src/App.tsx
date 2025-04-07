import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import AllJournals from "@/pages/all-journals";
import Emotions from "@/pages/emotions";
import People from "@/pages/people";
import Places from "@/pages/places";
import Bookmarks from "@/pages/bookmarks";
import Settings from "@/pages/settings";
import AuthPage from "@/pages/auth-page";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import MobileNav from "@/components/layout/mobile-nav";
import { useState } from "react";
import { FontSettingsProvider } from "@/hooks/use-font-settings";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "./lib/protected-route";

function Router() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isAuthPage = location === "/auth";

  if (isAuthPage) {
    return (
      <Switch>
        <Route path="/auth" component={AuthPage} />
      </Switch>
    );
  }

  return (
    <div className="bg-gray-50 font-sans text-gray-800 flex h-screen overflow-hidden">
      <Sidebar mobileMenuOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
      
      <main className="flex-1 flex flex-col overflow-hidden">
        <Header onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} />
        
        <div className="flex-1 overflow-auto pb-16 md:pb-0">
          <Switch>
            <ProtectedRoute path="/" component={Home} />
            <ProtectedRoute path="/journals" component={AllJournals} />
            <ProtectedRoute path="/emotions" component={Emotions} />
            <ProtectedRoute path="/people" component={People} />
            <ProtectedRoute path="/places" component={Places} />
            <ProtectedRoute path="/bookmarks" component={Bookmarks} />
            <ProtectedRoute path="/settings" component={Settings} />
            <Route path="/auth" component={AuthPage} />
            <Route component={NotFound} />
          </Switch>
        </div>
        
        <MobileNav />
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <FontSettingsProvider>
          <Router />
          <Toaster />
        </FontSettingsProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
