import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { Loader2, Trophy, Zap, Target } from "lucide-react";

export default function VickiDashboard() {
  const [, navigate] = useLocation();
  const [isLoading, setIsLoading] = useState(true);

  // Fetch dashboard data
  const dashboardQuery = trpc.stats.getDashboard.useQuery();
  const tasksQuery = trpc.tasks.listByCategory.useQuery("daily");
  const treasureQuery = trpc.treasure.getProgress.useQuery();

  useEffect(() => {
    if (dashboardQuery.data) {
      setIsLoading(false);
    }
  }, [dashboardQuery.data]);

  const handleCompleteTask = async (taskId: number) => {
    try {
      await trpc.tasks.complete.useMutation().mutateAsync(taskId);
      dashboardQuery.refetch();
      treasureQuery.refetch();
    } catch (error) {
      console.error("Erro ao completar tarefa:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[rgb(255_250_245)] to-[rgb(254_215_170)] flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-accent" />
      </div>
    );
  }

  const data = dashboardQuery.data;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[rgb(255_250_245)] to-[rgb(254_215_170)] pb-20 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-10 left-10 w-20 h-20 memphis-circle bg-[rgb(167_243_208)] opacity-20 animate-float" />
      <div className="absolute top-40 right-20 w-32 h-32 memphis-triangle bg-[rgb(221_214_254)] opacity-15 animate-float" style={{ animationDelay: "1s" }} />
      <div className="absolute bottom-32 left-1/4 w-24 h-24 memphis-circle bg-[rgb(253_230_138)] opacity-20 animate-float" style={{ animationDelay: "2s" }} />

      {/* Header */}
      <div className="relative z-10 pt-6 px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="memphis-text text-4xl md:text-5xl text-center mb-2">
            🎯 Missões da Vicki
          </h1>
          <p className="text-center text-gray-600 font-semibold">Vamos conquistar o tesouro!</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="relative z-10 max-w-2xl mx-auto px-4 mt-8 grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="card-memphis bg-white">
          <div className="text-center">
            <div className="text-3xl mb-2">⭐</div>
            <p className="text-xs text-gray-600 font-bold">PONTOS</p>
            <p className="text-2xl font-bold text-accent">{data?.totalPoints || 0}</p>
          </div>
        </div>

        <div className="card-memphis bg-white">
          <div className="text-center">
            <div className="text-3xl mb-2">🏆</div>
            <p className="text-xs text-gray-600 font-bold">MEDALHAS</p>
            <p className="text-2xl font-bold text-accent">{data?.unlockedMedals || 0}/{data?.totalMedals || 0}</p>
          </div>
        </div>

        <div className="card-memphis bg-white">
          <div className="text-center">
            <div className="text-3xl mb-2">✅</div>
            <p className="text-xs text-gray-600 font-bold">TAREFAS</p>
            <p className="text-2xl font-bold text-accent">{data?.completedTasks || 0}</p>
          </div>
        </div>

        <div className="card-memphis bg-white">
          <div className="text-center">
            <div className="text-3xl mb-2">🗺️</div>
            <p className="text-xs text-gray-600 font-bold">TESOURO</p>
            <p className="text-2xl font-bold text-accent">{Math.round(parseFloat(data?.treasureProgress || "0"))}%</p>
          </div>
        </div>
      </div>

      {/* Treasure Progress */}
      <div className="relative z-10 max-w-2xl mx-auto px-4 mt-8">
        <div className="card-memphis bg-white">
          <h2 className="memphis-text text-xl mb-4 flex items-center gap-2">
            <span>🗺️</span> Progresso do Tesouro
          </h2>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${parseFloat(data?.treasureProgress || "0")}%` }}
            />
          </div>
          <p className="text-center mt-3 font-bold text-gray-700">
            {Math.round(parseFloat(data?.treasureProgress || "0"))}% do caminho!
          </p>
        </div>
      </div>

      {/* Daily Tasks */}
      <div className="relative z-10 max-w-2xl mx-auto px-4 mt-8">
        <h2 className="memphis-text text-2xl mb-4 flex items-center gap-2">
          <span>📋</span> Tarefas de Hoje
        </h2>

        {tasksQuery.data && tasksQuery.data.length > 0 ? (
          <div className="space-y-3">
            {tasksQuery.data.map((task) => (
              <div
                key={task.id}
                className="task-item flex items-center justify-between"
              >
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800">{task.title}</h3>
                  {task.description && (
                    <p className="text-sm text-gray-600">{task.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-bold">
                      ⭐ {task.points} pts
                    </span>
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-bold ${
                        task.priority === "high"
                          ? "bg-red-100 text-red-800"
                          : task.priority === "medium"
                          ? "bg-orange-100 text-orange-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {task.priority === "high"
                        ? "🔥 Alta"
                        : task.priority === "medium"
                        ? "⚡ Média"
                        : "✨ Baixa"}
                    </span>
                  </div>
                </div>
                {!task.completed && (
                  <button
                    onClick={() => handleCompleteTask(task.id)}
                    className="btn-primary ml-4 py-2 px-4 text-sm"
                  >
                    ✅ Fazer
                  </button>
                )}
                {task.completed && (
                  <div className="text-2xl animate-bounce-in">✨</div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="card-memphis bg-white text-center py-8">
            <p className="text-gray-600 font-semibold">Nenhuma tarefa para hoje! 🎉</p>
          </div>
        )}
      </div>

      {/* Medals Section */}
      {data?.medals && data.medals.length > 0 && (
        <div className="relative z-10 max-w-2xl mx-auto px-4 mt-8">
          <h2 className="memphis-text text-2xl mb-4 flex items-center gap-2">
            <span>🏆</span> Medalhas Conquistadas
          </h2>
          <div className="grid grid-cols-4 gap-3">
            {data.medals.map((medal) => (
              <div
                key={medal.id}
                className="medal-badge bg-white animate-bounce-in"
                title={medal.name}
              >
                {medal.icon}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Navigation Button */}
      <div className="relative z-10 max-w-2xl mx-auto px-4 mt-8 pb-4">
        <button
          onClick={() => navigate("/pais/login")}
          className="btn-secondary w-full"
        >
          👨‍👩‍👧 Painel dos Pais
        </button>
      </div>
    </div>
  );
}
