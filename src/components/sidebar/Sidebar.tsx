import { useState } from "react";
import { ChevronLeft, Menu } from "lucide-react";
import { NavLink } from "react-router-dom";

import SnSLogo from "@/assets/icon/SnSlogo.png";
import { AnimalTheme } from "@/types/animal";
import { menuItems } from "./menu";

interface SidebarProps {
  name?: string;
  animal: AnimalTheme;
}

export default function Sidebar({
  name,
  animal,
}: Readonly<SidebarProps>) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile Toggle */}

      <button
        onClick={() => setMobileOpen(true)}
        className="
        lg:hidden
        fixed
        top-5
        left-5
        z-50
        bg-white
        rounded-xl
        p-3
        shadow-lg
      "
      >
        <Menu size={22} />
      </button>

      {/* Overlay */}

      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`
          fixed
          lg:relative
          z-50
          h-screen
          transition-all
          duration-300
          bg-slate-950
          text-white
          flex
          flex-col
          border-r
          border-slate-800

          ${
            collapsed
              ? "w-20"
              : "w-72"
          }

          ${
            mobileOpen
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0"
          }
        `}
      >
        {/* Header */}

        <div className="relative p-6 overflow-hidden border-b border-slate-800">

          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: `url(${animal.watermark})`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
              backgroundSize: "90%",
            }}
          />

          <div className="relative flex items-center gap-3">

            <img
              src={SnSLogo}
              className="w-11 h-11 rounded-xl"
            />

            {!collapsed && (
              <div>

                <h1 className="font-bold">
                  Screws & Spanners
                </h1>

                <p
                  className="text-xs"
                  style={{
                    color: animal.accent,
                  }}
                >
                  {animal.eyeName}
                </p>

              </div>
            )}

          </div>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="
              hidden
              lg:flex
              absolute
              -right-4
              top-7
              bg-white
              text-black
              rounded-full
              p-1
              shadow-lg
            "
          >
            <ChevronLeft
              className={`transition ${
                collapsed ? "rotate-180" : ""
              }`}
            />
          </button>

        </div>

        {/* Navigation */}

        <nav className="flex-1 px-3 py-6 space-y-2">

          {menuItems.map((item) => {

            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end
                className={({ isActive }) =>
                  `
                  group
                  relative
                  flex
                  items-center
                  gap-4
                  rounded-xl
                  px-4
                  py-3
                  transition-all

                  ${
                    isActive
                      ? "bg-white/10"
                      : "hover:bg-white/5"
                  }
                `
                }
              >
                {({ isActive }) => (
                  <>

                    {isActive && (
                      <span
                        className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full"
                        style={{
                          background: animal.primary,
                        }}
                      />
                    )}

                    <Icon
                      size={20}
                      color={
                        isActive
                          ? animal.primary
                          : "#CBD5E1"
                      }
                    />

                    {!collapsed && (
                      <span className="text-sm font-medium">
                        {item.name}
                      </span>
                    )}

                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* User */}

        <div className="border-t border-slate-800 p-5">

          <div className="flex items-center gap-3">

            <div
              className="h-12 w-12 rounded-xl flex items-center justify-center text-lg font-bold"
              style={{
                background: animal.secondary,
                color: animal.primary,
              }}
            >
              {name?.charAt(0)}
            </div>

            {!collapsed && (
              <div>

                <p className="font-semibold">
                  {name}
                </p>

                <p className="text-xs text-slate-400">
                  Administrator
                </p>

              </div>
            )}

          </div>

        </div>

      </aside>
    </>
  );
}