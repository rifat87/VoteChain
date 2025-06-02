import { ThemeProvider } from "@/components/ui/theme-provider"
import { WalletProvider, useWallet } from "@/components/ui/wallet-provider"
import { Toaster } from "@/components/ui/toaster"
import { PublicDashboard } from "@/components/Dashboard/PublicDashboard"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { Layout } from "@/components/Layout/Layout"
import { AdminDashboard } from "@/components/Admin/AdminDashboard"
import { VoterDashboard } from "@/components/Voter/VoterDashboard"
import { ErrorBoundary } from "@/components/ui/error-boundary"
import { RegisterCandidate } from "@/components/Admin/RegisterCandidate"
import { RegisterVoter } from "@/components/Admin/RegisterVoter"

export function App() {
  return (
    <ErrorBoundary>
      <Router>
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
          <WalletProvider>
            <AppWithWallet />
            <Toaster />
          </WalletProvider>
        </ThemeProvider>
      </Router>
    </ErrorBoundary>
  )
}

function AppWithWallet() {
  const { isConnected, isWalletChecked } = useWallet();

  // While checking wallet, show loader (not inside Layout)
  if (!isWalletChecked) {
    return (
      <div className="flex h-screen items-center justify-center">
        <span className="text-muted-foreground">Loading...</span>
      </div>
    );
  }

  return (
    <Layout>
      <Routes>
        <Route
          path="/"
          element={<PublicDashboard />}
        />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/register-candidate" element={<RegisterCandidate />} />
        <Route path="/admin/register-voter" element={<RegisterVoter />} />
        <Route path="/voter/*" element={<VoterDashboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}
