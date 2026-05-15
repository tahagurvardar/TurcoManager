import { LogOut, Moon, RefreshCw, Sun } from "lucide-react";
import { adminNavigation, managerNavigation } from "../data/navigation";
import { roleLabel } from "../utils/format";

export default function Sidebar({ active, onChange, onLogout, onRefresh, onToggleTheme, theme, user }) {
  const items = user.role === "admin" ? adminNavigation : managerNavigation;

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand__mark">TM</div>
        <div>
          <strong>Turco Manager</strong>
          <span>{roleLabel(user.role)}</span>
        </div>
      </div>

      <nav className="nav-list" aria-label="Ana menü">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <button
              className={active === item.id ? "nav-item nav-item--active" : "nav-item"}
              key={item.id}
              onClick={() => onChange(item.id)}
              type="button"
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="sidebar__footer">
        <button className="icon-button" onClick={onRefresh} title="Verileri yenile" type="button">
          <RefreshCw size={18} />
        </button>
        <button className="icon-button" onClick={onToggleTheme} title={theme === "dark" ? "Light tema" : "Dark tema"} type="button">
          {theme === "dark" ? <Moon size={18} /> : <Sun size={18} />}
        </button>
        <button className="icon-button icon-button--danger" onClick={onLogout} title="Çıkış" type="button">
          <LogOut size={18} />
        </button>
      </div>
    </aside>
  );
}
