import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MedalManager } from "@/components/MedalManager";
import { VickiProfileManager } from "@/components/VickiProfileManager";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export function AdminPanel() {
  const [activeTab, setActiveTab] = useState<"tasks" | "challenges" | "rewards" | "medals" | "analytics" | "settings">("tasks");
  const { data: allTasks } = trpc.tasks.list.useQuery();
  const { data: challenges } = trpc.challenges.getWeekly.useQuery();
  const { data: rewards } = trpc.rewards.getAll.useQuery();
  const { data: analytics } = trpc.admin.getAnalytics.useQuery();
  const { data: points } = trpc.stats.getDashboard.useQuery();

  const updateTaskPointsMutation = trpc.admin.updateTaskPoints.useMutation();
  const resetProgressMutation = trpc.admin.resetProgress.useMutation();

  const handleUpdateTaskPoints = async (taskId: number, newPoints: number) => {
    try {
      await updateTaskPointsMutation.mutateAsync({ taskId, points: newPoints });
      toast.success("Pontos da tarefa atualizados!");
    } catch (error) {
      toast.error("Erro ao atualizar pontos");
    }
  };

  const handleResetProgress = async () => {
    if (!confirm("Tem certeza que deseja resetar todo o progresso da Vicki?")) return;
    try {
      await resetProgressMutation.mutateAsync();
      toast.success("Progresso resetado com sucesso!");
    } catch (error) {
      toast.error("Erro ao resetar progresso");
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex gap-2 flex-wrap border-b-2 border-purple-200 pb-4">
        {(["tasks", "challenges", "rewards", "medals", "analytics", "settings"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg font-bold transition-all uppercase text-sm ${
              activeTab === tab
                ? "bg-purple-600 text-white"
                : "bg-purple-100 text-purple-700 hover:bg-purple-200"
            }`}
          >
            {tab === "tasks" && "📋 Tarefas"}
            {tab === "challenges" && "🎯 Desafios"}
            {tab === "rewards" && "🎁 Recompensas"}
            {tab === "medals" && "🏅 Medalhas"}
            {tab === "analytics" && "📊 Analytics"}
            {tab === "settings" && "⚙️ Configurações"}
          </button>
        ))}
      </div>

      {/* Tasks Tab */}
      {activeTab === "tasks" && (
        <div className="space-y-4">
          <h3 className="text-xl font-black text-purple-700 uppercase">Gerenciar Tarefas</h3>
          <div className="grid gap-4">
            {allTasks?.map((task: any) => (
              <Card key={task.id} className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-grow">
                    <h4 className="font-bold text-purple-700">{task.title}</h4>
                    <p className="text-sm text-purple-600">{task.description}</p>
                    <p className="text-xs text-purple-500 mt-1">Categoria: {task.category}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={task.points}
                      onChange={(e) => handleUpdateTaskPoints(task.id, parseInt(e.target.value))}
                      className="w-16 px-2 py-1 border border-purple-300 rounded text-center font-bold"
                    />
                    <span className="text-sm font-bold text-purple-600">pts</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Challenges Tab */}
      {activeTab === "challenges" && (
        <div className="space-y-4">
          <h3 className="text-xl font-black text-purple-700 uppercase">Gerenciar Desafios</h3>
          <div className="grid gap-4">
            {challenges?.map((challenge) => (
              <Card key={challenge.id} className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-purple-700">{challenge.icon} {challenge.title}</h4>
                    <p className="text-sm text-purple-600">{challenge.description}</p>
                    <p className="text-xs text-purple-500 mt-1">
                      Progresso: {challenge.currentProgress}/{challenge.targetCount} | Bônus: {challenge.bonusMultiplier}x
                    </p>
                  </div>
                  <Button
                    className="bg-red-500 hover:bg-red-600 text-white font-bold"
                    onClick={() => toast.info("Deletar desafio - em desenvolvimento")}
                  >
                    Deletar
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Rewards Tab */}
      {activeTab === "rewards" && (
        <div className="space-y-4">
          <h3 className="text-xl font-black text-purple-700 uppercase">Gerenciar Recompensas</h3>
          <div className="grid gap-4">
            {rewards?.map((reward) => (
              <Card key={reward.id} className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-purple-700">{reward.icon} {reward.title}</h4>
                    <p className="text-sm text-purple-600">{reward.description}</p>
                    <p className="text-xs text-purple-500 mt-1">
                      Categoria: {reward.category} | Custo: {reward.pointsCost} pontos
                    </p>
                  </div>
                  <Button
                    className="bg-red-500 hover:bg-red-600 text-white font-bold"
                    onClick={() => toast.info("Deletar recompensa - em desenvolvimento")}
                  >
                    Deletar
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === "analytics" && (
        <div className="space-y-4">
          <h3 className="text-xl font-black text-purple-700 uppercase">📊 Analytics</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300">
              <p className="text-sm text-blue-600 font-bold">Total de Tarefas</p>
              <p className="text-3xl font-black text-blue-700">{analytics?.totalTasks || 0}</p>
            </Card>
            <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-300">
              <p className="text-sm text-green-600 font-bold">Tarefas Completas</p>
              <p className="text-3xl font-black text-green-700">{analytics?.completedTasks || 0}</p>
            </Card>
            <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-300">
              <p className="text-sm text-purple-600 font-bold">Taxa de Conclusão</p>
              <p className="text-3xl font-black text-purple-700">{analytics?.completionRate || 0}%</p>
            </Card>
            <Card className="p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-300">
              <p className="text-sm text-yellow-600 font-bold">Pontos Totais</p>
              <p className="text-3xl font-black text-yellow-700">{analytics?.totalPoints || 0}</p>
            </Card>
            <Card className="p-6 bg-gradient-to-br from-pink-50 to-pink-100 border-2 border-pink-300">
              <p className="text-sm text-pink-600 font-bold">Combo Atual</p>
              <p className="text-3xl font-black text-pink-700">{analytics?.currentCombo || 0}</p>
            </Card>
            <Card className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-300">
              <p className="text-sm text-orange-600 font-bold">Medalhas Desbloqueadas</p>
              <p className="text-3xl font-black text-orange-700">{analytics?.unlockedMedals || 0}</p>
            </Card>
          </div>
        </div>
      )}

      {/* Medals Tab */}
      {activeTab === "medals" && (
        <MedalManager />
      )}

      {/* Settings Tab */}
      {activeTab === "settings" && (
        <div className="space-y-6">
          <VickiProfileManager />
          
          <div className="space-y-4">
          <h3 className="text-xl font-black text-purple-700 uppercase">⚙️ Configurações</h3>
          <Card className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200">
            <div className="space-y-4">
              <div>
                <h4 className="font-bold text-purple-700 mb-2">Pontos Totais Atuais</h4>
                <p className="text-2xl font-black text-purple-600">{points?.totalPoints || 0}</p>
              </div>
              <Button
                onClick={handleResetProgress}
                disabled={resetProgressMutation.isPending}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg"
              >
                {resetProgressMutation.isPending ? "Resetando..." : "🔄 Resetar Todo o Progresso"}
              </Button>
              <p className="text-xs text-red-600 font-bold">
                ⚠️ Aviso: Esta ação não pode ser desfeita. Todos os pontos, combos e progresso serão zerados.
              </p>
            </div>
          </Card>
          </div>
        </div>
      )}
    </div>
  );
}
