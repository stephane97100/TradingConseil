import React, { useState, useEffect, useRef, useMemo } from "react";
import * as d3 from "d3";
import { Activity, Sparkles, AlertCircle, TrendingUp, RefreshCw, BarChart2 } from "lucide-react";
import { motion } from "motion/react";

interface CorrelationPoint {
  date: string;
  sp500Price: number;
  assetPrice: number;
  sp500Return: number;
  assetReturn: number;
}

interface CorrelationData {
  symbol: string;
  correlationCoefficient: number;
  rSquared: number;
  beta: number;
  alpha: number;
  meanSP500Return: number;
  meanAssetReturn: number;
  volatilitySP500Ann: number;
  volatilityAssetAnn: number;
  points: CorrelationPoint[];
}

interface CorrelationWidgetProps {
  symbol: string;
}

export function CorrelationWidget({ symbol }: CorrelationWidgetProps) {
  const [data, setData] = useState<CorrelationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRegression, setShowRegression] = useState(true);
  
  const widthRatio = 0.65;
  const [dimensions, setDimensions] = useState({ width: 500, height: 320 });

  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Measure and handle responsive resize
  useEffect(() => {
    if (!containerRef.current) return;
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width } = entry.contentRect;
        setDimensions({
          width: Math.max(width, 280),
          height: Math.min(Math.max(width * widthRatio, 240), 340)
        });
      }
    });
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // Fetch correlation data
  const fetchCorrelation = () => {
    setLoading(true);
    setError(null);
    fetch(`/api/correlation-data?symbol=${symbol}&days=90`)
      .then((res) => {
        if (!res.ok) throw new Error("Impossible de charger les indicateurs de corrélation.");
        return res.json();
      })
      .then((json) => {
        setData(json);
      })
      .catch((err) => {
        console.error("Error loading correlation data:", err);
        setError(err.message || "Erreur de chargement");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCorrelation();
  }, [symbol]);

  // Draw chart in SVG with D3
  useEffect(() => {
    if (!data || !svgRef.current || !data.points || data.points.length === 0) return;

    // Clear previous drawing
    const svgEl = d3.select(svgRef.current);
    svgEl.selectAll("*").remove();

    const margin = { top: 25, right: 30, bottom: 40, left: 50 };
    const width = dimensions.width - margin.left - margin.right;
    const height = dimensions.height - margin.top - margin.bottom;

    // Select SVG and append translation group
    const svg = svgEl
      .attr("width", dimensions.width)
      .attr("height", dimensions.height);

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Symmetrical domains around 0 for clear quantitative interpretation
    const maxAsset = d3.max(data.points, (d: CorrelationPoint) => Math.abs(d.assetReturn)) || 2;
    const maxSP = d3.max(data.points, (d: CorrelationPoint) => Math.abs(d.sp500Return)) || 1.5;
    
    // Add 15% padding
    const padAsset = Math.max(maxAsset * 1.15, 1.0);
    const padSP = Math.max(maxSP * 1.15, 1.0);

    const xScale = d3.scaleLinear()
      .domain([-padSP, padSP])
      .range([0, width]);

    const yScale = d3.scaleLinear()
      .domain([-padAsset, padAsset])
      .range([height, 0]);

    // Draw grid lines
    const makeXGridlines = () => d3.axisBottom(xScale).ticks(5);
    const makeYGridlines = () => d3.axisLeft(yScale).ticks(5);

    g.append("g")
      .attr("class", "grid text-slate-800/10")
      .attr("transform", `translate(0, ${height})`)
      .call(makeXGridlines().tickSize(-height).tickFormat(() => ""))
      .select(".domain").remove();

    g.append("g")
      .attr("class", "grid text-slate-800/10")
      .call(makeYGridlines().tickSize(-width).tickFormat(() => ""))
      .select(".domain").remove();

    // CENTRAL AXES (X = 0, Y = 0 reference lines)
    g.append("line")
      .attr("x1", xScale(0))
      .attr("y1", 0)
      .attr("x2", xScale(0))
      .attr("y2", height)
      .attr("stroke", "#334155")
      .attr("stroke-width", 1.5)
      .attr("stroke-opacity", 0.6)
      .attr("stroke-dasharray", "3,3");

    g.append("line")
      .attr("x1", 0)
      .attr("y1", yScale(0))
      .attr("x2", width)
      .attr("y2", yScale(0))
      .attr("stroke", "#334155")
      .attr("stroke-width", 1.5)
      .attr("stroke-opacity", 0.6)
      .attr("stroke-dasharray", "3,3");

    // X Axis
    g.append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(xScale).ticks(5).tickFormat(d => `${d}%`))
      .attr("color", "#1e293b")
      .selectAll("text")
      .attr("fill", "#64748b")
      .attr("font-size", "9px")
      .attr("font-family", "JetBrains Mono");

    // Y Axis
    g.append("g")
      .call(d3.axisLeft(yScale).ticks(5).tickFormat(d => `${d}%`))
      .attr("color", "#1e293b")
      .selectAll("text")
      .attr("fill", "#64748b")
      .attr("font-size", "9px")
      .attr("font-family", "JetBrains Mono");

    // X axis label
    g.append("text")
      .attr("x", width / 2)
      .attr("y", height + 32)
      .attr("text-anchor", "middle")
      .attr("fill", "#475569")
      .attr("font-size", "10px")
      .attr("font-family", "Inter")
      .attr("font-weight", "500")
      .text("Rendement Quotidien S&P 500");

    // Y axis label
    g.append("text")
      .attr("x", -height / 2)
      .attr("y", -38)
      .attr("transform", "rotate(-90)")
      .attr("text-anchor", "middle")
      .attr("fill", "#475569")
      .attr("font-size", "10px")
      .attr("font-family", "Inter")
      .attr("font-weight", "500")
      .text(`Rendement Quotidien ${symbol}`);

    // Linear Regression Line
    if (showRegression) {
      const x1 = -padSP;
      const y1 = data.beta * x1 + data.alpha;
      const x2 = padSP;
      const y2 = data.beta * x2 + data.alpha;

      g.append("line")
        .attr("x1", xScale(x1))
        .attr("y1", yScale(y1))
        .attr("x2", xScale(x2))
        .attr("y2", yScale(y2))
        .attr("stroke", "#6366f1")
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "4,4")
        .attr("stroke-opacity", 0.95);
    }

    // Interactive custom tooltip reference
    const tooltip = d3.select(tooltipRef.current);

    // Plot scatter circles
    g.selectAll("circle")
      .data(data.points)
      .enter()
      .append("circle")
      .attr("cx", (d: any) => xScale(d.sp500Return))
      .attr("cy", (d: any) => yScale(d.assetReturn))
      .attr("r", 5)
      .attr("fill", (d: any) => {
        const spUp = d.sp500Return >= 0;
        const assetUp = d.assetReturn >= 0;
        if (spUp && assetUp) return "#10b981"; // positive sync (quadrant 1)
        if (!spUp && !assetUp) return "#38bdf8"; // negative sync (quadrant 3)
        return "#f43f5e"; // divergent (quadrants 2 & 4)
      })
      .attr("fill-opacity", 0.72)
      .attr("stroke", "#020617")
      .attr("stroke-width", 1)
      .attr("class", "transition-all duration-150 cursor-pointer")
      .on("mouseover", (event, d: any) => {
        d3.select(event.currentTarget)
          .attr("r", 8)
          .attr("fill-opacity", 1.0)
          .attr("stroke", "#ffffff")
          .attr("stroke-width", 1.5)
          .style("filter", "drop-shadow(0 0 4px rgba(99,102,241,0.5))");

        tooltip.style("opacity", 1)
          .html(`
            <div className="space-y-1 font-mono text-[11px]">
              <div className="text-slate-500 font-bold border-b border-slate-800 pb-0.5 mb-1">${d.date.split("-").reverse().join("/")}</div>
              <div className="flex justify-between gap-3">
                <span className="text-slate-400">S&P 500 :</span>
                <span className="font-bold ${d.sp500Return >= 0 ? "text-emerald-400" : "text-rose-400"}">${d.sp500Return >= 0 ? "+" : ""}${d.sp500Return.toFixed(2)}%</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-slate-400">${symbol} :</span>
                <span className="font-bold ${d.assetReturn >= 0 ? "text-emerald-400" : "text-rose-400"}">${d.assetReturn >= 0 ? "+" : ""}${d.assetReturn.toFixed(2)}%</span>
              </div>
            </div>
          `);
      })
      .on("mousemove", (event) => {
        if (!containerRef.current) return;
        const bounds = containerRef.current.getBoundingClientRect();
        const x = event.clientX - bounds.left + 15;
        const y = event.clientY - bounds.top - 60;
        tooltip.style("left", `${x}px`).style("top", `${y}px`);
      })
      .on("mouseout", (event) => {
        d3.select(event.currentTarget)
          .attr("r", 5)
          .attr("fill-opacity", 0.72)
          .attr("stroke", "#020617")
          .attr("stroke-width", 1)
          .style("filter", null);
        tooltip.style("opacity", 0);
      });

  }, [data, dimensions, showRegression, symbol]);

  // Qualitative diagnostics based on actual returns math
  const diagnostics = useMemo(() => {
    if (!data) return null;
    const r = data.correlationCoefficient;
    const beta = data.beta;
    
    let correlationText = "Décorrélation";
    let correlationColor = "text-slate-400 bg-slate-500/10 border-slate-500/20";
    let explanation = "";

    if (r >= 0.65) {
      correlationText = "Forte Corrélation Positive";
      correlationColor = "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
      explanation = `L'actif évolue de concert avec la bourse américaine. C'est un jeu sur le marché général (Beta Play).`;
    } else if (r >= 0.35) {
      correlationText = "Corrélation Positive Modérée";
      correlationColor = "text-indigo-400 bg-indigo-500/10 border-indigo-500/20";
      explanation = `L'indice influence en partie la tendance, mais l'actif dispose de leviers de croissance propres substantiels.`;
    } else if (r >= -0.15 && r < 0.35) {
      correlationText = "Comportement Autonome / Neutre";
      correlationColor = "text-sky-400 bg-sky-500/10 border-sky-500/20";
      explanation = `Diversification technique idéale. L'actif est décorrélé du S&P 500, parfait pour immuniser un portefeuille boursier.`;
    } else {
      correlationText = "Corrélation Inverse (Hedge)";
      correlationColor = "text-amber-400 bg-amber-500/10 border-amber-500/20";
      explanation = `L'actif sert de couverture. Il grimpe statistiquement quand l'indice S&P 500 replie.`;
    }

    let betaText = "Sensibilité standard";
    let betaDesc = "";
    if (beta > 1.25) {
      betaText = "Risque Systématique Élevé (High Beta)";
      betaDesc = `Une hausse ou baisse de 1% du S&P 500 se traduit par environ ${beta.toFixed(2)}% sur ${symbol}. Amplifie les mouvements du marché.`;
    } else if (beta >= 0.75 && beta <= 1.25) {
      betaText = "Sensibilité Neutre (Co-mouvement)";
      betaDesc = `Suit fidèlement la respiration boursière générale. Un bêta de ${beta.toFixed(2)} indique un comportement proche de la moyenne globale.`;
    } else if (beta > 0.1 && beta < 0.75) {
      betaText = "Actif Défensif (Low Beta)";
      betaDesc = `Très peu sensible aux secousses du marché général sauvage. Un bêta amorti de ${beta.toFixed(2)} protège en période de retournement boursier.`;
    } else {
      betaText = "Sans Bêta / Insensible";
      betaDesc = `Fluctue sur ses propres facteurs spécifiques ou devises sans être canalisé par le S&P 500 (Bêta : ${beta.toFixed(2)}).`;
    }

    return {
      correlationText,
      correlationColor,
      explanation,
      betaText,
      betaDesc
    };
  }, [data, symbol]);

  if (loading) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 h-[410px] flex items-center justify-center animate-pulse">
        <div className="text-center space-y-2.5">
          <Activity className="w-6 h-6 text-indigo-400 animate-spin mx-auto" />
          <p className="text-xs text-slate-400 font-mono">Analyse de corrélation D3 avec S&P 500...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 h-[410px] flex flex-col items-center justify-center space-y-3">
        <AlertCircle className="w-8 h-8 text-rose-500" />
        <p className="text-xs text-slate-300 font-mono text-center">Échec du calcul quantitatif de corrélation.</p>
        <button
          onClick={fetchCorrelation}
          className="bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-400 border border-indigo-505/15 text-[11px] font-bold px-3 py-1.5 rounded transition-colors"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4"
    >
      {/* Top Title Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
            <h3 className="text-slate-100 font-display font-bold text-sm select-none">
              Corrélation S&P 500 <span className="text-indigo-400">D3.js Visualizer</span>
            </h3>
          </div>
          <p className="text-[10px] text-slate-500 font-mono uppercase mt-0.5 tracking-wider">
            Écart de rendement quotidien — 90 derniers jours
          </p>
        </div>

        {/* Dynamic controls */}
        <div className="flex items-center gap-2">
          <label className="flex items-center space-x-1.5 cursor-pointer text-[10px] font-mono select-none text-slate-400 hover:text-slate-200 transition-colors">
            <input
              type="checkbox"
              checked={showRegression}
              onChange={(e) => setShowRegression(e.target.checked)}
              className="w-3.5 h-3.5 rounded border-slate-800 bg-slate-950 text-indigo-600 focus:ring-indigo-500 focus:ring-1 cursor-pointer"
            />
            <span>Régression Linéaire</span>
          </label>
          
          <button
            onClick={fetchCorrelation}
            className="p-1 hover:bg-slate-800 rounded text-slate-500 hover:text-slate-200 transition-colors"
            title="Actualiser la corrélation"
          >
            <RefreshCw className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Advanced Statistical Metrics Panel */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono bg-slate-950/45 p-2 px-3 rounded-lg border border-slate-850">
        <div className="space-y-0.5">
          <span className="text-[9px] text-slate-500 uppercase font-bold">Corrélation (R)</span>
          <div className="flex items-center space-x-1.5">
            <span className={`text-[11px] font-extrabold px-1.5 py-0.5 rounded ${diagnostics?.correlationColor}`}>
              {data.correlationCoefficient >= 0 ? "+" : ""}{data.correlationCoefficient.toFixed(2)}
            </span>
          </div>
        </div>

        <div className="space-y-0.5 border-l border-slate-850 pl-2">
          <span className="text-[9px] text-slate-500 uppercase font-bold">Bêta (Systemic)</span>
          <span className="block text-[11px] text-indigo-300 font-bold">
            {data.beta.toFixed(2)}
          </span>
        </div>

        <div className="space-y-0.5 border-l border-slate-850 pl-2">
          <span className="text-[9px] text-slate-500 uppercase font-bold">Détermination (R²)</span>
          <span className="block text-[11px] text-slate-350 font-bold">
            {(data.rSquared * 100).toFixed(1)}%
          </span>
        </div>

        <div className="space-y-0.5 border-l border-slate-850 pl-2">
          <span className="text-[9px] text-slate-500 uppercase font-bold">Vol. Ann ({symbol})</span>
          <span className="block text-[11px] text-emerald-400 font-bold">
            {data.volatilityAssetAnn.toFixed(1)}% <span className="text-[9px] font-light text-slate-500">vs {data.volatilitySP500Ann.toFixed(1)}% mkt</span>
          </span>
        </div>
      </div>

      {/* Visual Canvas containing D3 draw target and HTML tooltip */}
      <div 
        ref={containerRef} 
        className="w-full bg-slate-950/20 border border-slate-850/60 rounded-xl p-2 relative flex justify-center items-center overflow-hidden"
      >
        <svg ref={svgRef} className="block overflow-visible"></svg>
        
        {/* Absolute dynamic HTML tooltip nested correctly */}
        <div
          ref={tooltipRef}
          style={{ opacity: 0, pointerEvents: "none" }}
          className="absolute bg-slate-950/95 border border-slate-800 text-slate-200 p-2 rounded-lg shadow-2xl transition-opacity duration-150 z-10 w-44"
        />
      </div>

      {/* Dynamic Interpretive Analysis Footer */}
      {diagnostics && (
        <div className="bg-indigo-500/[0.03] border border-indigo-500/10 rounded-lg p-3 space-y-1.5">
          <div className="flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span className="text-xs font-bold text-slate-200 font-sans">Diagnostic Quantitatif ({symbol} vs S&P 500)</span>
          </div>

          <div className="text-[11px] font-medium leading-relaxed font-sans text-slate-400 space-y-1">
            <p>
              <strong className="text-slate-200">Sensibilité :</strong> {diagnostics.betaDesc}
            </p>
            <p>
              <strong className="text-slate-200">Corrélation :</strong> {diagnostics.explanation}
            </p>
          </div>
        </div>
      )}
    </motion.div>
  );
}
