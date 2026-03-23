import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Loader2 } from "lucide-react";

export default function ParentLogin() {
  const [, navigate] = useLocation();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const verifyPasswordMutation = trpc.parent.verifyPassword.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await verifyPasswordMutation.mutateAsync(password);
      // Store auth token in session storage
      sessionStorage.setItem("parentAuth", "true");
      navigate("/pais/dashboard");
    } catch (err: any) {
      setError(err.message || "Senha incorreta");
      setPassword("");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[rgb(255_250_245)] to-[rgb(254_215_170)] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-10 left-10 w-20 h-20 memphis-circle bg-[rgb(167_243_208)] opacity-20 animate-float" />
      <div className="absolute top-40 right-20 w-32 h-32 memphis-triangle bg-[rgb(221_214_254)] opacity-15 animate-float" style={{ animationDelay: "1s" }} />
      <div className="absolute bottom-32 left-1/4 w-24 h-24 memphis-circle bg-[rgb(253_230_138)] opacity-20 animate-float" style={{ animationDelay: "2s" }} />

      <div className="relative z-10 w-full max-w-md">
        <div className="card-memphis bg-white">
          <div className="text-center mb-8">
            <h1 className="memphis-text text-4xl mb-2">👨‍👩‍👧</h1>
            <h2 className="memphis-text text-2xl">Painel dos Pais</h2>
            <p className="text-gray-600 text-sm mt-2">Acesso restrito com senha</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Senha de Acesso
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite a senha"
                className="w-full px-4 py-3 border-2 border-foreground rounded-lg font-bold focus:outline-none focus:ring-2 focus:ring-accent"
                disabled={isLoading}
              />
            </div>

            {error && (
              <div className="bg-red-100 border-2 border-red-500 text-red-800 px-4 py-3 rounded-lg font-bold text-sm">
                ❌ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !password}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Verificando...
                </>
              ) : (
                <>
                  🔓 Entrar
                </>
              )}
            </button>
          </form>

          <button
            onClick={() => navigate("/")}
            className="btn-secondary w-full mt-4"
          >
            ← Voltar
          </button>
        </div>

        <p className="text-center text-gray-600 text-xs mt-4">
          Apenas para pais ou responsáveis
        </p>
      </div>
    </div>
  );
}
