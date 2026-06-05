import React, { useState, useEffect } from "react";
import { MarketAsset, CryptoItem } from "../types";
import { TrendingUp, TrendingDown, Activity, Coins, Landmark, Globe } from "lucide-react";

interface MarketWatcherProps {
  topGainers: MarketAsset[];
  topLosers: MarketAsset[];
  mostActives: MarketAsset[];
  cryptos: CryptoItem[];
  selectedSymbol: string;
  onSelectAsset: (symbol: string, type: "Stock" | "Crypto" | "SICAV" | "Devise", price: number) => void;
  loading: boolean;
  activeTheme?: "bourse" | "sicav" | "crypto" | "devises";
}

export const MarketWatcher: React.FC<MarketWatcherProps> = ({
  topGainers,
  topLosers,
  mostActives,
  cryptos,
  selectedSymbol,
  onSelectAsset,
  loading,
  activeTheme = "bourse"
}) => {
  const [activeTab, setActiveTab] = useState<"gainers" | "losers" | "actives">("gainers");

  // Automatically reset active tab if switching theme and "actives" is not available
  useEffect(() => {
    if (activeTheme !== "bourse" && activeTab === "actives") {
      setActiveTab("gainers");
    }
  }, [activeTheme, activeTab]);

  // Static list of exactly 10 gainer SICAV funds
  const sicavGainers = [
    { ticker: "CARM-PAT", name: "Carmignac Patrimoine", isin: "FR0010135103", price: 625.40, change: 1.12, encours: "8.4B €" },
    { ticker: "AMUN-ACT", name: "Amundi Actions France", isin: "FR0000120153", price: 248.15, change: 0.65, encours: "1.2B €" },
    { ticker: "AXA-LCE", name: "AXA Large Cap Euro", isin: "FR0000120278", price: 189.20, change: 1.45, encours: "510M €" },
    { ticker: "SEXT-GL", name: "Sextant Grand Large", isin: "FR0010286021", price: 382.50, change: 0.28, encours: "740M €" },
    { ticker: "ECO-CHOI", name: "Ecofi Choix Solidaire", isin: "FR0010565432", price: 142.10, change: 0.95, encours: "310M €" },
    { ticker: "ODDO-AV", name: "Oddo Avenir Europe", isin: "FR0000974149", price: 312.40, change: 1.22, encours: "620M €" },
    { ticker: "ROTHS-CONVA", name: "R-co Conviction Club", isin: "FR0010541557", price: 540.80, change: 0.88, encours: "480M €" },
    { ticker: "DNCA-EVO", name: "DNCA Evolutif PEA", isin: "FR0010321828", price: 128.50, change: 0.74, encours: "290M €" },
    { ticker: "FID-EURO", name: "Fidelity Euro Choice", isin: "FR0010412356", price: 89.40, change: 0.52, encours: "1.1B €" },
    { ticker: "PAR-OPP", name: "BNP Paribas Opp France", isin: "FR0010141259", price: 215.30, change: 1.10, encours: "880M €" }
  ];

  // Static list of exactly 10 loser SICAV funds
  const sicavLosers = [
    { ticker: "LYX-CAC", name: "Lyxor CAC 40 ETF", isin: "FR0007052782", price: 78.90, change: -0.42, encours: "4.5B €" },
    { ticker: "AMUN-PEA", name: "Amundi ETF S&P 500 CC", isin: "FR0013412215", price: 45.20, change: -1.15, encours: "2.1B €" },
    { ticker: "LGF-TECH", name: "Lazard Giga Tech PEA", isin: "FR0010851212", price: 422.10, change: -1.92, encours: "350M €" },
    { ticker: "ROTHS-PAT", name: "R-co Patrimoine Eq", isin: "FR0011245645", price: 185.40, change: -0.25, encours: "190M €" },
    { ticker: "SEXT-PME", name: "Sextant PME France", isin: "FR0011421356", price: 195.60, change: -0.82, encours: "210M €" },
    { ticker: "ODDO-ACT", name: "Oddo Act. Small Cap", isin: "FR0010555621", price: 282.10, change: -0.68, encours: "120M €" },
    { ticker: "LYX-EM", name: "Lyxor MSCI Emerging", isin: "FR0010429004", price: 18.40, change: -1.24, encours: "1.4B €" },
    { ticker: "ECL-VALUE", name: "Eclectis Growth", isin: "FR0011005612", price: 340.50, change: -0.90, encours: "85M €" },
    { ticker: "PLU-FR", name: "Pluvalca France Act.", isin: "FR0010729731", price: 204.30, change: -0.55, encours: "140M €" },
    { ticker: "DNCA-OP", name: "DNCA Euro Opportunité", isin: "FR0010998741", price: 115.60, change: -0.72, encours: "670M €" }
  ];

  // Static list of exactly 10 gainer Cryptocurrencies 
  const cryptoGainers = [
    { id: "bitcoin", name: "Bitcoin", symbol: "btc", current_price: 68420.50, price_change_percentage_24h: 1.84, market_cap: 1345102941000 },
    { id: "ethereum", name: "Ethereum", symbol: "eth", current_price: 3842.10, price_change_percentage_24h: 2.15, market_cap: 462102948000 },
    { id: "solana", name: "Solana", symbol: "sol", current_price: 168.45, price_change_percentage_24h: 4.81, market_cap: 75430291000 },
    { id: "chainlink", name: "Chainlink", symbol: "link", current_price: 18.52, price_change_percentage_24h: 3.12, market_cap: 10850294000 },
    { id: "litecoin", name: "Litecoin", symbol: "ltc", current_price: 82.40, price_change_percentage_24h: 1.52, market_cap: 6102948000 },
    { id: "avalanche", name: "Avalanche", symbol: "avax", current_price: 36.80, price_change_percentage_24h: 5.24, market_cap: 14502918000 },
    { id: "polkadot", name: "Polkadot", symbol: "dot", current_price: 6.85, price_change_percentage_24h: 2.32, market_cap: 9812490000 },
    { id: "near", name: "Near Protocol", symbol: "near", current_price: 7.12, price_change_percentage_24h: 6.45, market_cap: 7654210000 },
    { id: "render", name: "Render Token", symbol: "rndr", current_price: 10.25, price_change_percentage_24h: 8.12, market_cap: 3951200000 },
    { id: "fantom", name: "Fantom", symbol: "ftm", current_price: 0.852, price_change_percentage_24h: 4.95, market_cap: 2410290000 }
  ];

  // Static list of exactly 10 loser Cryptocurrencies
  const cryptoLosers = [
    { id: "ripple", name: "Ripple", symbol: "xrp", current_price: 0.524, price_change_percentage_24h: -1.20, market_cap: 29102948000 },
    { id: "cardano", name: "Cardano", symbol: "ada", current_price: 0.458, price_change_percentage_24h: -0.42, market_cap: 16320194000 },
    { id: "dogecoin", name: "Dogecoin", symbol: "doge", current_price: 0.145, price_change_percentage_24h: -2.85, market_cap: 21029482000 },
    { id: "shiba-inu", name: "Shiba Inu", symbol: "shib", current_price: 0.0000215, price_change_percentage_24h: -3.10, market_cap: 12643019000 },
    { id: "toncoin", name: "Toncoin", symbol: "ton", current_price: 7.25, price_change_percentage_24h: -2.15, market_cap: 18210940000 },
    { id: "bitcoin-cash", name: "Bitcoin Cash", symbol: "bch", current_price: 482.10, price_change_percentage_24h: -0.95, market_cap: 9543018000 },
    { id: "polygon", name: "Polygon", symbol: "matic", current_price: 0.685, price_change_percentage_24h: -1.88, market_cap: 6732019400 },
    { id: "dogwifhat", name: "dogwifhat", symbol: "wif", current_price: 2.85, price_change_percentage_24h: -5.12, market_cap: 2850124000 },
    { id: "pepe", name: "Pepe Coin", symbol: "pepe", current_price: 0.0000125, price_change_percentage_24h: -4.85, market_cap: 5241029400 },
    { id: "stellar", name: "Stellar", symbol: "xlm", current_price: 0.108, price_change_percentage_24h: -0.85, market_cap: 3120194000 }
  ];

  // Static list of exactly 10 gainer Devises (Forex pairs)
  const forexGainers = [
    { ticker: "EUR/USD", name: "Euro / US Dollar", price: 1.0854, change: 0.12, ask: 1.0856 },
    { ticker: "GBP/USD", name: "British Pound / Dollar", price: 1.2742, change: 0.22, ask: 1.2744 },
    { ticker: "USD/JPY", name: "US Dollar / Japanese Yen", price: 156.32, change: 0.45, ask: 156.34 },
    { ticker: "AUD/USD", name: "Australian Dollar / Dollar", price: 0.6654, change: 0.18, ask: 0.6656 },
    { ticker: "GBP/JPY", name: "British Pound / Yen", price: 199.12, change: 0.67, ask: 199.15 },
    { ticker: "EUR/JPY", name: "Euro / Japanese Yen", price: 169.65, change: 0.57, ask: 169.68 },
    { ticker: "EUR/CHF", name: "Euro / Swiss Franc", price: 0.9742, change: 0.08, ask: 0.9744 },
    { ticker: "GBP/CHF", name: "British Pound / Franc", price: 1.1450, change: 0.15, ask: 1.1453 },
    { ticker: "CAD/JPY", name: "Canadian Dollar / Yen", price: 114.78, change: 0.28, ask: 114.81 },
    { ticker: "CHF/JPY", name: "Swiss Franc / Japanese Yen", price: 174.02, change: 0.32, ask: 174.05 }
  ];

  // Static list of exactly 10 loser Devises (Forex pairs)
  const forexLosers = [
    { ticker: "USD/CAD", name: "US Dollar / Canadian Dollar", price: 1.3621, change: -0.15, ask: 1.3623 },
    { ticker: "USD/CHF", name: "US Dollar / Swiss Franc", price: 0.8985, change: -0.22, ask: 0.8987 },
    { ticker: "EUR/GBP", name: "Euro / British Pound", price: 0.8512, change: -0.10, ask: 0.8514 },
    { ticker: "NZD/USD", name: "New Zealand Dollar / Dollar", price: 0.6125, change: -0.08, ask: 0.6127 },
    { ticker: "AUD/JPY", name: "Australian Dollar / Yen", price: 103.88, change: -0.25, ask: 103.91 },
    { ticker: "EUR/CAD", name: "Euro / Canadian Dollar", price: 1.4785, change: -0.05, ask: 1.4788 },
    { ticker: "NZD/JPY", name: "New Zealand Dollar / Yen", price: 95.68, change: -0.18, ask: 95.71 },
    { ticker: "GBP/CAD", name: "British Pound / Canadian Dollar", price: 1.7375, change: -0.07, ask: 1.7378 },
    { ticker: "USD/SGD", name: "US Dollar / Singapore Dollar", price: 1.3482, change: -0.12, ask: 1.3484 },
    { ticker: "EUR/AUD", name: "Euro / Australian Dollar", price: 1.6310, change: -0.08, ask: 1.6314 }
  ];

  // Align stock lists with fallback/live values and ensure they have exactly 10 items
  const renderStockList = (isGainerTab: boolean, isMomentTab: boolean) => {
    let assets = isMomentTab ? mostActives : (isGainerTab ? topGainers : topLosers);
    
    // In case API fails/limits, complete to 10 items using structured simulation
    if (assets.length < 10) {
      const fallbackList = isMomentTab 
        ? [
            { ticker: "NVDA", price: "912.40", change_amount: "24.15", change_percentage: "2.72%", volume: "41029100" },
            { ticker: "TSLA", price: "179.24", change_amount: "4.12", change_percentage: "2.35%", volume: "62381200" },
            { ticker: "AAPL", price: "185.92", change_amount: "5.42", change_percentage: "3.01%", volume: "52430100" },
            { ticker: "AMD", price: "168.90", change_amount: "2.10", change_percentage: "1.26%", volume: "31402900" },
            { ticker: "MSFT", price: "415.50", change_amount: "6.80", change_percentage: "1.66%", volume: "22340100" },
            { ticker: "ARM", price: "122.50", change_amount: "4.05", change_percentage: "3.42%", volume: "15421000" },
            { ticker: "NFLX", price: "598.15", change_amount: "-18.40", change_percentage: "-2.98%", volume: "4210900" },
            { ticker: "COIN", price: "218.40", change_amount: "-10.58", change_percentage: "-4.62%", volume: "8412000" },
            { ticker: "META", price: "472.18", change_amount: "-9.32", change_percentage: "-1.94%", volume: "13910200" },
            { ticker: "AMZN", price: "174.42", change_amount: "1.98", change_percentage: "1.15%", volume: "29432100" }
          ]
        : (isGainerTab 
            ? [
                { ticker: "AAPL", price: "185.92", change_amount: "5.42", change_percentage: "3.01%", volume: "52430100" },
                { ticker: "NVDA", price: "912.40", change_amount: "24.15", change_percentage: "2.72%", volume: "41029100" },
                { ticker: "TSLA", price: "179.24", change_amount: "4.12", change_percentage: "2.35%", volume: "62381200" },
                { ticker: "MSFT", price: "415.50", change_amount: "6.80", change_percentage: "1.66%", volume: "22340100" },
                { ticker: "AMD", price: "168.90", change_amount: "2.10", change_percentage: "1.26%", volume: "31402900" },
                { ticker: "AVGO", price: "1395.10", change_amount: "29.40", change_percentage: "2.15%", volume: "3029400" },
                { ticker: "QCOM", price: "202.40", change_amount: "3.92", change_percentage: "1.98%", volume: "7841000" },
                { ticker: "ARM", price: "122.50", change_amount: "4.05", change_percentage: "3.42%", volume: "15421000" },
                { ticker: "AMZN", price: "174.42", change_amount: "1.98", change_percentage: "1.15%", volume: "29432100" },
                { ticker: "INTC", price: "30.15", change_amount: "0.25", change_percentage: "0.85%", volume: "48150200" }
              ] 
            : [
                { ticker: "NFLX", price: "598.15", change_amount: "-18.40", change_percentage: "-2.98%", volume: "4210900" },
                { ticker: "META", price: "472.18", change_amount: "-9.32", change_percentage: "-1.94%", volume: "13910200" },
                { ticker: "GOOGL", price: "166.50", change_amount: "-2.10", change_percentage: "-1.24%", volume: "19320100" },
                { ticker: "BABA", price: "72.40", change_amount: "-0.95", change_percentage: "-1.30%", volume: "10245000" },
                { ticker: "PYPL", price: "61.20", change_amount: "-1.13", change_percentage: "-1.82%", volume: "6240200" },
                { ticker: "SBUX", price: "78.50", change_amount: "-1.68", change_percentage: "-2.10%", volume: "5120400" },
                { ticker: "COIN", price: "218.40", change_amount: "-10.58", change_percentage: "-4.62%", volume: "8412000" },
                { ticker: "SNAP", price: "11.20", change_amount: "-0.36", change_percentage: "-3.15%", volume: "22104000" },
                { ticker: "TSMC", price: "142.50", change_amount: "-2.54", change_percentage: "-1.75%", volume: "11400200" },
                { ticker: "JPM", price: "192.40", change_amount: "-1.78", change_percentage: "-0.92%", volume: "9512000" }
              ]);
      assets = fallbackList;
    }

    return (
      <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1">
        {assets.map((asset) => {
          const isGainer = parseFloat(asset.change_percentage) >= 0;
          const isSelected = selectedSymbol === asset.ticker;
          return (
            <div
              id={`market-asset-${asset.ticker}`}
              key={asset.ticker}
              onClick={() => onSelectAsset(asset.ticker, "Stock", parseFloat(asset.price))}
              className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition-all duration-150 ${
                isSelected 
                  ? "bg-indigo-600/10 border-indigo-500/40 shadow-sm animate-pulse-subtle" 
                  : "bg-slate-900 border-slate-800/80 hover:border-slate-700"
              }`}
            >
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="text-white font-bold text-xs tracking-tight">{asset.ticker}</span>
                  {isSelected && (
                    <span className="text-[8px] bg-indigo-500 text-white font-bold px-1 rounded uppercase tracking-wider font-mono">Focus</span>
                  )}
                </div>
                <span className="text-[9px] text-slate-550 font-mono">Vol: {(parseInt(asset.volume) / 1000000).toFixed(1)}M</span>
              </div>

              <div className="text-right font-mono">
                <span className="block text-slate-100 font-bold text-xs">${parseFloat(asset.price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                <span className={`inline-flex items-center text-[10px] font-bold ${isGainer ? "text-emerald-400" : "text-rose-400"}`}>
                  {isGainer ? "▲" : "▼"} {asset.change_percentage}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderSicavList = (isGainerTab: boolean) => {
    const list = isGainerTab ? sicavGainers : sicavLosers;
    return (
      <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1 animate-fadeIn">
        {list.map((fund) => {
          const isGainer = fund.change >= 0;
          const isSelected = selectedSymbol === fund.ticker;
          return (
            <div
              id={`market-sicav-${fund.ticker}`}
              key={fund.ticker}
              onClick={() => onSelectAsset(fund.ticker, "SICAV", fund.price)}
              className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition-all duration-150 ${
                isSelected 
                  ? "bg-amber-600/10 border-amber-500/40 shadow-sm" 
                  : "bg-slate-900 border-slate-800/80 hover:border-slate-700"
              }`}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center space-x-1.5">
                  <span className="text-white font-bold text-xs tracking-tight shrink-0">{fund.ticker}</span>
                  {isSelected && (
                    <span className="text-[8px] bg-amber-500 text-slate-950 font-bold px-1 rounded uppercase tracking-wider font-mono">ACTIF</span>
                  )}
                </div>
                <div className="text-[9px] text-slate-400 truncate max-w-[140px]">{fund.name}</div>
                <div className="text-[8px] text-slate-500 font-mono leading-none mt-0.5">ISIN: {fund.isin} • Encours: {fund.encours}</div>
              </div>

              <div className="text-right shrink-0 font-mono">
                <span className="block text-slate-100 font-bold text-xs">
                  {fund.price.toLocaleString(undefined, { minimumFractionDigits: 2 })} €
                </span>
                <span className={`inline-flex items-center text-[10px] font-bold ${isGainer ? "text-emerald-400" : "text-rose-400"}`}>
                  {isGainer ? `▲ +${fund.change}%` : `▼ ${fund.change}%`}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderCryptoList = (isGainerTab: boolean) => {
    const list = isGainerTab ? cryptoGainers : cryptoLosers;
    return (
      <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1">
        {list.map((coin) => {
          const isGainer = coin.price_change_percentage_24h >= 0;
          const isSelected = selectedSymbol === coin.symbol.toUpperCase();
          return (
            <div
              id={`market-crypto-${coin.id}`}
              key={coin.id}
              onClick={() => onSelectAsset(coin.symbol.toUpperCase(), "Crypto", coin.current_price)}
              className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition-all duration-150 ${
                isSelected 
                  ? "bg-teal-600/10 border-teal-500/40 shadow-sm" 
                  : "bg-slate-900 border-slate-800/80 hover:border-slate-700"
              }`}
            >
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="text-white font-bold text-xs uppercase tracking-tight">{coin.symbol}</span>
                  <span className="text-[9px] text-slate-400 truncate max-w-[80px]">{coin.name}</span>
                </div>
                <span className="text-[9px] text-slate-500 font-mono">Cap: ${(coin.market_cap / 1000000000).toFixed(1)}B</span>
              </div>

              <div className="text-right font-mono">
                <span className="block text-slate-100 font-bold text-xs">
                  ${coin.current_price.toLocaleString(undefined, { minimumFractionDigits: coin.current_price < 1 ? 4 : 2 })}
                </span>
                <span className={`inline-flex items-center text-[10px] font-bold ${isGainer ? "text-emerald-400" : "text-rose-400"}`}>
                  {isGainer ? "▲" : "▼"} {coin.price_change_percentage_24h.toFixed(2)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderForexList = (isGainerTab: boolean) => {
    const list = isGainerTab ? forexGainers : forexLosers;
    return (
      <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1 animate-fadeIn">
        {list.map((fx) => {
          const isGainer = fx.change >= 0;
          const isSelected = selectedSymbol === fx.ticker;
          return (
            <div
              id={`market-forex-${fx.ticker.replace("/", "-")}`}
              key={fx.ticker}
              onClick={() => onSelectAsset(fx.ticker, "Devise", fx.price)}
              className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition-all duration-150 ${
                isSelected 
                  ? "bg-violet-600/10 border-violet-500/40 shadow-sm" 
                  : "bg-slate-900 border-slate-800/80 hover:border-slate-700"
              }`}
            >
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="text-white font-bold text-xs tracking-tight">{fx.ticker}</span>
                  {isSelected && (
                    <span className="text-[8px] bg-violet-500 text-white font-bold px-1 rounded uppercase tracking-wider font-mono">LIVE</span>
                  )}
                </div>
                <div className="text-[9px] text-slate-400 truncate max-w-[130px]">{fx.name}</div>
              </div>

              <div className="text-right font-mono">
                <span className="block text-slate-100 font-bold text-xs">
                  {fx.price.toFixed(4)}
                </span>
                <span className={`inline-flex items-center text-[10px] font-bold ${isGainer ? "text-emerald-400" : "text-rose-400"}`}>
                  {isGainer ? `▲ +${fx.change}%` : `▼ ${fx.change}%`}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div id="market-watcher-card" className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4 shadow-xl">
      {/* Dynamic Header Badge and Category Label */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {activeTheme === "bourse" && (
            <>
              <Activity className="w-4 h-4 text-indigo-400 animate-pulse" />
              <h3 className="text-slate-100 font-display font-semibold text-xs uppercase tracking-wider">Valeurs boursières</h3>
            </>
          )}
          {activeTheme === "sicav" && (
            <>
              <Landmark className="w-4 h-4 text-amber-400" />
              <h3 className="text-slate-100 font-display font-semibold text-xs uppercase tracking-wider">SICAV Françaises</h3>
            </>
          )}
          {activeTheme === "crypto" && (
            <>
              <Coins className="w-4 h-4 text-teal-400" />
              <h3 className="text-slate-100 font-display font-semibold text-xs uppercase tracking-wider">Crypto-monnaies</h3>
            </>
          )}
          {activeTheme === "devises" && (
            <>
              <Globe className="w-4 h-4 text-violet-400" />
              <h3 className="text-slate-100 font-display font-semibold text-xs uppercase tracking-wider">Marché des Devises (FX)</h3>
            </>
          )}
        </div>
        <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest font-bold">10 actifs / onglet</span>
      </div>

      {/* Tabs Selector Navigation. Bourse has 3 tabs, other themes have 2 tabs */}
      <div className="grid grid-cols-3 gap-1 bg-slate-950/60 p-0.5 rounded-lg border border-slate-850 text-[10px] font-mono text-center select-none">
        <button
          id="tab-gainers"
          onClick={() => setActiveTab("gainers")}
          className={`py-1.5 px-1 rounded transition-colors ${
            activeTab === "gainers" ? "bg-emerald-950/40 text-emerald-400 font-bold border border-emerald-500/10" : "text-slate-400 hover:text-slate-350"
          }`}
        >
          <span>▲ Hausse</span>
        </button>
        <button
          id="tab-losers"
          onClick={() => setActiveTab("losers")}
          className={`py-1.5 px-1 rounded transition-colors ${
            activeTab === "losers" ? "bg-rose-950/40 text-rose-450 font-bold border border-rose-500/10" : "text-slate-400 hover:text-slate-350"
          }`}
        >
          <span>▼ Baisse</span>
        </button>
        
        {activeTheme === "bourse" ? (
          <button
            id="tab-actives"
            onClick={() => setActiveTab("actives")}
            className={`py-1.5 px-1 rounded transition-colors ${
              activeTab === "actives" ? "bg-indigo-950/40 text-indigo-400 font-bold border border-indigo-500/10" : "text-slate-400 hover:text-slate-350"
            }`}
          >
            <span>⚡ Actives</span>
          </button>
        ) : (
          <div className="py-1.5 px-1 rounded text-slate-700 cursor-not-allowed text-[8px] flex items-center justify-center font-bold font-mono">
            N/A
          </div>
        )}
      </div>

      {/* Listings rendered dynamically based on active category and active filter tab */}
      <div>
        {loading ? (
          <div className="space-y-2 animate-pulse">
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="h-11 bg-slate-950/50 rounded-lg border border-slate-900" />
            ))}
          </div>
        ) : (
          <>
            {activeTheme === "bourse" && (
              <>
                {activeTab === "gainers" && renderStockList(true, false)}
                {activeTab === "losers" && renderStockList(false, false)}
                {activeTab === "actives" && renderStockList(false, true)}
              </>
            )}
            {activeTheme === "sicav" && (
              <>
                {activeTab === "gainers" && renderSicavList(true)}
                {activeTab === "losers" && renderSicavList(false)}
              </>
            )}
            {activeTheme === "crypto" && (
              <>
                {activeTab === "gainers" && renderCryptoList(true)}
                {activeTab === "losers" && renderCryptoList(false)}
              </>
            )}
            {activeTheme === "devises" && (
              <>
                {activeTab === "gainers" && renderForexList(true)}
                {activeTab === "losers" && renderForexList(false)}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};
