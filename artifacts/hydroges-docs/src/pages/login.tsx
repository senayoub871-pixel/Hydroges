import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useLocation } from "wouter";
import { Building2, IdCard, Lock, Mail, KeyRound } from "lucide-react";

type View = "login" | "forgot";

export default function LoginPage() {
  const { login } = useAuth();
  const [, navigate] = useLocation();
  const companyNumber = "0125.6910.0681";
  const [view, setView] = useState<View>("login");

  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLogin, setForgotLogin] = useState("");
  const [forgotNewPassword, setForgotNewPassword] = useState("");
  const [forgotConfirm, setForgotConfirm] = useState("");
  const [forgotError, setForgotError] = useState("");
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await login(companyNumber, userId, password);
    setLoading(false);
    if (result.ok) {
      navigate("/inbox");
    } else {
      setError(result.error || "Identifiant ou mot de passe incorrect.");
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError("");
    if (forgotNewPassword !== forgotConfirm) {
      setForgotError("Les mots de passe ne correspondent pas.");
      return;
    }
    if (forgotNewPassword.length < 6) {
      setForgotError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }
    setForgotLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          loginId: forgotLogin,
          email: forgotEmail,
          newPassword: forgotNewPassword,
        }),
      });
      const body = await res.json();
      if (!res.ok) {
        setForgotError(body.error || "Échec de la réinitialisation.");
      } else {
        setForgotSuccess(true);
      }
    } catch {
      setForgotError("Erreur réseau. Vérifiez votre connexion.");
    } finally {
      setForgotLoading(false);
    }
  };

  const backToLogin = () => {
    setView("login");
    setForgotEmail("");
    setForgotLogin("");
    setForgotNewPassword("");
    setForgotConfirm("");
    setForgotError("");
    setForgotSuccess(false);
  };

  if (view === "forgot") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: "#c5c8e8" }}>
        <div className="flex flex-col items-center mb-8">
          <img src="/logo.png" alt="HYDROGES Logo" className="w-20 h-20 object-contain mb-2" />
          <h1 className="text-3xl font-black tracking-widest" style={{ color: "#1e1b6b" }}>HYDROGES</h1>
        </div>

        <div className="w-full max-w-sm px-4">
          <div className="bg-white/60 rounded-2xl p-6 shadow-md">
            <h2 className="text-lg font-black mb-1 text-center" style={{ color: "#1e1b6b" }}>
              MOT DE PASSE OUBLIÉ
            </h2>
            <p className="text-xs text-center mb-5" style={{ color: "#1e1b6b", opacity: 0.7 }}>
              Saisissez votre email et votre identifiant pour réinitialiser votre mot de passe.
            </p>

            {forgotSuccess ? (
              <div className="text-center">
                <div className="mb-4 p-3 rounded-xl text-sm text-green-700 bg-green-100 border border-green-200">
                  Mot de passe réinitialisé avec succès !
                </div>
                <button
                  onClick={backToLogin}
                  className="hydroges-btn px-8 py-2 text-sm"
                >
                  SE CONNECTER →
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgot} className="space-y-0">
                {forgotError && (
                  <div className="mb-3 p-3 rounded-xl text-sm text-red-700 bg-red-100 border border-red-200">
                    {forgotError}
                  </div>
                )}

                <div className="hydroges-input-group">
                  <div className="hydroges-input-icon">
                    <Mail className="w-5 h-5" />
                  </div>
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="Adresse email"
                    className="hydroges-input-field"
                    required
                  />
                </div>

                <div className="hydroges-input-group">
                  <div className="hydroges-input-icon">
                    <IdCard className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    value={forgotLogin}
                    onChange={(e) => setForgotLogin(e.target.value)}
                    placeholder="Nom d'utilisateur"
                    className="hydroges-input-field"
                    required
                  />
                </div>

                <div className="hydroges-input-group">
                  <div className="hydroges-input-icon">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <input
                    type="password"
                    value={forgotNewPassword}
                    onChange={(e) => setForgotNewPassword(e.target.value)}
                    placeholder="Nouveau mot de passe"
                    className="hydroges-input-field"
                    required
                  />
                </div>

                <div className="hydroges-input-group">
                  <div className="hydroges-input-icon">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type="password"
                    value={forgotConfirm}
                    onChange={(e) => setForgotConfirm(e.target.value)}
                    placeholder="Confirmer le mot de passe"
                    className="hydroges-input-field"
                    required
                  />
                </div>

                <div className="flex flex-col items-center gap-2 mt-2">
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="hydroges-btn px-8 py-2 text-sm"
                    style={{ opacity: forgotLoading ? 0.7 : 1 }}
                  >
                    {forgotLoading ? "Réinitialisation..." : "RÉINITIALISER →"}
                  </button>
                  <button
                    type="button"
                    onClick={backToLogin}
                    className="text-sm underline font-bold mt-1"
                    style={{ color: "#1e1b6b" }}
                  >
                    Retour à la connexion
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: "#c5c8e8" }}>
      <div className="flex flex-col items-center mb-8">
        <img src="/logo.png" alt="HYDROGES Logo" className="w-28 h-28 object-contain mb-2" />
        <h1 className="text-4xl font-black tracking-widest" style={{ color: "#1e1b6b" }}>HYDROGES</h1>
      </div>

      <div className="w-full max-w-sm px-4">
        {error && (
          <div className="mb-4 p-3 rounded-xl text-sm text-red-700 bg-red-100 border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-0">
          <div className="hydroges-input-group">
            <div className="hydroges-input-icon">
              <Building2 className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={companyNumber}
              readOnly
              placeholder="0125.6910.0681"
              className="hydroges-input-field"
              style={{ cursor: "default", userSelect: "none" }}
              required
            />
          </div>

          <div className="hydroges-input-group">
            <div className="hydroges-input-icon">
              <IdCard className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="ID d'utilisateur"
              className="hydroges-input-field"
              required
            />
          </div>

          <div className="hydroges-input-group">
            <div className="hydroges-input-icon">
              <Lock className="w-5 h-5" />
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Saisir votre mot de passe"
              className="hydroges-input-field"
              required
            />
          </div>

          <div className="flex justify-end mb-1">
            <button
              type="button"
              onClick={() => setView("forgot")}
              className="text-xs underline"
              style={{ color: "#1e1b6b", opacity: 0.8 }}
            >
              Mot de passe oublié ?
            </button>
          </div>

          <p className="text-center text-sm mb-4" style={{ color: "#1e1b6b" }}>
            vous n'avez pas un compte ?{" "}
            <a href="/register" className="font-bold underline" style={{ color: "#1e1b6b" }}>
              CRÉER UN COMPTE
            </a>
          </p>

          <div className="flex justify-center">
            <button
              type="submit"
              disabled={loading}
              className="hydroges-btn px-10 py-3 text-lg"
              style={{ opacity: loading ? 0.7 : 1 }}
            >
              {loading ? "Connexion..." : "CONNEXION →"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
