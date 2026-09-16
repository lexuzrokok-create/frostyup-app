"use client";

import { useEffect, useRef, useState } from "react";

// Base URL of the real, live website. Everything shown inside this app
// is loaded directly from here, so it is always up to date / real-time.
const BASE_URL = "https://www.frostyup.id";

// Map each bottom-nav tab to a real page on the live site.
// Edit these paths any time to match your site's actual routes.
const TABS = [
  { id: "home", label: "Beranda", path: "/id-id", icon: HomeIcon },
  { id: "invoices", label: "Transaksi", path: "/id-id/invoices", icon: ReceiptIcon },
  { id: "contact", label: "Bantuan", path: "/id-id/contact-us", icon: ChatIcon },
  { id: "account", label: "Akun", path: "/id-id/sign-in", icon: UserIcon },
];

export default function AppShell() {
  const [activeTab, setActiveTab] = useState("home");
  // Which tabs have ever been opened -> their iframe gets mounted once,
  // then stays mounted (just hidden) so switching tabs back is instant
  // instead of reloading the whole page again.
  const [visited, setVisited] = useState({ home: true });
  // Per-tab load status: "loading" | "loaded" | "blocked"
  const [status, setStatus] = useState({ home: "loading" });
  const [reloadTokens, setReloadTokens] = useState({});
  const [installPrompt, setInstallPrompt] = useState(null);
  const [installBanner, setInstallBanner] = useState(null); // "android" | "ios" | null
  const [showAccountHint, setShowAccountHint] = useState(true);
  const timeoutsRef = useRef({});

  const current = TABS.find((t) => t.id === activeTab);
  const currentUrl = BASE_URL + current.path;

  function markLoading(tabId) {
    setStatus((s) => ({ ...s, [tabId]: "loading" }));
    clearTimeout(timeoutsRef.current[tabId]);
    timeoutsRef.current[tabId] = setTimeout(() => {
      setStatus((s) => (s[tabId] === "loading" ? { ...s, [tabId]: "blocked" } : s));
    }, 6000);
  }

  // Start the timeout for the first (home) tab on mount, and register the
  // service worker + decide whether to show an "add to home screen" banner.
  useEffect(() => {
    markLoading("home");

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;
    const dismissed = localStorage.getItem("frostyup-install-dismissed");

    if (!isStandalone && !dismissed) {
      const isIOS = /iphone|ipad|ipod/i.test(window.navigator.userAgent);
      if (isIOS) setInstallBanner("ios");

      function handleBeforeInstall(e) {
        e.preventDefault();
        setInstallPrompt(e);
        setInstallBanner("android");
      }
      window.addEventListener("beforeinstallprompt", handleBeforeInstall);
      return () => {
        window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
        Object.values(timeoutsRef.current).forEach(clearTimeout);
      };
    }

    return () => {
      Object.values(timeoutsRef.current).forEach(clearTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function dismissInstallBanner() {
    localStorage.setItem("frostyup-install-dismissed", "1");
    setInstallBanner(null);
  }

  async function handleInstallClick() {
    if (!installPrompt) return;
    installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
    dismissInstallBanner();
  }

  function handleTabClick(tabId) {
    setActiveTab(tabId);
    if (!visited[tabId]) {
      setVisited((v) => ({ ...v, [tabId]: true }));
      markLoading(tabId);
    }
  }

  function handleLoad(tabId) {
    clearTimeout(timeoutsRef.current[tabId]);
    setStatus((s) => ({ ...s, [tabId]: "loaded" }));
  }

  function handleRefresh() {
    setReloadTokens((r) => ({ ...r, [activeTab]: (r[activeTab] || 0) + 1 }));
    markLoading(activeTab);
  }

  function handleOpenExternal() {
    window.open(currentUrl, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">
            <img src="/logo.png" alt="FrostyUp" className="brand-logo" />
          </span>
          <span className="brand-name">FrostyUp</span>
        </div>
        <div className="topbar-actions">
          <button aria-label="Muat ulang" className="icon-btn" onClick={handleRefresh}>
            <RefreshIcon />
          </button>
          <button aria-label="Buka di browser" className="icon-btn" onClick={handleOpenExternal}>
            <ExternalIcon />
          </button>
        </div>
      </header>

      <main className="webview">
        {installBanner && (
          <div className="install-toast">
            <span className="install-toast-icon">
              <img src="/logo.png" alt="FrostyUp" className="brand-logo" />
            </span>
            <div className="install-toast-text">
              <strong>Pasang Aplikasi FrostyUp</strong>
              <span>
                {installBanner === "android"
                  ? "Tambah ke home screen buat pengalaman lebih baik!"
                  : "Tap Share lalu \"Add to Home Screen\" untuk pasang"}
              </span>
            </div>
            {installBanner === "android" && (
              <button className="install-toast-btn" onClick={handleInstallClick}>
                Pasang
              </button>
            )}
            <button
              className="install-toast-close"
              aria-label="Tutup"
              onClick={dismissInstallBanner}
            >
              <CloseIcon />
            </button>
          </div>
        )}

        {TABS.map((tab) => {
          if (!visited[tab.id]) return null;
          const tabStatus = status[tab.id];
          const isActiveTab = tab.id === activeTab;
          const tabUrl = BASE_URL + tab.path;
          return (
            <div
              key={tab.id}
              className="webview-pane"
              style={{ display: isActiveTab ? "flex" : "none" }}
            >
              {tab.id === "account" && showAccountHint && (
                <div className="account-hint">
                  <span>
                    Mau login pakai Google? Tap <ExternalIcon /> di pojok kanan atas dulu, baru login di situ.
                  </span>
                  <button
                    className="account-hint-close"
                    aria-label="Tutup"
                    onClick={() => setShowAccountHint(false)}
                  >
                    <CloseIcon />
                  </button>
                </div>
              )}

              {tabStatus === "loading" && (
                <div className="state-overlay">
                  <div className="spinner" />
                  <p>Memuat {tab.label.toLowerCase()}…</p>
                </div>
              )}

              {tabStatus === "blocked" && (
                <div className="state-overlay">
                  <p className="state-title">Halaman ini belum bisa ditampilkan di dalam aplikasi</p>
                  <p>Buka langsung di browser untuk melanjutkan.</p>
                  <button
                    className="cta"
                    onClick={() => window.open(tabUrl, "_blank", "noopener,noreferrer")}
                  >
                    Buka di browser
                  </button>
                </div>
              )}

              <iframe
                key={tab.id + "-" + (reloadTokens[tab.id] || 0)}
                src={tabUrl}
                title={tab.label}
                onLoad={() => handleLoad(tab.id)}
                className="frame"
              />
            </div>
          );
        })}
      </main>

      <nav className="bottomnav">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              className={"navitem" + (isActive ? " active" : "")}
              onClick={() => handleTabClick(tab.id)}
            >
              <Icon />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

/* --- Minimal inline icons (no extra dependencies) --- */

function HomeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 11l9-8 9 8" />
      <path d="M5 10v10h14V10" />
    </svg>
  );
}

function ReceiptIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2h12v20l-3-2-3 2-3-2-3 2V2z" />
      <path d="M9 8h6M9 12h6" />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5c-1.24 0-2.4-.28-3.44-.78L3 21l1.78-6.06A8.5 8.5 0 1 1 21 11.5Z" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12a9 9 0 1 1-2.64-6.36" />
      <path d="M21 3v6h-6" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

function ExternalIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <path d="M15 3h6v6" />
      <path d="M10 14 21 3" />
    </svg>
  );
}
