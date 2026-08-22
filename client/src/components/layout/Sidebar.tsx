import { NavLink } from "react-router-dom";

const links = [
  { to: "/", label: "Estimator", end: true },
  { to: "/history", label: "History" },
  { to: "/request-form", label: "Request Form" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/reports", label: "Reports" },
  
];

export default function Sidebar() {
  return (
    <aside className="border-b border-gray-200 bg-white lg:w-52 lg:shrink-0 lg:border-b-0 lg:border-r">
      <nav className="flex gap-1 overflow-x-auto px-3 py-2 lg:flex-col lg:overflow-visible lg:p-4">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.end}
            className={({ isActive }) =>
              `shrink-0 whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium ${
                isActive ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-100"
              }`
            }
          >
            {l.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
