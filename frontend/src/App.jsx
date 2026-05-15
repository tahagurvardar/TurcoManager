import { useEffect, useMemo, useState } from "react";
import "./App.css";
import Login from "./Login";
import Sidebar from "./components/Sidebar";
import TopBar from "./components/TopBar";
import useDashboardData from "./hooks/useDashboardData";
import {
  AdminDashboard,
  AnalyticsView,
  CalendarView,
  ClubsView,
} from "./views/AdminViews";
import {
  AcademyView,
  FinancesView,
  ManagerDashboard,
  MatchCenterView,
  ManagementView,
  SquadView,
  StandingsView,
  TacticsView,
  TrainingView,
  TransfersView,
} from "./views/ManagerViews";

function readUser() {
  try {
    const saved = localStorage.getItem("tm_user");
    return saved ? JSON.parse(saved) : null;
  } catch {
    localStorage.removeItem("tm_user");
    localStorage.removeItem("tm_token");
    return null;
  }
}

function LoadingState() {
  return (
    <div className="loading-shell">
      <span />
      <strong>Lig verileri hazırlanıyor</strong>
    </div>
  );
}

function ErrorState({ message, onRetry }) {
  return (
    <div className="error-shell">
      <strong>Veri akışı durdu</strong>
      <p>{message}</p>
      <button className="primary-action primary-action--compact" onClick={onRetry} type="button">
        Yeniden dene
      </button>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(() => readUser());
  const [activeView, setActiveView] = useState(user?.role === "admin" ? "admin" : "dashboard");
  const [theme, setTheme] = useState(() => localStorage.getItem("tm_theme") || "dark");
  const { data, error, loading, reload } = useDashboardData(user);

  const teamName = useMemo(() => {
    if (!data) return user?.teamName;
    return user?.role === "admin" ? "Lig Operasyon Merkezi" : data.team?.name;
  }, [data, user]);

  const logout = () => {
    localStorage.removeItem("tm_token");
    localStorage.removeItem("tm_user");
    setUser(null);
    setActiveView("dashboard");
  };

  useEffect(() => {
    document.body.dataset.theme = theme;
    localStorage.setItem("tm_theme", theme);
  }, [theme]);

  const login = (nextUser) => {
    setUser(nextUser);
    setActiveView(nextUser.role === "admin" ? "admin" : "dashboard");
  };

  if (!user) {
    return <Login onLogin={login} />;
  }

  const renderContent = () => {
    if (loading) return <LoadingState />;
    if (error) return <ErrorState message={error} onRetry={reload} />;
    if (!data) return null;

    if (user.role === "admin") {
      const views = {
        admin: <AdminDashboard data={data} />,
        clubs: <ClubsView data={data} />,
        calendar: <CalendarView data={data} onReload={reload} />,
        analytics: <AnalyticsView data={data} />,
      };
      return views[activeView] || views.admin;
    }

    const views = {
      dashboard: <ManagerDashboard data={data} />,
      squad: <SquadView data={data} />,
      match: <MatchCenterView data={data} />,
      tactics: <TacticsView data={data} onReload={reload} />,
      training: <TrainingView data={data} onReload={reload} />,
      transfers: <TransfersView data={data} onReload={reload} />,
      finances: <FinancesView data={data} onReload={reload} />,
      academy: <AcademyView data={data} onReload={reload} />,
      standings: <StandingsView data={data} />,
      management: <ManagementView data={data} />,
    };

    return views[activeView] || views.dashboard;
  };

  return (
    <div className="app-shell">
      <Sidebar
        active={activeView}
        onChange={setActiveView}
        onLogout={logout}
        onRefresh={reload}
        onToggleTheme={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}
        theme={theme}
        user={user}
      />
      <main className="workspace">
        <TopBar data={data} teamName={teamName} user={user} />
        {renderContent()}
      </main>
    </div>
  );
}
