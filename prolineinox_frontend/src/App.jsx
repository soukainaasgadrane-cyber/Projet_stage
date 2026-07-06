import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SettingsProvider } from './contexts/SettingsContext';
import DashboardLayout from './layouts/DashboardLayout';
import Login from './pages/auth/Login';

// 1. DASHBOARD & BASIC PAGES
import Dashboard from './pages/dashboard/Dashboard';
import Comptes from './pages/Comptes';
import Ventes from './pages/Ventes'; 
import RoutePlaceholder from './pages/RoutePlaceholder';
import Reglages from './pages/Reglages';

// 2. ACHATS (Imports corrigés avec des noms uniques)
import AvoirsAchats from './pages/achats/AvoirsAchats';
import BonsCommandesAchats from './pages/achats/BonsCommandes';
import BonReceptionAchats from './pages/achats/BonReception';
import DemandesPrix from './pages/achats/DemandesPrix';
import FacturesAchats from './pages/achats/FacturesAchats';
import RapportsAchats from './pages/achats/RapportsAchats';

// 3. CATALOGUE
import Articles from './pages/catalogue/Articles';
import ArticleImageUpload from './pages/catalogue/ArticleImageUpload';
import RapportsCatalogue from './pages/catalogue/RapportsCatalogue';

// 4. COLLABORATEURS
import Users from './pages/collaborateurs/Users';
import Grow from './pages/collaborateurs/Grow';
import HistoriqueCollaborateurs from './pages/collaborateurs/Historique';

// 5. CRM
import CRMAccounts from './pages/crm/Accounts';
import CRMContacts from './pages/crm/Contacts';
import CRMCompanies from './pages/crm/Companies';
import CRMRapports from './pages/crm/Rapports';

// 6. FINANCE
import Transactions from './pages/finance/Transactions';
import Recouvrement from './pages/finance/Recouvrement';
import Cheques from './pages/finance/Cheques';
import Rapprochement from './pages/finance/Rapprochement';
import RapportsFinance from './pages/finance/RapportsFinance';
import RelevesBancaires from './pages/finance/RelevesBancaires';
import RemisesCheques from './pages/finance/RemisesCheques';

// 7. VENTES SUB-PAGES
import AvoirsVentes from './pages/ventes/Avoirs';
import BonsLivraison from './pages/ventes/BonsLivraison';
import CommandesVentes from './pages/ventes/Commandes';
import Devis from './pages/ventes/Devis';
import FacturesVentes from './pages/ventes/Factures';
import FacturesRecurrentes from './pages/ventes/FacturesRecurrentes';
import Proforma from './pages/ventes/Proforma';
import RapportsVentes from './pages/ventes/RapportsVentes';
import DocumentEditor from './pages/ventes/DocumentEditor';
import AdminCommercials from './pages/admin/AdminCommercials';
import AdminReadOnlyTable from './pages/admin/AdminReadOnlyTable';
import AdminReports from './pages/admin/AdminReports';
import AdminProfile from './pages/admin/AdminProfile';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex h-screen items-center justify-center">Chargement...</div>;
  return user ? children : <Navigate to="/login" />;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      {/* Routes protégées avec DashboardLayout */}
      <Route path="/" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="comptes" element={<Comptes />} />
        <Route path="contacts" element={<CRMContacts />} />
        <Route path="ventes" element={<Ventes />} />
        <Route path="reglages" element={<Reglages />} />
        <Route path="admin/commercials" element={<AdminCommercials />} />
        <Route path="admin/clients" element={<AdminReadOnlyTable type="clients" />} />
        <Route path="admin/devis" element={<AdminReadOnlyTable type="devis" />} />
        <Route path="admin/commandes" element={<AdminReadOnlyTable type="commandes" />} />
        <Route path="admin/historique" element={<AdminReadOnlyTable type="historique" />} />
        <Route path="admin/rapports" element={<AdminReports />} />
        <Route path="admin/profil" element={<AdminProfile />} />

        {/* --- ACHATS ROUTES --- */}
        <Route path="achats/demandes-prix" element={<DemandesPrix />} />
        <Route path="achats/demandes-prix/:id" element={<DocumentEditor documentKind="purchase-request" />} />
        <Route path="achats/bons-commandes" element={<BonsCommandesAchats />} />
        <Route path="achats/bons-commandes/:id" element={<DocumentEditor documentKind="purchase-order" />} />
        <Route path="achats/bon-reception" element={<BonReceptionAchats />} />
        <Route path="achats/bon-reception/:id" element={<DocumentEditor documentKind="receipt-note" />} />
        <Route path="achats/bons-reception/:id" element={<DocumentEditor documentKind="receipt-note" />} />
        <Route path="achats/factures" element={<FacturesAchats />} />
        <Route path="achats/factures/:id" element={<DocumentEditor documentKind="supplier-invoice" />} />
        <Route path="achats/factures-achats/:id" element={<DocumentEditor documentKind="supplier-invoice" />} />
        <Route path="achats/avoirs" element={<AvoirsAchats />} />
        <Route path="achats/avoirs/:id" element={<DocumentEditor documentKind="supplier-credit-note" />} />
        <Route path="achats/avoirs-achats/:id" element={<DocumentEditor documentKind="supplier-credit-note" />} />
        <Route path="achats/rapports" element={<RapportsAchats />} />

        {/* --- CATALOGUE ROUTES --- */}
        <Route path="catalogue/articles" element={<Articles />} />
        <Route path="catalogue/articles/upload-image" element={<ArticleImageUpload />} />
        <Route path="catalogue/articles/:id" element={<RoutePlaceholder title="Article" />} />
        <Route path="catalogue/rapports" element={<RapportsCatalogue />} />

        {/* --- COLLABORATEURS ROUTES --- */}
        <Route path="collaborateurs/users" element={<Users />} />
        <Route path="collaborateurs/grow" element={<Grow />} />
        <Route path="collaborateurs/historique" element={<HistoriqueCollaborateurs />} />

        {/* --- CRM ROUTES --- */}
        <Route path="crm/accounts" element={<CRMAccounts />} />
        <Route path="crm/accounts/:id" element={<RoutePlaceholder title="Compte CRM" />} />
        <Route path="crm/contacts" element={<CRMContacts />} />
        <Route path="crm/contacts/:id" element={<RoutePlaceholder title="Contact CRM" />} />
        <Route path="crm/companies" element={<CRMCompanies />} />
        <Route path="crm/companies/:id" element={<RoutePlaceholder title="Société CRM" />} />
        <Route path="crm/rapports" element={<CRMRapports />} />

        {/* --- FINANCE ROUTES --- */}
        <Route path="finance/transactions" element={<Transactions />} />
        <Route path="finance/recouvrement" element={<Recouvrement />} />
        <Route path="finance/cheques" element={<Cheques />} />
        <Route path="finance/rapprochement" element={<Rapprochement />} />
        <Route path="finance/releves-bancaires" element={<RelevesBancaires />} />
        <Route path="finance/remises-cheques" element={<RemisesCheques />} />
        <Route path="finance/rapports" element={<RapportsFinance />} />

        {/* --- VENTES DETAILS ROUTES --- */}
        <Route path="ventes/devis" element={<Devis />} />
        <Route path="ventes/devis/:id" element={<DocumentEditor documentKind="devis" />} />
        <Route path="ventes/commandes" element={<CommandesVentes />} />
        <Route path="ventes/commandes/:id" element={<DocumentEditor documentKind="commandes" />} />
        <Route path="ventes/bons-livraison" element={<BonsLivraison />} />
        <Route path="ventes/bons-livraison/:id" element={<DocumentEditor documentKind="bons-livraison" />} />
        <Route path="ventes/factures" element={<FacturesVentes />} />
        <Route path="ventes/factures/:id" element={<DocumentEditor documentKind="factures" />} />
        <Route path="ventes/factures-recurrentes" element={<FacturesRecurrentes />} />
        <Route path="ventes/proforma" element={<Proforma />} />
        <Route path="ventes/proforma/:id" element={<DocumentEditor documentKind="proforma" />} />
        <Route path="ventes/avoirs" element={<AvoirsVentes />} />
        <Route path="ventes/avoirs/:id" element={<DocumentEditor documentKind="avoirs" />} />
        <Route path="ventes/rapports" element={<RapportsVentes />} />
        <Route path="*" element={<RoutePlaceholder title="Page introuvable" />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <SettingsProvider>
      <AuthProvider>
        <BrowserRouter>
          <Toaster position="top-right" />
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </SettingsProvider>
  );
}

export default App;

