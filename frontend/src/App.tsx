import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ChatbotDrawer } from './components/ChatbotDrawer';
import { HomePage } from './pages/HomePage';
import { TemplesDirectory } from './pages/TemplesDirectory';
import { TempleDetailPage } from './pages/TempleDetailPage';
import { BookingFlowPage } from './pages/BookingFlowPage';
import { OfflineCounterPage } from './pages/OfflineCounterPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { AICrowdTechPage } from './pages/AICrowdTechPage';
import { HelpCenterPage } from './pages/HelpCenterPage';
import { TicketLookupPage } from './pages/TicketLookupPage';
import { CCTVCrowdSimulator } from './components/CCTVCrowdSimulator';
import { ErrorBoundary } from './components/ErrorBoundary';

export function App() {
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [selectedTempleId, setSelectedTempleId] = useState<string>('temple-palani');
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);

  const handleNavigate = (tab: string, templeId?: string) => {
    if (templeId) {
      setSelectedTempleId(templeId);
    }
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderContent = () => {
    switch (currentTab) {
      case 'home':
        return <HomePage onNavigate={handleNavigate} />;
      case 'temples':
        return (
          <TemplesDirectory
            onSelectTemple={(id, tab) => handleNavigate(tab, id)}
          />
        );
      case 'templedetail':
        return (
          <TempleDetailPage
            templeId={selectedTempleId}
            onBook={(id) => handleNavigate('book', id)}
            onBack={() => handleNavigate('temples')}
          />
        );
      case 'book':
        return <BookingFlowPage initialTempleId={selectedTempleId} />;
      case 'counter':
        return <OfflineCounterPage />;
      case 'verify':
        return <TicketLookupPage onNavigateToBook={() => handleNavigate('book')} />;
      case 'cctv':
        return (
          <div className="min-h-screen bg-slate-900 py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto space-y-6">
              <div className="text-center space-y-2">
                <h1 className="text-2xl sm:text-3xl font-black text-white">
                  Live AI CCTV Crowd Density Monitor
                </h1>
                <p className="text-slate-400 text-xs sm:text-sm">
                  Real-time vision feed tracking queue density, bottleneck locations, and estimated sanctum wait times.
                </p>
              </div>
              <CCTVCrowdSimulator />
            </div>
          </div>
        );
      case 'aitech':
        return <AICrowdTechPage />;
      case 'help':
        return <HelpCenterPage onOpenChat={() => setIsChatOpen(true)} />;
      case 'admin':
        return <AdminDashboard />;
      default:
        return <HomePage onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-amber-500 selection:text-white font-sans">
      <Navbar currentTab={currentTab} setCurrentTab={setCurrentTab} />

      <main className="flex-1">
        <ErrorBoundary key={currentTab} onReset={() => setCurrentTab('home')}>
          {renderContent()}
        </ErrorBoundary>
      </main>

      <Footer setCurrentTab={setCurrentTab} />

      {/* Floating Bilingual Chatbot Assistant */}
      <ChatbotDrawer
        isOpen={isChatOpen}
        onToggle={() => setIsChatOpen(!isChatOpen)}
        currentTempleId={selectedTempleId}
      />
    </div>
  );
}

export default App;
