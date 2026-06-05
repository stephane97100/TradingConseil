import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Shield, Eye, EyeOff, Lock, User, Mail, Chrome, Linkedin, Facebook, Apple, ArrowLeft, ArrowRight, Loader2, Sparkles, CheckCircle } from "lucide-react";

interface AuthPageProps {
  onAuthSuccess: (user: { name: string; method: string }) => void;
  onBackToLanding: () => void;
  initialMode?: "login" | "register";
}

export const AuthPage: React.FC<AuthPageProps> = ({ onAuthSuccess, onBackToLanding, initialMode = "login" }) => {
  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Social authentication simulation States
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  const [socialStep, setSocialStep] = useState<"idle" | "popup" | "authorizing" | "success">("idle");

  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    setTimeout(() => {
      if (mode === "register") {
        if (!username || !email || !password) {
          setError("Veuillez remplir tous les champs.");
          setLoading(false);
          return;
        }
        if (password.length < 6) {
          setError("Le mot de passe doit contenir au moins 6 caractères.");
          setLoading(false);
          return;
        }

        // Save credentials to localStorage
        const users = JSON.parse(localStorage.getItem("quantum_users") || "[]");
        if (users.find((u: any) => u.username === username || u.email === email)) {
          setError("Cet utilisateur ou cet e-mail existe déjà.");
          setLoading(false);
          return;
        }

        users.push({ username, email, password });
        localStorage.setItem("quantum_users", JSON.stringify(users));

        // Auto login on registration
        onAuthSuccess({ name: username, method: "Credentials" });
      } else {
        if (!username || !password) {
          setError("Veuillez remplir tous les champs.");
          setLoading(false);
          return;
        }

        const users = JSON.parse(localStorage.getItem("quantum_users") || "[]");
        const foundUser = users.find((u: any) => u.username === username && u.password === password);

        if (foundUser) {
          onAuthSuccess({ name: foundUser.username, method: "Credentials" });
        } else {
          // Check default account for convenience during evaluation
          if (username === "admin" && password === "admin123") {
            onAuthSuccess({ name: "Administrateur", method: "Credentials" });
          } else {
            setError("Identifiants incorrects. Essayer (admin/admin123) pour tester rapidement.");
          }
        }
      }
      setLoading(false);
    }, 1200);
  };

  const handleSocialLogin = (platform: "Google" | "LinkedIn" | "Facebook" | "Apple") => {
    setSocialLoading(platform);
    setSocialStep("popup");

    // Launch a realistic step-by-step social auth simulation
    setTimeout(() => {
      setSocialStep("authorizing");
      setTimeout(() => {
        setSocialStep("success");
        setTimeout(() => {
          onAuthSuccess({
            name: `${platform} User`,
            method: platform
          });
          setSocialLoading(null);
          setSocialStep("idle");
        }, 1000);
      }, 1500);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden select-none">
      {/* Background Gradients */}
      <div className="absolute top-1/4 left-1/4 -translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-y-1/2 translate-x-1/2 w-96 h-96 bg-pink-500/5 rounded-full blur-[150px] pointer-events-none" />

      {/* Header Back Button */}
      <div className="absolute top-6 left-6 z-10">
        <button
          onClick={onBackToLanding}
          className="flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-white bg-slate-900/60 border border-slate-800 px-3.5 py-2 rounded-xl transition-all hover:bg-slate-800"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-indigo-400" />
          <span>Retour à l'accueil</span>
        </button>
      </div>

      <div className="w-full max-w-[460px] relative z-10">
        {/* Brand Name Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex w-12 h-12 bg-indigo-600 rounded-2xl items-center justify-center p-2.5 mb-3 shadow-xl shadow-indigo-950/40">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
            </svg>
          </div>
          <h2 className="font-display font-black text-2xl tracking-tight text-white">
            QUANTUM<span className="text-indigo-400">ADVISE</span>
          </h2>
          <p className="text-slate-400 text-xs mt-1.5 font-light">
            {mode === "login" ? "Accéder au tableau de bord quantitatif d'élite" : "Rejoindre l'infrastructure financière Quantum"}
          </p>
        </div>

        {/* Auth form Card */}
        <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 shadow-2xl p-6 sm:p-8 space-y-6">
          
          {/* Internal mode switch */}
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-850">
            <button
              onClick={() => { setMode("login"); setError(null); }}
              className={`flex-1 text-center py-2 text-xs font-bold font-mono rounded-lg transition-all relative ${
                mode === "login" ? "text-indigo-400 bg-indigo-500/10 border border-indigo-500/20" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Se Connecter
            </button>
            <button
              onClick={() => { setMode("register"); setError(null); }}
              className={`flex-1 text-center py-2 text-xs font-bold font-mono rounded-lg transition-all relative ${
                mode === "register" ? "text-indigo-400 bg-indigo-500/10 border border-indigo-500/20" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              S'enregistrer
            </button>
          </div>

          <form onSubmit={handleCredentialsSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-rose-950/40 border border-rose-550/30 rounded-xl text-center text-xs text-rose-400 font-mono">
                {error}
              </div>
            )}

            {/* Fields container */}
            <div className="space-y-3.5">
              <div>
                <label className="block text-[10px] uppercase text-slate-500 font-bold mb-1.5 font-mono">Identifiant (Login)</label>
                <div className="relative flex items-center">
                  <User className="absolute left-3.5 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    placeholder="Entrez votre identifiant"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl py-2.5 pl-10 pr-4 text-slate-200 text-xs focus:outline-none transition-all placeholder:text-slate-600 font-medium"
                  />
                </div>
              </div>

              {mode === "register" && (
                <div>
                  <label className="block text-[10px] uppercase text-slate-500 font-bold mb-1.5 font-mono">Adresse E-mail</label>
                  <div className="relative flex items-center">
                    <Mail className="absolute left-3.5 w-4 h-4 text-slate-500" />
                    <input
                      type="email"
                      required
                      placeholder="votre@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl py-2.5 pl-10 pr-4 text-slate-200 text-xs focus:outline-none transition-all placeholder:text-slate-600 font-medium"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[10px] uppercase text-slate-500 font-bold mb-1.5 font-mono">Mot de passe</label>
                <div className="relative flex items-center">
                  <Lock className="absolute left-3.5 w-4 h-4 text-slate-500" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl py-2.5 pl-10 pr-10 text-slate-200 text-xs focus:outline-none transition-all placeholder:text-slate-600 font-medium font-sans"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 text-slate-500 hover:text-slate-350"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {mode === "login" && (
              <div className="text-right">
                <span className="text-[10px] font-mono text-slate-500 hover:text-indigo-400 cursor-pointer">
                  Utiliser admin / admin123 pour tester
                </span>
              </div>
            )}

            <button
              id="auth-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] py-2.5 rounded-xl font-bold text-xs text-white transition-all shadow-md shadow-indigo-950/50 flex items-center justify-center space-x-2 disabled:opacity-40"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Validation en cours...</span>
                </>
              ) : (
                <>
                  <span>{mode === "login" ? "Ouvrir une Session" : "Créer mon Compte"}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Social authentication section */}
          <div className="space-y-3 pt-2">
            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-slate-800/80"></div>
              <span className="flex-shrink mx-3 text-[9px] uppercase font-bold font-mono text-slate-550 select-none">
                Ou connexion via Auth
              </span>
              <div className="flex-grow border-t border-slate-800/80"></div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono font-bold">
              <button
                type="button"
                onClick={() => handleSocialLogin("Google")}
                className="flex items-center justify-center gap-2 bg-slate-950/60 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 p-2.5 rounded-xl text-slate-300 transition-colors"
              >
                <Chrome className="w-3.5 h-3.5 text-rose-500" />
                <span>Google</span>
              </button>
              
              <button
                type="button"
                onClick={() => handleSocialLogin("LinkedIn")}
                className="flex items-center justify-center gap-2 bg-slate-950/60 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 p-2.5 rounded-xl text-slate-300 transition-colors"
              >
                <Linkedin className="w-3.5 h-3.5 text-indigo-400" />
                <span>LinkedIn</span>
              </button>

              <button
                type="button"
                onClick={() => handleSocialLogin("Facebook")}
                className="flex items-center justify-center gap-2 bg-slate-950/60 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 p-2.5 rounded-xl text-slate-300 transition-colors"
              >
                <Facebook className="w-3.5 h-3.5 text-blue-500" />
                <span>Facebook</span>
              </button>

              <button
                type="button"
                onClick={() => handleSocialLogin("Apple")}
                className="flex items-center justify-center gap-2 bg-slate-950/60 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 p-2.5 rounded-xl text-slate-300 transition-colors"
              >
                <Apple className="w-3.5 h-3.5 text-white" />
                <span>Apple</span>
              </button>
            </div>
          </div>

        </div>

        {/* Security Trust Note */}
        <div className="flex items-center justify-center gap-2 text-[10px] text-slate-600 mt-6 font-mono font-medium">
          <Shield className="w-3.5 h-3.5 text-emerald-400" />
          <span>Données et clés d'accès chiffrées de bout-en-bout</span>
        </div>
      </div>

      {/* Floating Interactive Simulated Authentication Popups */}
      <AnimatePresence>
        {socialLoading && (
          <motion.div
            id="social-auth-popup"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/90 flex items-center justify-center p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl text-center space-y-6"
            >
              {socialStep === "popup" && (
                <>
                  <div className="h-12 w-12 rounded-xl bg-slate-950 flex items-center justify-center mx-auto border border-slate-800">
                    <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-white font-bold text-sm">Dialogue d'Authentification</h3>
                    <p className="text-slate-400 text-xs font-mono">Connexion sécurisée en cours avec {socialLoading} API...</p>
                  </div>
                </>
              )}

              {socialStep === "authorizing" && (
                <>
                  <div className="h-12 w-12 rounded-xl bg-slate-950 flex items-center justify-center mx-auto border border-slate-850">
                    <Sparkles className="w-6 h-6 text-yellow-500 animate-pulse" />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-white font-bold text-sm">Autorisation Approuvée</h3>
                    <p className="text-slate-400 text-xs font-mono">Synchronisation du profil et jeton de session chiffé...</p>
                  </div>
                </>
              )}

              {socialStep === "success" && (
                <>
                  <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto border border-emerald-500/20">
                    <CheckCircle className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-emerald-400 font-bold text-sm">Session Initialisée !</h3>
                    <p className="text-slate-450 text-xs">Chargement de QuantumAdvise Terminal...</p>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
