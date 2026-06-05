import React from "react";
import { motion } from "motion/react";
import { Sparkles, TrendingUp, Bell, Zap, ChevronRight, Activity, Landmark, ShieldCheck, Cpu, Globe, ArrowRight } from "lucide-react";

interface LandingPageProps {
  onEnterApp: (view: "login" | "register") => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp }) => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-600 selection:text-white relative overflow-hidden">
      {/* Background radial effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1400px] h-[600px] bg-gradient-to-b from-indigo-550/10 via-transparent to-transparent rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute top-[400px] -right-20 w-80 h-80 bg-pink-500/5 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-20 -left-20 w-80 h-80 bg-teal-500/5 rounded-full blur-[130px] pointer-events-none" />

      {/* Landing Header */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between border-b border-slate-900/60 relative z-10 select-none">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center p-1 shadow-md shadow-indigo-950/40">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
            </svg>
          </div>
          <span className="font-display font-black text-lg tracking-tight text-white">
            QUANTUM<span className="text-indigo-400">ADVISE</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onEnterApp("login")}
            className="text-xs font-mono text-slate-400 hover:text-white px-3.5 py-1.5 transition-colors"
          >
            Se Connecter
          </button>
          <button
            onClick={() => onEnterApp("register")}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-sans font-bold text-xs px-4 py-2 rounded-xl transition-all hover:shadow-lg active:scale-95"
          >
            Créer Compte
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 max-w-7xl mx-auto px-6 pt-16 pb-20 flex flex-col items-center justify-center text-center relative z-10 w-full">
        {/* Glowing Banner Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2.5 bg-indigo-500/10 border border-indigo-500/20 px-3.5 py-1.5 rounded-full text-[10px] font-mono text-indigo-400 font-extrabold uppercase tracking-wider mb-6"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
          <span>Analyses Quantitatives de Niveau Professionnel</span>
        </motion.div>

        {/* Display Heading (Ultra-responsive sizes) */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-black text-white tracking-tight leading-none max-w-4xl"
        >
          Prenez des décisions de trading avec <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-pink-400 to-teal-400">l'Intelligence Artificielle</span>
        </motion.h1>

        {/* Description subtext */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-slate-400 text-sm sm:text-base md:text-lg font-light mt-6 max-w-2xl leading-relaxed font-sans"
        >
          QuantumAdvise fusionne les indicateurs techniques sophistiqués en temps réel avec la puissance prédictive de Gemini afin de générer des théses d'arbitrage claires et des signaux experts.
        </motion.p>

        {/* Hero Interactive Commands */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center gap-4 mt-10 w-full sm:w-auto"
        >
          <button
            onClick={() => onEnterApp("register")}
            className="w-full sm:w-auto px-7 py-3.5 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white rounded-xl font-bold font-sans text-xs transition-all shadow-md shadow-indigo-950/50 flex items-center justify-center gap-2 group cursor-pointer"
          >
            <span>Démarrer l'Analyse</span>
            <ArrowRight className="w-4 h-4 text-indigo-200 group-hover:translate-x-1 transition-transform" />
          </button>
          
          <button
            onClick={() => onEnterApp("login")}
            className="w-full sm:w-auto px-7 py-3.5 bg-slate-900 hover:bg-slate-800 active:scale-[0.98] border border-slate-840 text-slate-300 rounded-xl font-bold font-sans text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Accéder au Terminal</span>
          </button>
        </motion.div>

        {/* Feature Grid demonstrating the 4 screen layout specs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-20 w-full text-left select-none">
          
          {/* Card 1 */}
          <motion.div
            whileHover={{ y: -5 }}
            className="p-6 bg-slate-900/40 backdrop-blur-md rounded-2xl border border-slate-900 hover:border-indigo-500/20 transition-all space-y-4"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/10">
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="text-white font-bold text-sm">Terminal Graphique</h3>
            <p className="text-slate-400 text-xs font-light leading-relaxed">
              Consultez des bougies journalières complètes sur actions, cryptos, devises Forex et SICAV, avec volume et overlays ajusteurs d'EMA ou de RSI.
            </p>
          </motion.div>

          {/* Card 2 */}
          <motion.div
            whileHover={{ y: -5 }}
            className="p-6 bg-slate-900/40 backdrop-blur-md rounded-2xl border border-slate-900 hover:border-teal-500/20 transition-all space-y-4"
          >
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-400 border border-teal-500/10">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-white font-bold text-sm">Positions par l'IA</h3>
            <p className="text-slate-400 text-xs font-light leading-relaxed">
              Déléguez l'arbitrage à Gemini. Recevez des verdicts ("BUY", "HOLD", "SELL") instantanés contenant stop-loss et target de rendement précis.
            </p>
          </motion.div>

          {/* Card 3 */}
          <motion.div
            whileHover={{ y: -5 }}
            className="p-6 bg-slate-900/40 backdrop-blur-md rounded-2xl border border-slate-900 hover:border-pink-500/20 transition-all space-y-4"
          >
            <div className="w-10 h-10 rounded-xl bg-pink-500/10 flex items-center justify-center text-pink-400 border border-pink-500/10">
              <Bell className="w-5 h-5" />
            </div>
            <h3 className="text-white font-bold text-sm">Alertes de Seuil</h3>
            <p className="text-slate-400 text-xs font-light leading-relaxed">
              Programmez des déclencheurs instantanés. Soyez notifié immédiatement à la hausse comme à la baisse sur le cours des actifs financiers suivis.
            </p>
          </motion.div>

          {/* Card 4 */}
          <motion.div
            whileHover={{ y: -5 }}
            className="p-6 bg-slate-900/40 backdrop-blur-md rounded-2xl border border-slate-900 hover:border-amber-500/20 transition-all space-y-4"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/10">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="text-white font-bold text-sm">Multi-Classes</h3>
            <p className="text-slate-400 text-xs font-light leading-relaxed">
              Un tableau unifié pour basculer facilement de la bourse tech aux paires Forex majeures, SICAV traditionnelles et cryptos leaders.
            </p>
          </motion.div>

        </div>

        {/* Live Market Simulation visual element */}
        <div className="mt-24 w-full rounded-2xl border border-slate-850 bg-slate-900/20 p-5 sm:p-7 text-left max-w-5xl overflow-hidden shadow-2xl relative select-none">
          <div className="absolute top-0 right-0 w-44 h-44 bg-indigo-500/5 rounded-full blur-[80px]" />
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-800 pb-4 mb-6 gap-3">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
              <div className="text-xs font-mono text-slate-400">CONNECTEUR ACTIF : FLUX D'ÉLITE EN DIRECT</div>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-500 font-mono">
              <span>S&P 500 : <strong className="text-emerald-400">+0.82%</strong></span>
              <span>•</span>
              <span>BTC / USD : <strong className="text-emerald-400">+2.4%</strong></span>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-xs font-mono">
            <div>
              <span className="text-slate-500 text-[10px]">DERNIER CONSEIL IA</span>
              <div className="text-emerald-400 font-bold border-l-2 border-emerald-500 pl-2 mt-1">
                BUY [AAPL] à 185.92 $
              </div>
            </div>
            <div>
              <span className="text-slate-500 text-[10px]">CIBLE ATTEINTE</span>
              <div className="text-white font-bold border-l-2 border-indigo-500 pl-2 mt-1">
                +11.4% Target Profit
              </div>
            </div>
            <div>
              <span className="text-slate-500 text-[10px]">CONFIANCE MÉLISSE</span>
              <div className="text-slate-300 font-bold border-l-2 border-slate-750 pl-2 mt-1">
                88% Quantum Conf.
              </div>
            </div>
            <div>
              <span className="text-slate-500 text-[10px]">STOP LOSS CONCORDÉ</span>
              <div className="text-rose-400 font-bold border-l-2 border-rose-500 pl-2 mt-1">
                Coupure à 171.20 $
              </div>
            </div>
          </div>
        </div>

      </section>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 p-6 text-center text-xs text-slate-500 relative z-10 select-none">
        <p className="max-w-2xl mx-auto font-light leading-relaxed text-[10px] text-slate-500">
          QuantumAdvise conçoit des signaux techniques et macro sous forme éducative et didactique. Nous n'exerçons aucun mandat de placement et ne sollicitons aucun transfert d'investissement.
        </p>
        <p className="text-[9px] text-slate-600 font-mono mt-3">
          © 2026 QuantumAdvise Terminal • Tous droits réservés
        </p>
      </footer>
    </div>
  );
};
