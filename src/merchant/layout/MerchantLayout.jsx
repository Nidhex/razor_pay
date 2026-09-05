export default function MerchantLayout({ currentPortal, onPortalChange, activeTab, setActiveTab, children }) {
  const pageTitles = {
    dashboard: 'Merchant Dashboard',
    'live-payments': 'Live Payment Activity & Webhooks',
    denials: 'Payment Denials & Failed Transactions',
    cases: 'Active Recovery Cases Lifecycle',
    copilot: 'RecoverAI Financial Assistant',
    analytics: 'Merchant Failure & Recovery Analytics',
    profile: 'Merchant Profile & Settings'
  };

  return (
    <div className="theme-merchant min-h-screen bg-[#F8F9FC] text-slate-900 flex font-sans antialiased">
      {/* Dark Left Sidebar */}
      <MerchantSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area (Light Clean Canvas) */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#F8F9FC]">
        <MerchantTopbar
          currentPortal={currentPortal}
          onPortalChange={onPortalChange}
          activePageTitle={pageTitles[activeTab] || 'Dashboard'}
        />

        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto space-y-8">
          {children}
        </main>
      </div>
    </div>
  );
}
