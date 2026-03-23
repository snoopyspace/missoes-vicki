import { useLocation } from "wouter";

export default function Home() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[rgb(255_250_245)] to-[rgb(254_215_170)] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-10 left-10 w-20 h-20 memphis-circle bg-[rgb(167_243_208)] opacity-20 animate-float" />
      <div className="absolute top-40 right-20 w-32 h-32 memphis-triangle bg-[rgb(221_214_254)] opacity-15 animate-float" style={{ animationDelay: "1s" }} />
      <div className="absolute bottom-32 left-1/4 w-24 h-24 memphis-circle bg-[rgb(253_230_138)] opacity-20 animate-float" style={{ animationDelay: "2s" }} />
      <div className="absolute bottom-10 right-10 w-16 h-16 memphis-diamond bg-[rgb(167_243_208)] opacity-25 animate-float" style={{ animationDelay: "0.5s" }} />

      <div className="relative z-10 max-w-2xl w-full">
        <div className="text-center mb-12">
          <h1 className="memphis-text text-5xl md:text-6xl mb-4">
            🎯 Missões da Vicki
          </h1>
          <p className="text-xl text-gray-700 font-semibold mb-2">
            Gamificação de Tarefas para Crianças
          </p>
          <p className="text-gray-600">
            Organize suas tarefas, ganhe pontos e desbloqueie medalhas!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Vicki Card */}
          <div
            onClick={() => navigate("/vicki")}
            className="card-memphis bg-gradient-to-br from-[rgb(255_240_230)] to-[rgb(254_215_170)] cursor-pointer hover:scale-105 transition-transform"
          >
            <div className="text-center">
              <div className="text-6xl mb-4">👧</div>
              <h2 className="memphis-text text-2xl mb-2">Área da Vicki</h2>
              <p className="text-gray-600 font-semibold mb-6">
                Veja suas tarefas, ganhe pontos e conquiste medalhas!
              </p>
              <div className="space-y-2 text-sm text-gray-700 font-bold mb-6">
                <p>✅ Tarefas diárias, semanais e mensais</p>
                <p>⭐ Sistema de pontos</p>
                <p>🏆 Medalhas e insígnias</p>
                <p>🗺️ Progresso do tesouro</p>
              </div>
              <button className="btn-primary w-full">
                Entrar 🚀
              </button>
            </div>
          </div>

          {/* Parents Card */}
          <div
            onClick={() => navigate("/pais/login")}
            className="card-memphis bg-gradient-to-br from-[rgb(240_230_255)] to-[rgb(221_214_254)] cursor-pointer hover:scale-105 transition-transform"
          >
            <div className="text-center">
              <div className="text-6xl mb-4">👨‍👩‍👧</div>
              <h2 className="memphis-text text-2xl mb-2">Painel dos Pais</h2>
              <p className="text-gray-600 font-semibold mb-6">
                Crie tarefas, acompanhe o progresso e customize as recompensas!
              </p>
              <div className="space-y-2 text-sm text-gray-700 font-bold mb-6">
                <p>📋 Gerenciar tarefas</p>
                <p>📊 Visualizar progresso</p>
                <p>🎯 Definir pontos</p>
                <p>📜 Histórico completo</p>
              </div>
              <button className="btn-primary w-full">
                Acessar 🔐
              </button>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-12 card-memphis bg-white">
          <h2 className="memphis-text text-2xl mb-6 text-center">✨ Recursos Principais</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-4xl mb-2">📅</div>
              <p className="font-bold text-sm text-gray-700">Tarefas Flexíveis</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2">⭐</div>
              <p className="font-bold text-sm text-gray-700">Sistema de Pontos</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2">🏆</div>
              <p className="font-bold text-sm text-gray-700">Medalhas</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2">🗺️</div>
              <p className="font-bold text-sm text-gray-700">Tesouro Animado</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2">📊</div>
              <p className="font-bold text-sm text-gray-700">Relatórios</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2">📱</div>
              <p className="font-bold text-sm text-gray-700">Responsivo</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-600 text-sm">
          <p>Desenvolvido com ❤️ para motivar crianças a completar suas tarefas</p>
        </div>
      </div>
    </div>
  );
}
