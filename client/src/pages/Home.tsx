import { useLocation } from "wouter";

export default function Home() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-purple-100 to-purple-200 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" />
        <div className="absolute top-40 right-20 w-40 h-40 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{ animationDelay: "2s" }} />
        <div className="absolute bottom-20 left-1/3 w-36 h-36 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{ animationDelay: "4s" }} />
        <div className="absolute -bottom-8 right-1/4 w-48 h-48 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-15 animate-float" style={{ animationDelay: "6s" }} />
      </div>

      <div className="relative z-10 max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="text-7xl mb-4 animate-bounce-in">🎯</div>
          <h1 className="text-6xl md:text-7xl font-black bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 bg-clip-text text-transparent mb-3">
            Missões da Vicki
          </h1>
          <p className="text-2xl text-purple-700 font-bold mb-2">
            Gamificação de Tarefas para Crianças
          </p>
          <p className="text-lg text-purple-600">
            Organize suas tarefas, ganhe pontos e desbloqueie medalhas! ✨
          </p>
        </div>

        {/* Main Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Vicki Card */}
          <div
            onClick={() => navigate("/vicki")}
            className="group backdrop-blur-md bg-gradient-to-br from-white/50 to-white/30 border-2 border-white/60 rounded-3xl p-8 cursor-pointer hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl hover:border-purple-300"
          >
            <div className="text-center">
              <div className="text-7xl mb-4 group-hover:animate-bounce-in">👧</div>
              <h2 className="text-3xl font-black text-purple-900 mb-3">Área da Vicki</h2>
              <p className="text-purple-700 font-semibold mb-6 text-lg">
                Veja suas tarefas, ganhe pontos e conquiste medalhas!
              </p>
              <div className="space-y-2 text-sm text-purple-700 font-bold mb-8 bg-white/30 rounded-xl p-4 backdrop-blur-sm">
                <p className="flex items-center gap-2">✅ <span>Tarefas diárias, semanais e mensais</span></p>
                <p className="flex items-center gap-2">⭐ <span>Sistema de pontos</span></p>
                <p className="flex items-center gap-2">🏆 <span>Medalhas e insígnias</span></p>
                <p className="flex items-center gap-2">🗺️ <span>Progresso do tesouro</span></p>
              </div>
              <button className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-black text-lg rounded-xl hover:from-purple-700 hover:to-pink-600 active:scale-95 transition-all shadow-lg hover:shadow-xl">
                Entrar 🚀
              </button>
            </div>
          </div>

          {/* Parents Card */}
          <div
            onClick={() => navigate("/pais/login")}
            className="group backdrop-blur-md bg-gradient-to-br from-white/50 to-white/30 border-2 border-white/60 rounded-3xl p-8 cursor-pointer hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl hover:border-purple-300"
          >
            <div className="text-center">
              <div className="text-7xl mb-4 group-hover:animate-bounce-in">👨‍👩‍👧</div>
              <h2 className="text-3xl font-black text-purple-900 mb-3">Painel dos Pais</h2>
              <p className="text-purple-700 font-semibold mb-6 text-lg">
                Crie tarefas, acompanhe o progresso e customize as recompensas!
              </p>
              <div className="space-y-2 text-sm text-purple-700 font-bold mb-8 bg-white/30 rounded-xl p-4 backdrop-blur-sm">
                <p className="flex items-center gap-2">📋 <span>Gerenciar tarefas</span></p>
                <p className="flex items-center gap-2">📊 <span>Visualizar progresso</span></p>
                <p className="flex items-center gap-2">🎯 <span>Definir pontos</span></p>
                <p className="flex items-center gap-2">📜 <span>Histórico completo</span></p>
              </div>
              <button className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-black text-lg rounded-xl hover:from-purple-700 hover:to-pink-600 active:scale-95 transition-all shadow-lg hover:shadow-xl">
                Acessar 🔐
              </button>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="backdrop-blur-md bg-white/40 border-2 border-white/60 rounded-3xl p-8 shadow-lg">
          <h2 className="text-4xl font-black text-purple-900 mb-8 text-center">✨ Recursos Principais</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <div className="text-center group hover:scale-110 transition-transform">
              <div className="text-5xl mb-3 group-hover:animate-bounce-in">📅</div>
              <p className="font-bold text-purple-900">Tarefas Flexíveis</p>
              <p className="text-xs text-purple-600 mt-1">Diárias, semanais e mensais</p>
            </div>
            <div className="text-center group hover:scale-110 transition-transform">
              <div className="text-5xl mb-3 group-hover:animate-bounce-in">⭐</div>
              <p className="font-bold text-purple-900">Sistema de Pontos</p>
              <p className="text-xs text-purple-600 mt-1">Ganhe pontos ao completar</p>
            </div>
            <div className="text-center group hover:scale-110 transition-transform">
              <div className="text-5xl mb-3 group-hover:animate-bounce-in">🏆</div>
              <p className="font-bold text-purple-900">Medalhas</p>
              <p className="text-xs text-purple-600 mt-1">Desbloqueie conquistas</p>
            </div>
            <div className="text-center group hover:scale-110 transition-transform">
              <div className="text-5xl mb-3 group-hover:animate-bounce-in">🗺️</div>
              <p className="font-bold text-purple-900">Tesouro Animado</p>
              <p className="text-xs text-purple-600 mt-1">Progresso visual divertido</p>
            </div>
            <div className="text-center group hover:scale-110 transition-transform">
              <div className="text-5xl mb-3 group-hover:animate-bounce-in">📊</div>
              <p className="font-bold text-purple-900">Relatórios</p>
              <p className="text-xs text-purple-600 mt-1">Acompanhe o progresso</p>
            </div>
            <div className="text-center group hover:scale-110 transition-transform">
              <div className="text-5xl mb-3 group-hover:animate-bounce-in">📱</div>
              <p className="font-bold text-purple-900">Responsivo</p>
              <p className="text-xs text-purple-600 mt-1">Funciona em qualquer dispositivo</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-purple-700 font-semibold">
            Desenvolvido com ❤️ para motivar crianças a completar suas tarefas
          </p>
        </div>
      </div>
    </div>
  );
}
