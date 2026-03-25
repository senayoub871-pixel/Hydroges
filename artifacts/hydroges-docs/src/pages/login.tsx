import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useLocation } from "wouter";
import { Building2, IdCard, Lock } from "lucide-react";

export default function LoginPage() {
  const { login } = useAuth();
  const [, navigate] = useLocation();
  const [companyNumber, setCompanyNumber] = useState("0125.6910.0681");
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
              onChange={(e) => setCompanyNumber(e.target.value)}
              placeholder="0125.6910.0681"
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
