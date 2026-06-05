import React, { useState, useEffect } from "react";
import {
  StockCandle,
  MarketAsset,
  CryptoItem,
  StockNewsItem,
  AdvisorAdvice,
  HistoricAdvice,
  PersonalizedAlert
} from "./types";
import { PriceChart } from "./components/PriceChart";
import { AIPositioningCard } from "./components/AIPositioningCard";
import { NewsFeedList } from "./components/NewsFeedList";
import { MarketWatcher } from "./components/MarketWatcher";
import { AlertNotificationSystem } from "./components/AlertNotificationSystem";
import { GainsHistoricList } from "./components/GainsHistoricList";
import { StatCard } from "./components/StatCard";
import { LandingPage } from "./components/LandingPage";
import { AuthPage } from "./components/AuthPage";
import { SocialSentimentWidget } from "./components/SocialSentimentWidget";
import { TechnicalIndicatorsWidget } from "./components/TechnicalIndicatorsWidget";
import { PortfolioSimulatorWidget } from "./components/PortfolioSimulatorWidget";
import {
  Cpu,
  Search,
  RefreshCw,
  Bell,
  Trash2,
  TrendingUp,
  Activity,
  Award,
  BookOpen,
  Compass,
  Landmark,
  Coins,
  Globe,
  LogOut,
  Menu,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  // Authentication & Dynamic Routing States
  const [currentView, setCurrentView] = useState<"landing" | "auth" | "app">(() => {
    const session = localStorage.getItem("quantum_session");
    return session ? "app" : "landing";
  });
  const [currentUser, setCurrentUser] = useState<{ name: string; method: string } | null>(() => {
    const session = localStorage.getItem("quantum_session");
    return session ? JSON.parse(session) : null;
  });
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Global Market state
  const [marketLoading, setMarketLoading] = useState(true);
  const [topGainers, setTopGainers] = useState<MarketAsset[]>([]);
  const [topLosers, setTopLosers] = useState<MarketAsset[]>([]);
  const [mostActives, setMostActives] = useState<MarketAsset[]>([]);
  const [cryptos, setCryptos] = useState<CryptoItem[]>([]);
  const [news, setNews] = useState<StockNewsItem[]>([]);
  const [newsApiSource, setNewsApiSource] = useState("fallback_simulation");

  // Theme Navigation State
  const [activeTheme, setActiveTheme] = useState<"bourse" | "sicav" | "crypto" | "devises">("bourse");

  // Selected asset state
  const [selectedSymbol, setSelectedSymbol] = useState("AAPL");
  const [selectedAssetType, setSelectedAssetType] = useState<"Stock" | "Crypto" | "SICAV" | "Devise">("Stock");
  const [currentSelectedPrice, setCurrentSelectedPrice] = useState(185.92);

  // Search input state
  const [searchQuery, setSearchQuery] = useState("");

  // Target chart details state
  const [candleHistory, setCandleHistory] = useState<StockCandle[]>([]);
  const [chartLoading, setChartLoading] = useState(true);

  // Gemini expert advisor recommendation state
  const [advisorAdvice, setAdvisorAdvice] = useState<AdvisorAdvice | null>(null);
  const [adviceLoading, setAdviceLoading] = useState(false);

  // History list logs state
  const [historicAdviceList, setHistoricAdviceList] = useState<HistoricAdvice[]>([]);

  // Personal alerts state
  const [alerts, setAlerts] = useState<PersonalizedAlert[]>([]);
  const [toastNotification, setToastNotification] = useState<string | null>(null);

  // Initial load
  useEffect(() => {
    fetchMarketData();
    fetchNewsData();
    fetchAssetHistory(selectedSymbol, selectedAssetType);
  }, []);

  // Fetch real-time metrics feeds
  const fetchMarketData = async () => {
    setMarketLoading(true);
    try {
      const marketRes = await fetch("/api/market-summary");
      const marketJson = await marketRes.json();
      setTopGainers(marketJson.top_gainers || []);
      setTopLosers(marketJson.top_losers || []);
      setMostActives(marketJson.most_actively_traded || []);

      const cryptoRes = await fetch("/api/crypto-prices");
      const cryptoJson = await cryptoRes.json();
      setCryptos(cryptoJson.crypto || []);
    } catch (e) {
      console.error("Failed fetching live market feeds", e);
    } finally {
      setMarketLoading(false);
    }
  };

  const fetchNewsData = async () => {
    try {
      const newsRes = await fetch("/api/stock-news");
      const newsJson = await newsRes.json();
      setNews(newsJson.feed || []);
      setNewsApiSource(newsJson.source_api || "fallback_simulation");
    } catch (e) {
      console.error("News load failure", e);
    }
  };

  // Loads candlestick details
  const fetchAssetHistory = async (symbol: string, type: "Stock" | "Crypto" | "SICAV" | "Devise") => {
    setChartLoading(true);
    try {
      const res = await fetch(`/api/stock-history?symbol=${symbol}`);
      const data = await res.json();
      const history = data.history || [];
      setCandleHistory(history);

      if (history.length > 0) {
        const lastCandle = history[history.length - 1];
        setCurrentSelectedPrice(lastCandle.close);
      }
    } catch (e) {
      console.error("Failed loading candlestick data files", e);
    } finally {
      setChartLoading(false);
    }
  };

  // Triggers Gemini AI Expert analysis
  const executeAIAdvisorAnalysis = async (symbol: string, type: "Stock" | "Crypto" | "SICAV" | "Devise", history: StockCandle[]) => {
    if (history.length === 0) return;
    setAdviceLoading(true);
    try {
      const response = await fetch("/api/analyze-asset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbol,
          recentPrices: history,
          assetType: type,
          sentimentSummary: news.slice(0, 3).map(n => n.overall_sentiment_label).join(", ")
        })
      });
      const data: AdvisorAdvice = await response.json();
      setAdvisorAdvice(data);

      const lastPrice = history[history.length - 1]?.close || currentSelectedPrice;
      const newRecord: HistoricAdvice = {
        id: Math.random().toString(36).substring(2, 9),
        symbol,
        assetType: type,
        advicePrice: lastPrice,
        adviceDate: new Date().toLocaleDateString("fr-FR"),
        verdict: data.verdict,
        confidence: data.confidence,
        targetPrice: data.targetPrice,
        stopLoss: data.stopLoss,
        riskScore: data.riskScore,
        rationale: data.rationale,
        currentPriceAtReview: lastPrice
      };
      setHistoricAdviceList((prev) => [newRecord, ...prev]);
    } catch (e) {
      console.error("Gemini positioning logic error", e);
    } finally {
      setAdviceLoading(false);
    }
  };

  // Triggers initial analysis on asset switch
  const handleSelectAsset = (symbol: string, type: "Stock" | "Crypto" | "SICAV" | "Devise", price: number) => {
    setSelectedSymbol(symbol);
    setSelectedAssetType(type);
    setCurrentSelectedPrice(price);
    fetchAssetHistory(symbol, type).then(() => {
      setAdvisorAdvice(null);
    });
  };

  // Switch workspace according to active theme
  const handleThemeChange = (theme: "bourse" | "sicav" | "crypto" | "devises") => {
    setActiveTheme(theme);
    if (theme === "bourse") {
      handleSelectAsset("AAPL", "Stock", 185.92);
    } else if (theme === "sicav") {
      handleSelectAsset("CARM-PAT", "SICAV", 625.40);
    } else if (theme === "crypto") {
      handleSelectAsset("BTC", "Crypto", 68420.50);
    } else {
      handleSelectAsset("EUR/USD", "Devise", 1.0854);
    }
  };

  // Refreshes specific asset analysis
  const handleRefreshAI = () => {
    executeAIAdvisorAnalysis(selectedSymbol, selectedAssetType, candleHistory);
  };

  // Custom alert creator
  const handleAddAlert = (symbol: string, assetType: "Stock" | "Crypto" | "SICAV" | "Devise", condition: "ABOVE" | "BELOW", targetPrice: number) => {
    const freshAlert: PersonalizedAlert = {
      id: Math.random().toString(36).substring(2, 9),
      symbol: symbol.toUpperCase(),
      assetType,
      condition,
      targetPrice,
      createdAt: new Date().toISOString(),
      triggered: false
    };
    setAlerts((prev) => [...prev, freshAlert]);
    const isSicavAlert = assetType === "SICAV";
    const currencyStr = isSicavAlert ? "€" : assetType === "Devise" ? " USD" : "$";
    triggerToast(`Règle d'alerte créée : ${symbol.toUpperCase()} à ${targetPrice}${currencyStr} !`);
  };

  // Removes alert from list
  const handleRemoveAlert = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  // Periodic simulated ticker loop and alert monitoring engine
  useEffect(() => {
    const checkTickerAlerts = () => {
      setAlerts((prevAlerts) => {
        return prevAlerts.map((alert) => {
          if (alert.triggered) return alert;

          const matchesSymbol = alert.symbol === selectedSymbol;
          if (matchesSymbol) {
            const isAb = alert.condition === "ABOVE" && currentSelectedPrice >= alert.targetPrice;
            const isBe = alert.condition === "BELOW" && currentSelectedPrice <= alert.targetPrice;

            if (isAb || isBe) {
              const audioStr = "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA==";
              try {
                const alertSound = new Audio(audioStr);
                alertSound.play().catch(() => {});
              } catch (_) {}

              const isSicavAlert = alert.assetType === "SICAV";
              const curSym = isSicavAlert ? "€" : alert.assetType === "Devise" ? " USD" : "$";
              
              if ("Notification" in window && Notification.permission === "granted") {
                new Notification(`Alerte de Prix franchie : ${alert.symbol}`, {
                  body: `L'actif a dépassé le seuil de ${alert.targetPrice}${curSym} ! Prix: ${currentSelectedPrice}${curSym}`,
                });
              }

              triggerToast(`🚨 Seuil franchi : ${alert.symbol} à ${alert.targetPrice}${curSym} !`);
              return { ...alert, triggered: true, triggerDate: new Date().toISOString() };
            }
          }
          return alert;
        });
      });
    };

    checkTickerAlerts();
  }, [currentSelectedPrice, selectedSymbol]);

  // Toast banner utility helper
  const triggerToast = (msg: string) => {
    setToastNotification(msg);
    setTimeout(() => {
      setToastNotification(null);
    }, 4500);
  };

  // Handles ticker search entries
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery) return;
    const cleanSymObj = searchQuery.trim().toUpperCase();
    
    // Look up inside loaded assets to discover type
    const sicavList = [
      { ticker: "CARM-PAT", price: 625.40 },
      { ticker: "AMUN-ACT", price: 248.15 },
      { ticker: "LYX-CAC", price: 78.90 },
      { ticker: "SEXT-GL", price: 382.50 },
      { ticker: "AXA-LCE", price: 189.20 }
    ];
    const findSicav = sicavList.find(s => s.ticker === cleanSymObj);
    const findStock = [...topGainers, ...topLosers, ...mostActives].find(s => s.ticker === cleanSymObj);
    const findCrypto = cryptos.find(c => c.symbol.toUpperCase() === cleanSymObj);
    
    let detectedType: "Stock" | "Crypto" | "SICAV" = "Stock";
    let detectedPrice = 150.0;
    
    if (findSicav) {
      detectedType = "SICAV";
      detectedPrice = findSicav.price;
      setActiveTheme("sicav");
    } else if (findCrypto) {
      detectedType = "Crypto";
      detectedPrice = findCrypto.current_price;
      setActiveTheme("crypto");
    } else {
      detectedType = "Stock";
      detectedPrice = findStock ? parseFloat(findStock.price) : 150.0;
      setActiveTheme("bourse");
    }
    
    handleSelectAsset(cleanSymObj, detectedType, detectedPrice);
    setSearchQuery("");
  };

  if (currentView === "landing") {
    return <LandingPage onEnterApp={(mode) => { setAuthMode(mode); setCurrentView("auth"); }} />;
  }

  if (currentView === "auth") {
    return (
      <AuthPage
        onAuthSuccess={(user) => {
          setCurrentUser(user);
          setCurrentView("app");
          localStorage.setItem("quantum_session", JSON.stringify(user));
          triggerToast(`Bienvenue, ${user.name} ! Connexion réussie via ${user.method}.`);
        }}
        onBackToLanding={() => setCurrentView("landing")}
        initialMode={authMode}
      />
    );
  }

  return (
    <div id="application-body" className="min-h-screen bg-slate-950 text-slate-200 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Floating System Alerts Toasts */}
      <AnimatePresence>
        {toastNotification && (
          <motion.div
            id="toast-alert"
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="fixed top-6 right-6 z-50 bg-slate-900 border border-indigo-550 text-slate-100 px-5 py-3.5 rounded-xl shadow-2xl flex items-center space-x-3 max-w-sm"
          >
            <div className="p-1.5 bg-indigo-500/20 rounded-md">
              <Bell className="w-5 h-5 text-indigo-400 animate-swing" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-indigo-300 tracking-wider">Alerte QuantumAdvise</p>
              <p className="text-slate-200 text-xs mt-0.5 font-light">{toastNotification}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Navigation */}
      <header className="flex flex-wrap items-center justify-between min-h-14 py-2 px-6 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-40 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center p-1 shadow-md shadow-indigo-950/50">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
            </svg>
          </div>
          <span className="font-display font-bold text-lg tracking-tight text-white select-none">
            QUANTUM<span className="text-indigo-400">ADVISE</span>
          </span>
        </div>

        {/* Global Financial Metrics indexes */}
        <div className="hidden md:flex items-center gap-6 text-xs font-semibold">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-mono">S&P 500</span>
            <span className="text-emerald-400 font-mono">5,137.08 (+0.82%)</span>
          </div>
          <div className="flex items-center gap-2 border-l border-slate-800 pl-4">
            <span className="text-slate-500 font-mono">BTC / USD</span>
            <span className="text-emerald-400 font-mono">$67,432.12 (+2.4%)</span>
          </div>
          <div className="flex items-center gap-2 border-l border-slate-800 pl-4">
            <span className="text-slate-500 font-mono">ACTIVE TIQUET</span>
            <span className="text-indigo-400 uppercase font-bold font-mono">{selectedSymbol} (${currentSelectedPrice})</span>
          </div>
        </div>

        {/* Dynamic header interactive actions */}
        <div className="flex items-center gap-3 flex-wrap">
          <form onSubmit={handleSearch} className="relative">
            <input
              id="search-asset"
              type="text"
              placeholder="Chercher ticker (ex. TSLA, BTC)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-36 sm:w-48 bg-slate-950 border border-slate-800 text-xs px-3 py-1.5 rounded-lg text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-all font-sans"
            />
            <button type="submit" className="absolute right-2.5 top-2 hover:text-indigo-400 transition-colors">
              <Search className="w-3.5 h-3.5 text-slate-500" />
            </button>
          </form>

          <button
            id="btn-global-fetch"
            onClick={() => {
              fetchMarketData();
              fetchNewsData();
              fetchAssetHistory(selectedSymbol, selectedAssetType);
            }}
            className="p-1.5 bg-slate-800 hover:bg-slate-700/85 border border-slate-700/65 rounded-lg transition-colors text-slate-400 hover:text-slate-200"
            title="Rafraîchir les flux financiers"
          >
            <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
          </button>

          {currentUser && (
            <div className="hidden sm:flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-xl">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <span className="text-[10px] sm:text-xs font-bold text-indigo-300 font-mono truncate max-w-[120px]">{currentUser.name}</span>
            </div>
          )}

          <button
            id="btn-logout"
            onClick={() => {
              localStorage.removeItem("quantum_session");
              setCurrentUser(null);
              setCurrentView("landing");
              triggerToast("Session Quantum close.");
            }}
            className="flex items-center gap-1 bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-slate-600 text-slate-350 hover:text-rose-400 px-3 py-1.5 rounded-lg transition-colors cursor-pointer text-xs font-mono font-bold"
            title="Se déconnecter"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Quitter</span>
          </button>
        </div>
      </header>

      {/* Sub-Header Horizontal Theme Navigation Menu */}
      <div className="bg-slate-900 border-b border-slate-800 px-6 py-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col md:flex-row w-full md:w-auto items-stretch md:items-center gap-2 bg-slate-950/80 p-2 md:p-1.5 rounded-xl border border-slate-850/80">
          <button
            id="menu-link-bourse"
            onClick={() => handleThemeChange("bourse")}
            className={`flex items-center justify-center md:justify-start space-x-2 px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all w-full md:w-auto ${
              activeTheme === "bourse"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-950/50"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
            }`}
          >
            <Activity className="w-3.5 h-3.5 shrink-0" />
            <span>Valeurs boursières</span>
          </button>

          <button
            id="menu-link-sicav"
            onClick={() => handleThemeChange("sicav")}
            className={`flex items-center justify-center md:justify-start space-x-2 px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all w-full md:w-auto ${
              activeTheme === "sicav"
                ? "bg-amber-600 text-white shadow-md shadow-amber-950/50"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
            }`}
          >
            <Landmark className="w-3.5 h-3.5 shrink-0" />
            <span>SICAV françaises</span>
          </button>

          <button
            id="menu-link-crypto"
            onClick={() => handleThemeChange("crypto")}
            className={`flex items-center justify-center md:justify-start space-x-2 px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all w-full md:w-auto ${
              activeTheme === "crypto"
                ? "bg-teal-600 text-white shadow-md shadow-teal-950/50"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
            }`}
          >
            <Coins className="w-3.5 h-3.5 shrink-0" />
            <span>Crypto-monnaies</span>
          </button>

          <button
            id="menu-link-devises"
            onClick={() => handleThemeChange("devises")}
            className={`flex items-center justify-center md:justify-start space-x-2 px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all w-full md:w-auto ${
              activeTheme === "devises"
                ? "bg-violet-600 text-white shadow-md shadow-violet-950/50"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
            }`}
          >
            <Globe className="w-3.5 h-3.5 shrink-0" />
            <span>Devises / Forex</span>
          </button>
        </div>

        {/* Informative category tooltip bar */}
        <div className="hidden lg:flex items-center space-x-2 text-[11px] font-mono pr-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-slate-500 font-bold uppercase">Focus Thématique :</span>
          <span className="text-slate-350 font-medium">
            {activeTheme === "bourse" && "Indices et actions de grandes capitalisations (Alpha Vantage)"}
            {activeTheme === "sicav" && "Portefeuilles mutuels européens réglementés (Devise : EUR)"}
            {activeTheme === "crypto" && "Jetons et protocoles décentralisés en continu (CoinGecko)"}
            {activeTheme === "devises" && "Taux de change interbancaire mondial (Standard Forex)"}
          </span>
        </div>

        {/* Mobile/Tablet sidebar toggle */}
        <button
          onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
          className="lg:hidden flex items-center space-x-1.5 px-3.5 py-2 bg-slate-950/80 hover:bg-slate-900 border border-slate-800 rounded-xl text-slate-300 hover:text-white transition-colors text-xs font-mono font-bold"
        >
          {mobileDrawerOpen ? <X className="w-3.5 h-3.5 text-indigo-400" /> : <Menu className="w-3.5 h-3.5 text-indigo-400" />}
          <span>{mobileDrawerOpen ? "Masquer Panel" : "Voir Favoris / Alertes"}</span>
        </button>
      </div>

      {/* Content wrapper with Sidebar layout pattern */}
      <div className="flex flex-1 flex-col lg:flex-row max-w-[1780px] mx-auto w-full">
        
        {/* Left Sidebar (collapsible on mobile/tablet, persistent on lg/xl/2xl screens) */}
        <aside className={`${mobileDrawerOpen ? "flex" : "hidden lg:flex"} w-full lg:w-64 shrink-0 border-r border-slate-800 bg-slate-900/30 p-4 space-y-6 flex flex-col justify-between border-b lg:border-b-0`}>
          <div className="space-y-6">
            
            {/* navigation section */}
            <nav className="space-y-1">
              <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold px-2 mb-2 font-mono">
                {activeTheme === "bourse" ? "Actions Favorites" : activeTheme === "sicav" ? "SICAV Recommandées" : activeTheme === "crypto" ? "Crypto Vedettes" : "Paires de Devises"}
              </p>
              
              {activeTheme === "bourse" && (
                <>
                  <button
                    onClick={() => handleSelectAsset("AAPL", "Stock", 185.92)}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-xs rounded-lg border text-left transition-colors font-medium ${
                      selectedSymbol === "AAPL"
                        ? "bg-indigo-600/10 text-indigo-400 border-indigo-500/20"
                        : "text-slate-400 hover:text-white border-transparent hover:bg-slate-800/40"
                    }`}
                  >
                    <Activity className="w-3.5 h-3.5 text-indigo-400" />
                    <span>AAPL Terminal</span>
                  </button>
                  <button
                    onClick={() => handleSelectAsset("NVDA", "Stock", 912.40)}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-xs rounded-lg border text-left transition-colors font-medium ${
                      selectedSymbol === "NVDA"
                        ? "bg-indigo-600/10 text-indigo-400 border-indigo-500/20"
                        : "text-slate-400 hover:text-white border-transparent hover:bg-slate-800/40"
                    }`}
                  >
                    <Award className="w-3.5 h-3.5 text-indigo-400" />
                    <span>NVDA Terminal</span>
                  </button>
                </>
              )}

              {activeTheme === "sicav" && (
                <>
                  <button
                    onClick={() => handleSelectAsset("CARM-PAT", "SICAV", 625.40)}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-xs rounded-lg border text-left transition-colors font-medium ${
                      selectedSymbol === "CARM-PAT"
                        ? "bg-indigo-600/10 text-indigo-400 border-indigo-500/20"
                        : "text-slate-400 hover:text-white border-transparent hover:bg-slate-800/40"
                    }`}
                  >
                    <Landmark className="w-3.5 h-3.5 text-amber-500" />
                    <span>CARM-PAT Terminal</span>
                  </button>
                  <button
                    onClick={() => handleSelectAsset("AMUN-ACT", "SICAV", 248.15)}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-xs rounded-lg border text-left transition-colors font-medium ${
                      selectedSymbol === "AMUN-ACT"
                        ? "bg-indigo-600/10 text-indigo-400 border-indigo-500/20"
                        : "text-slate-400 hover:text-white border-transparent hover:bg-slate-800/40"
                    }`}
                  >
                    <Compass className="w-3.5 h-3.5 text-amber-500" />
                    <span>AMUN-ACT Terminal</span>
                  </button>
                </>
              )}

              {activeTheme === "crypto" && (
                <>
                  <button
                    onClick={() => handleSelectAsset("BTC", "Crypto", 68420.50)}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-xs rounded-lg border text-left transition-colors font-medium ${
                      selectedSymbol === "BTC"
                        ? "bg-indigo-600/10 text-indigo-400 border-indigo-500/20"
                        : "text-slate-400 hover:text-white border-transparent hover:bg-slate-800/40"
                    }`}
                  >
                    <svg className="w-3.5 h-3.5 text-indigo-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <span>BTC Terminal</span>
                  </button>
                </>
              )}

              {activeTheme === "devises" && (
                <>
                  <button
                    onClick={() => handleSelectAsset("EUR/USD", "Devise", 1.0854)}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-xs rounded-lg border text-left transition-colors font-medium ${
                      selectedSymbol === "EUR/USD"
                        ? "bg-indigo-600/10 text-indigo-400 border-indigo-500/20"
                        : "text-slate-400 hover:text-white border-transparent hover:bg-slate-800/40"
                    }`}
                  >
                    <Globe className="w-3.5 h-3.5 text-violet-400" />
                    <span>EUR/USD Terminal</span>
                  </button>
                  <button
                    onClick={() => handleSelectAsset("GBP/USD", "Devise", 1.2742)}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-xs rounded-lg border text-left transition-colors font-medium ${
                      selectedSymbol === "GBP/USD"
                        ? "bg-indigo-600/10 text-indigo-400 border-indigo-500/20"
                        : "text-slate-400 hover:text-white border-transparent hover:bg-slate-800/40"
                    }`}
                  >
                    <Globe className="w-3.5 h-3.5 text-violet-400" />
                    <span>GBP/USD Terminal</span>
                  </button>
                </>
              )}
            </nav>

            {/* sidebar alerts triggers list */}
            <div className="space-y-2">
              <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold px-2 mb-2 font-mono">Alertes Actives</p>
              <div className="space-y-1.5 max-h-[220px] overflow-y-auto">
                {alerts.map((al) => {
                  const isSicavAlert = al.assetType === "SICAV";
                  const currencyStr = isSicavAlert ? "€" : "$";
                  return (
                    <div key={al.id} className="p-2.5 bg-slate-900/60 rounded border border-slate-800 text-[11px] flex flex-col justify-between gap-1">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-white font-mono">{al.symbol}</span>
                        <span className={`text-[9px] px-1 rounded font-mono ${
                          al.triggered 
                            ? "bg-emerald-950 text-emerald-400" 
                            : "bg-indigo-950 text-indigo-400"
                        }`}>
                          {al.triggered ? "DÉCLENCHÉ" : al.condition === "ABOVE" ? "HAUSSE" : "BAISSE"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span>Cible: {al.targetPrice}{currencyStr}</span>
                        <button 
                          onClick={() => handleRemoveAlert(al.id)}
                          className="text-rose-455 hover:text-rose-400"
                          title="Annuler"
                        >
                          <Trash2 className="w-3 h-3 text-rose-500" />
                        </button>
                      </div>
                    </div>
                  );
                })}
                {alerts.length === 0 && (
                  <p className="text-slate-600 text-[10px] italic px-2">Aucun déclencheur planifié</p>
                )}
              </div>
            </div>

          </div>

          <div className="pt-4 mt-auto">
            <div className="bg-indigo-950/20 p-3.5 rounded-lg border border-indigo-500/10">
              <p className="text-[11px] font-bold text-indigo-300 font-display">Mode Quantitatif Actif</p>
              <p className="text-[9px] text-indigo-400/80 leading-relaxed mt-1">
                Les algorithmes de Gemini 3.5 Flash et les flux Alpha Vantage sont couplés pour l'analyse intraday.
              </p>
            </div>
          </div>
        </aside>

        {/* Main Content Pane */}
        <main className="flex-1 p-6 space-y-6 bg-slate-950">
          
          {/* Top statistics rows matching Professional Polish */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              id="stat-selected-asset"
              title={`Signal Alpha Vantage (${selectedSymbol})`}
              value={selectedAssetType === "SICAV" 
                ? `${currentSelectedPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })} €`
                : `$${currentSelectedPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
              }
              badgeText={`${selectedAssetType} Actif`}
              badgeColorClass="text-indigo-400"
              extraDetails={[
                { 
                  label: "Tendance 30j", 
                  value: candleHistory.length >= 2 && candleHistory[candleHistory.length - 1].close >= candleHistory[0].close 
                    ? "Haussière ▲" 
                    : "Baissière ▼",
                  colorClass: candleHistory.length >= 2 && candleHistory[candleHistory.length - 1].close >= candleHistory[0].close 
                    ? "text-emerald-400" 
                    : "text-rose-450" 
                },
                { 
                  label: "Volatilité", 
                  value: selectedAssetType === "Crypto" ? "Très Élevée" : selectedAssetType === "SICAV" ? "Basse (EUR)" : "Modérée (USD)",
                  colorClass: selectedAssetType === "Crypto" ? "text-pink-400" : "text-amber-400"
                },
                { 
                  label: "Liquidité", 
                  value: selectedAssetType === "Crypto" ? "Élevée (H24)" : selectedAssetType === "SICAV" ? "Traitement J+1" : "Excellente (Sess.)" 
                },
                { 
                  label: "Indicateur Clé", 
                  value: selectedAssetType === "SICAV" ? "ISIN Actif" : "Quant Intraday" 
                }
              ]}
            />

            <StatCard
              id="stat-dominance"
              title="Dominance Marché"
              value="52.1% BTC"
              badgeText="Crypto Leader"
              badgeColorClass="text-slate-400"
              extraDetails={[
                { label: "Ethereum (ETH)", value: "17.4%", colorClass: "text-indigo-300" },
                { label: "Solana (SOL)", value: "3.2%", colorClass: "text-teal-400" },
                { label: "Stablecoins", value: "5.8%", colorClass: "text-emerald-500" },
                { label: "Cap. Totale", value: "2.12T $", colorClass: "text-amber-400" }
              ]}
            />

            <StatCard
              id="stat-sentiment"
              title="Sentiment Global Actu"
              value="Constructif"
              customFooterElement={
                <div className="w-24 h-1.5 bg-slate-850 rounded-full overflow-hidden shrink-0 mt-1">
                  <div className="w-3/4 h-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                </div>
              }
              extraDetails={[
                { label: "Bullish ratio", value: "71%", colorClass: "text-emerald-400" },
                { label: "Confiance IA", value: "Élevée (88%)", colorClass: "text-indigo-400" },
                { label: "Flux analysés", value: "30 derniers" },
                { label: "Polarité", value: "Modérément positive" }
              ]}
            />
          </div>

          {/* Core Interactive modules grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Center trading elements: Chart & Decision Diagnostic */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Candlestick visualization */}
              <PriceChart
                symbol={selectedSymbol}
                history={candleHistory}
                loading={chartLoading}
                assetType={selectedAssetType}
                onAddAlert={handleAddAlert}
              />

              {/* Advanced Technical Analyses & Social community hype side-by-side inside high density grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <TechnicalIndicatorsWidget
                  symbol={selectedSymbol}
                  history={candleHistory}
                />
                <SocialSentimentWidget
                  symbol={selectedSymbol}
                />
              </div>

              {/* Expert Quantitative Advice Card */}
              <AIPositioningCard
                symbol={selectedSymbol}
                advice={advisorAdvice}
                loading={adviceLoading}
                onRefresh={handleRefreshAI}
                currentPrice={currentSelectedPrice}
              />

              {/* Default Call to Action to fetch Expert Diagnosis */}
              {!advisorAdvice && !adviceLoading && (
                <div id="ai-advisor-prompt" className="bg-indigo-950/15 border border-indigo-500/20 rounded-xl p-6 text-center space-y-4">
                  <div className="h-10 w-10 rounded-full bg-indigo-500/10 flex items-center justify-center mx-auto">
                    <Cpu className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div className="max-w-md mx-auto">
                    <h3 className="text-slate-200 font-display font-semibold text-sm">Générer Thèse d'Arbitrage par IA</h3>
                    <p className="text-slate-400 text-xs mt-1.5 leading-relaxed font-light">
                      L'intelligence artificielle QuantumAdvise compile l'historique et les indicateurs techniques pour {selectedSymbol} afin de synthétiser des seuils de support et ratios de performance.
                    </p>
                  </div>
                  <button
                    id="btn-trigger-ai-advisor"
                    onClick={handleRefreshAI}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-lg font-sans font-bold text-xs transition-colors tracking-wide shrink-0 shadow-md"
                  >
                    Générer les signaux de trading sur {selectedSymbol}
                  </button>
                </div>
              )}
            </div>

            {/* Right sidebars element: Simulator, Alerts, Listing selection, News */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Virtual Portfolio Simulator System */}
              <PortfolioSimulatorWidget
                selectedSymbol={selectedSymbol}
                currentPrice={currentSelectedPrice}
                selectedAssetType={selectedAssetType}
                historicAdvices={historicAdviceList}
                triggerToast={triggerToast}
              />

              <AlertNotificationSystem
                alerts={alerts}
                onAddAlert={handleAddAlert}
                onRemoveAlert={handleRemoveAlert}
                currentPrice={currentSelectedPrice}
                currentSymbol={selectedSymbol}
                assetType={selectedAssetType}
              />

              <MarketWatcher
                topGainers={topGainers}
                topLosers={topLosers}
                mostActives={mostActives}
                cryptos={cryptos}
                selectedSymbol={selectedSymbol}
                onSelectAsset={handleSelectAsset}
                loading={marketLoading}
                activeTheme={activeTheme}
              />

              <NewsFeedList
                news={news}
                loading={marketLoading}
                sourceApi={newsApiSource}
              />

              <GainsHistoricList
                history={historicAdviceList}
              />

            </div>

          </div>

        </main>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 p-6 text-center text-xs text-slate-500 space-y-2 mt-auto">
        <div className="flex flex-wrap items-center justify-center gap-4 text-slate-400 font-mono text-[9px] select-none">
          <div className="flex items-center space-x-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
            <span>CONNECTEURS COINGECKO & ALPHAVANTAGE : ACTIF</span>
          </div>
          <div className="flex items-center space-x-1.5 border-l border-slate-800 pl-4">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
            <span>MODÈLE DE DÉCISION GEMINI : DISPONIBLE</span>
          </div>
        </div>
        <p className="max-w-2xl mx-auto font-light leading-relaxed text-[10px] text-slate-500">
          Les signaux et analyses sont élaborés à titre d'initiation analytique. QuantumAdvise ne livre aucune incitation ou recommandation d'ordre d'achat ou de vente officielle sur valeurs boursières réelles.
        </p>
        <p className="text-[9px] text-slate-650 font-mono">
          © 2026 QuantumAdvise Terminal • Expert Trading Consultant
        </p>
      </footer>
    </div>
  );
}
