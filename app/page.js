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
  const [loading, setLoading] = useState(true);
  const [blocked, setBlocked] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [installBanner, setInstallBanner] = useState(null); // "android" | "ios" | null
  const timeoutRef = useRef(null);

  const current = TABS.find((t) => t.id === activeTab);
  const url = BASE_URL + current.path;

  // Register the service worker + decide whether to show an
  // "add to home screen" banner (skip it if already installed,
  // or if the visitor dismissed it before).
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;
    const dismissed = localStorage.getItem("frostyup-install-dismissed");

    if (isStandalone || dismissed) return;

    const isIOS = /iphone|ipad|ipod/i.test(window.navigator.userAgent);
    if (isIOS) {
      setInstallBanner("ios");
    }

    function handleBeforeInstall(e) {
      e.preventDefault();
      setInstallPrompt(e);
      setInstallBanner("android");
    }
    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
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

  useEffect(() => {
    setLoading(true);
    setBlocked(false);
    clearTimeout(timeoutRef.current);
    // If the page hasn't loaded after a few seconds, the site is likely
    // refusing to be embedded (X-Frame-Options / CSP frame-ancestors).
    timeoutRef.current = setTimeout(() => {
      setLoading(false);
      setBlocked(true);
    }, 6000);
    return () => clearTimeout(timeoutRef.current);
  }, [activeTab, reloadKey]);

  function handleLoad() {
    clearTimeout(timeoutRef.current);
    setLoading(false);
    setBlocked(false);
  }

  function handleRefresh() {
    setReloadKey((k) => k + 1);
  }

  function handleOpenExternal() {
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">
            <SnowflakeIcon />
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

      {installBanner === "android" && (
        <div className="install-banner">
          <span>Pasang FrostyUp di layar utama HP-mu</span>
          <div className="install-banner-actions">
            <button className="install-btn" onClick={handleInstallClick}>
              Install
            </button>
            <button className="icon-btn small" aria-label="Tutup" onClick={dismissInstallBanner}>
              <CloseIcon />
            </button>
          </div>
        </div>
      )}

      {installBanner === "ios" && (
        <div className="install-banner">
          <span>
            Tap <ShareIcon /> lalu <strong>"Add to Home Screen"</strong> untuk pasang FrostyUp
          </span>
          <button className="icon-btn small" aria-label="Tutup" onClick={dismissInstallBanner}>
            <CloseIcon />
          </button>
        </div>
      )}

      <main className="webview">
        {loading && (
          <div className="state-overlay">
            <div className="spinner" />
            <p>Memuat {current.label.toLowerCase()}…</p>
          </div>
        )}

        {blocked && (
          <div className="state-overlay">
            <p className="state-title">Halaman ini belum bisa ditampilkan di dalam aplikasi</p>
            <p>Buka langsung di browser untuk melanjutkan.</p>
            <button className="cta" onClick={handleOpenExternal}>
              Buka di browser
            </button>
          </div>
        )}

        <iframe
          key={activeTab + "-" + reloadKey}
          src={url}
          title={current.label}
          onLoad={handleLoad}
          className="frame"
        />
      </main>

      <nav className="bottomnav">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              className={"navitem" + (isActive ? " active" : "")}
              onClick={() => setActiveTab(tab.id)}
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

function SnowflakeIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2v20M4.9 4.9l14.2 14.2M19.1 4.9L4.9 19.1M2 12h20M7 7l-3-1M7 7l1-3M17 7l3-1M17 7l-1-3M7 17l-3 1M7 17l1 3M17 17l3 1M17 17l-1 3" />
    </svg>
  );
}

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

function ShareIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: "-2px", margin: "0 2px" }}>
      <path d="M12 16V4M7 8l5-5 5 5" />
      <path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7" />
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
