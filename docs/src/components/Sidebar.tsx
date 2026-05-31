import { Link, useLocation } from "@tanstack/solid-router";
import { For } from "solid-js";
import { useTheme } from "../theme";

const sections = [
  { label: "Overview", items: [{ href: "/", label: "Home" }] },
  {
    label: "Core",
    items: [
      { href: "/api", label: "API Reference" },
      { href: "/core-algorithm", label: "Core Algorithm" },
    ],
  },
  {
    label: "Framework Hooks",
    items: [
      { href: "/react", label: "React" },
      { href: "/solid", label: "SolidJS" },
      { href: "/compose", label: "Jetpack Compose" },
      { href: "/swift", label: "SwiftUI" },
      { href: "/flutter", label: "Flutter" },
    ],
  },
  { label: "Dev", items: [{ href: "/build", label: "Build Guide" }] },
];

export default function Sidebar() {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  const isActive = (href: string) => {
    const loc = location();
    const path = loc?.pathname ?? "/";
    if (href === "/") return path === "/";
    return path.startsWith(href);
  };

  return (
    <aside class="w-64 shrink-0 border-r border-border bg-surface hidden lg:block">
      <div class="sticky top-0 flex flex-col h-screen">
        <div class="px-6 py-6 border-b border-border">
          <Link
            href="/"
            class="flex items-center gap-2 text-lg font-semibold tracking-tight hover:text-accent-light transition-colors"
          >
            <span class="text-xl">🪄</span>
            <span>Domain Autocorrect</span>
          </Link>
        </div>
        <nav class="flex-1 overflow-y-auto px-4 py-4 space-y-6">
          <For each={sections}>
            {(section) => (
              <div>
                <h3 class="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-text-muted">
                  {section.label}
                </h3>
                <ul class="space-y-0.5">
                  <For each={section.items}>
                    {(item) => (
                      <li>
                        <Link
                          href={item.href}
                          class={`block rounded-md px-3 py-2 text-sm transition-colors ${
                            isActive(item.href)
                              ? "bg-accent/20 text-accent-light font-medium"
                              : "text-text-muted hover:bg-surface-raised hover:text-accent-light"
                          }`}
                        >
                          {item.label}
                        </Link>
                      </li>
                    )}
                  </For>
                </ul>
              </div>
            )}
          </For>
        </nav>
        <div class="px-4 py-4 border-t border-border space-y-1">
          <a
            href="https://github.com/ASAR001/domain_autocorrect"
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-text-muted hover:bg-surface-raised hover:text-accent-light transition-colors"
          >
            <svg class="h-4 w-4 shrink-0" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            <span class="flex-1">GitHub</span>
            <svg class="h-3 w-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
          <button
            onClick={toggleTheme}
            class="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-text-muted hover:bg-surface-raised hover:text-accent-light transition-colors w-full"
          >
            {theme() === 'dark' ? (
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            ) : (
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="5" />
                <path stroke-linecap="round" d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
              </svg>
            )}
            {theme() === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>
      </div>
    </aside>
  );
}
