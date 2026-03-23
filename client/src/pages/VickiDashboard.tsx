import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { Loader2, Trophy, Zap, Target } from "lucide-react";
import { toast } from "sonner";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ConfettiAnimation } from "@/components/ConfettiAnimation";
import { StatCard } from "@/components/StatCard";

export default function VickiDashboard() {
  const [, navigate] = useLocation();
  const [isLoading, setIsLoading] = useState(true);

  // Fetch dashboard data
  const dashboardQuery = trpc.stats.getDashboard.useQuery();
  const tasksQuery = trpc.tasks.listByCategory.useQuery("daily");
  const treasureQuery = trpc.treasure.getProgress.useQuery();
  
  // Create mutation correctly at component level
  const completeTaskMutation = trpc.tasks.complete.useMutation({
    onSuccess: () => {
      toast.success("🎉 Tarefa completa! Parabéns!", {
        description: "Você ganhou pontos e está mais perto do tesouro!",
        duration: 3000,
      });
      dashboardQuery.refetch();
      tasksQuery.refetch();
      treasureQuery.refetch();
    },
    onError: (error) => {
      toast.error("Erro ao completar tarefa", {
        description: error.message || "Tente novamente",
      });
    },
  });

  useEffect(() => {
    if (dashboardQuery.data) {
      setIsLoading(false);
    }
  }, [dashboardQuery.data]);

  const handleCompleteTask = (taskId: number) => {
    completeTaskMutation.mutate(taskId);
  };

  const [showConfetti, setShowConfetti] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-purple-100 to-purple-200 flex items-center justify-center">
        <LoadingSpinner size="lg" message="Carregando suas missões..." />
      </div>
    );
  }

  const data = dashboardQuery.data;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-purple-100 to-purple-200 pb-20 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" />
        <div className="absolute top-40 right-20 w-40 h-40 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{ animationDelay: "2s" }} />
        <div className="absolute bottom-20 left-1/3 w-36 h-36 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{ animationDelay: "4s" }} />
      </div>

      {/* Header */}
      <div className="relative z-10 pt-8 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 bg-clip-text text-transparent mb-2">
              🎯 Missões da Vicki
            </h1>
            <p className="text-lg text-purple-700 font-semibold">Vamos conquistar o tesouro juntas! ✨</p>
          </div>
        </div>
      </div>

      {/* Stats Cards - Modern Design */}
      <div className="relative z-10 max-w-3xl mx-auto px-4 mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon="⭐" label="Pontos" value={data?.totalPoints || 0} gradient="purple" />
        <StatCard icon="🏆" label="Medalhas" value={`${data?.unlockedMedals || 0}/${data?.totalMedals || 0}`} gradient="pink" />
        <StatCard icon="✅" label="Completas" value={data?.completedTasks || 0} gradient="green" />
        <StatCard icon="🗺️" label="Tesouro" value={`${Math.round(parseFloat(data?.treasureProgress || "0"))}%`} gradient="blue" />
      </div>

      {/* Treasure Progress - Enhanced */}
      <div className="relative z-10 max-w-3xl mx-auto px-4 mt-8">
        <div className="backdrop-blur-md bg-white/40 border border-white/60 rounded-3xl p-6 shadow-lg">
          <h2 className="text-2xl font-black text-purple-900 mb-4 flex items-center gap-2">
            <span className="text-3xl">🗺️</span> Progresso do Tesouro
          </h2>
          <div className="relative h-6 bg-white/50 rounded-full overflow-hidden border-2 border-purple-300 shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 transition-all duration-700 ease-out rounded-full"
              style={{ width: `${parseFloat(data?.treasureProgress || "0")}%` }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
          </div>
          <p className="text-center mt-4 font-bold text-lg text-purple-800">
            {Math.round(parseFloat(data?.treasureProgress || "0"))}% do caminho! 🎉
          </p>
        </div>
      </div>

      {/* Daily Tasks - Modern Cards */}
      <div className="relative z-10 max-w-3xl mx-auto px-4 mt-8">
        <h2 className="text-3xl font-black text-purple-900 mb-5 flex items-center gap-2">
          <span className="text-4xl">📋</span> Tarefas de Hoje
        </h2>

        {tasksQuery.data && tasksQuery.data.length > 0 ? (
          <div className="space-y-4">
            {tasksQuery.data.map((task) => (
              <div
                key={task.id}
                className={`group backdrop-blur-md border-2 rounded-2xl p-5 transition-all duration-300 ${
                  task.completed
                    ? "bg-green-100/40 border-green-300 opacity-75"
                    : "bg-white/40 border-white/60 hover:bg-white/60 hover:border-purple-300 hover:shadow-lg hover:scale-102"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-black text-lg text-purple-900 mb-1">{task.title}</h3>
                    {task.description && (
                      <p className="text-sm text-purple-700 mb-3">{task.description}</p>
                    )}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-1 bg-gradient-to-r from-yellow-300 to-yellow-200 text-yellow-900 px-3 py-1 rounded-full font-bold text-xs border border-yellow-400 shadow-sm">
                        ⭐ {task.points} pts
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full font-bold text-xs border shadow-sm ${
                          task.priority === "high"
                            ? "bg-gradient-to-r from-red-300 to-red-200 text-red-900 border-red-400"
                            : task.priority === "medium"
                            ? "bg-gradient-to-r from-orange-300 to-orange-200 text-orange-900 border-orange-400"
                            : "bg-gradient-to-r from-green-300 to-green-200 text-green-900 border-green-400"
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
                    onClick={() => {
                      handleCompleteTask(task.id);
                      setShowConfetti(true);
                    }}
                    disabled={completeTaskMutation.isPending}
                    className="ml-4 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-black rounded-xl hover:from-purple-700 hover:to-pink-600 active:scale-95 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap flex items-center gap-2"
                  >
                    {completeTaskMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        ✅ Fazer
                      </>
                    )}
                  </button>
                  )}
                  {task.completed && (
                    <div className="text-4xl animate-bounce-in">✨</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="backdrop-blur-md bg-white/40 border-2 border-white/60 rounded-2xl text-center py-12 shadow-lg">
            <p className="text-2xl font-black text-purple-900">Nenhuma tarefa para hoje! 🎉</p>
            <p className="text-purple-700 mt-2">Você está em dia com suas missões!</p>
          </div>
        )}
      </div>

      {/* Medals Section */}
      {data?.medals && data.medals.length > 0 && (
        <div className="relative z-10 max-w-3xl mx-auto px-4 mt-8">
          <h2 className="text-3xl font-black text-purple-900 mb-5 flex items-center gap-2">
            <span className="text-4xl">🏆</span> Medalhas Conquistadas
          </h2>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {data.medals.map((medal) => (
              <div
                key={medal.id}
                className="group backdrop-blur-md bg-white/40 border-2 border-white/60 rounded-2xl p-3 flex items-center justify-center aspect-square hover:bg-white/60 hover:scale-110 transition-all duration-300 shadow-lg cursor-pointer"
                title={medal.name}
              >
                <div className="text-4xl animate-bounce-in">{medal.icon}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Navigation Button */}
      <div className="relative z-10 max-w-3xl mx-auto px-4 mt-8 pb-4">
        <button
          onClick={() => navigate("/pais/login")}
          className="w-full px-6 py-4 bg-gradient-to-r from-purple-700 to-pink-600 text-white font-black text-lg rounded-2xl hover:from-purple-800 hover:to-pink-700 active:scale-95 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          👨‍👩‍👧 Painel dos Pais
        </button>
      </div>

      {/* Confetti Animation */}
      <ConfettiAnimation isActive={showConfetti} />
    </div>
  );
}
