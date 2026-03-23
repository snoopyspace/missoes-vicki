import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function ParentLogin() {
  const [, navigate] = useLocation();
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const verifyPasswordMutation = trpc.parent.verifyPassword.useMutation({
    onSuccess: () => {
      sessionStorage.setItem("parentAuth", "true");
      toast.success("✅ Bem-vindo ao painel!");
      navigate("/pais/dashboard");
    },
    onError: (error) => {
      toast.error("❌ Senha incorreta", {
        description: "Verifique e tente novamente",
      });
      setPassword("");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      toast.error("Digite a senha");
      return;
    }
    setIsLoading(true);
    verifyPasswordMutation.mutate(password);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-purple-100 to-purple-200 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" />
        <div className="absolute top-40 right-20 w-40 h-40 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{ animationDelay: "2s" }} />
        <div className="absolute bottom-20 left-1/3 w-36 h-36 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{ animationDelay: "4s" }} />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="backdrop-blur-md bg-white/40 border-2 border-white/60 rounded-3xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">👨‍👩‍👧</div>
            <h2 className="text-4xl font-black bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent mb-2">
              Painel dos Pais
            </h2>
            <p className="text-purple-700 text-sm font-semibold">Acesso restrito com senha</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-purple-900 mb-3">
                🔐 Senha de Acesso
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite a senha"
                className="w-full px-5 py-4 bg-white/50 border-2 border-purple-300 rounded-xl font-bold text-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
                disabled={isLoading}
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !password}
              className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-black text-lg rounded-xl hover:from-purple-700 hover:to-pink-600 active:scale-95 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
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
            className="w-full mt-4 px-6 py-3 bg-white/40 backdrop-blur-md border-2 border-white/60 text-purple-900 font-bold rounded-xl hover:bg-white/60 active:scale-95 transition-all duration-200 shadow-lg"
          >
            ← Voltar
          </button>

          <p className="text-center text-purple-600 text-xs mt-6 font-semibold">
            Apenas para pais ou responsáveis
          </p>
        </div>
      </div>
    </div>
  );
}
