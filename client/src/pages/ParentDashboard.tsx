import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { AdminPanel } from "@/components/AdminPanel";
import { Loader2, Plus, Trash2, LogOut } from "lucide-react";
import { toast } from "sonner";

export default function ParentDashboard() {
  const [, navigate] = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    category: "daily" as const,
    points: 10,
    priority: "medium" as const,
  });

  // Check authentication
  useEffect(() => {
    const isAuth = sessionStorage.getItem("parentAuth");
    if (!isAuth) {
      navigate("/pais/login");
    } else {
      setIsLoading(false);
    }
  }, [navigate]);

  // Fetch data
  const tasksQuery = trpc.tasks.list.useQuery();
  const dashboardQuery = trpc.stats.getDashboard.useQuery();
  const historyQuery = trpc.history.list.useQuery();

  const createTaskMutation = trpc.tasks.create.useMutation({
    onSuccess: () => {
      toast.success("✅ Tarefa criada com sucesso!");
      setNewTask({
        title: "",
        description: "",
        category: "daily",
        points: 10,
        priority: "medium",
      });
      setShowCreateForm(false);
      tasksQuery.refetch();
      dashboardQuery.refetch();
    },
    onError: (error) => {
      toast.error("Erro ao criar tarefa", {
        description: error.message,
      });
    },
  });

  const deleteTaskMutation = trpc.tasks.delete.useMutation({
    onSuccess: () => {
      toast.success("🗑️ Tarefa deletada!");
      tasksQuery.refetch();
      dashboardQuery.refetch();
    },
    onError: (error) => {
      toast.error("Erro ao deletar tarefa", {
        description: error.message,
      });
    },
  });

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title.trim()) {
      toast.error("Título é obrigatório");
      return;
    }
    createTaskMutation.mutate(newTask);
  };

  const handleDeleteTask = (taskId: number) => {
    if (confirm("Tem certeza que deseja deletar esta tarefa?")) {
      deleteTaskMutation.mutate(taskId);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("parentAuth");
    navigate("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-purple-100 to-purple-200 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-purple-600" />
          <p className="text-purple-700 font-semibold">Carregando painel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-purple-100 to-purple-200 pb-20 relative overflow-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" />
        <div className="absolute top-40 right-20 w-40 h-40 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{ animationDelay: "2s" }} />
        <div className="absolute bottom-20 left-1/3 w-36 h-36 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{ animationDelay: "4s" }} />
      </div>

      {/* Header */}
      <div className="relative z-10 pt-8 px-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between mb-8">
          <div>
            <h1 className="text-5xl font-black bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 bg-clip-text text-transparent">
              👨‍👩‍👧 Painel dos Pais
            </h1>
            <p className="text-lg text-purple-700 font-semibold mt-1">Gerenciar progresso da Vicki</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold rounded-xl hover:from-red-600 hover:to-pink-600 active:scale-95 transition-all duration-200 shadow-lg flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 mb-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="backdrop-blur-md bg-white/40 border border-white/60 rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all">
          <div className="text-center">
            <div className="text-4xl mb-2">⭐</div>
            <p className="text-xs text-purple-700 font-bold uppercase">Pontos</p>
            <p className="text-3xl font-black text-purple-600">{dashboardQuery.data?.totalPoints || 0}</p>
          </div>
        </div>

        <div className="backdrop-blur-md bg-white/40 border border-white/60 rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all">
          <div className="text-center">
            <div className="text-4xl mb-2">🏆</div>
            <p className="text-xs text-purple-700 font-bold uppercase">Medalhas</p>
            <p className="text-3xl font-black text-purple-600">{dashboardQuery.data?.unlockedMedals || 0}</p>
          </div>
        </div>

        <div className="backdrop-blur-md bg-white/40 border border-white/60 rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all">
          <div className="text-center">
            <div className="text-4xl mb-2">✅</div>
            <p className="text-xs text-purple-700 font-bold uppercase">Completas</p>
            <p className="text-3xl font-black text-purple-600">{dashboardQuery.data?.completedTasks || 0}</p>
          </div>
        </div>

        <div className="backdrop-blur-md bg-white/40 border border-white/60 rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all">
          <div className="text-center">
            <div className="text-4xl mb-2">🗺️</div>
            <p className="text-xs text-purple-700 font-bold uppercase">Tesouro</p>
            <p className="text-3xl font-black text-purple-600">{Math.round(parseFloat(dashboardQuery.data?.treasureProgress || "0"))}%</p>
          </div>
        </div>
      </div>

      {/* Create Task Button */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 mb-8">
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold rounded-xl hover:from-purple-700 hover:to-pink-600 active:scale-95 transition-all duration-200 shadow-lg"
        >
          <Plus className="w-5 h-5" />
          Nova Tarefa
        </button>

        {showCreateForm && (
          <div className="mt-6 backdrop-blur-md bg-white/40 border-2 border-white/60 rounded-2xl p-6 shadow-lg">
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-purple-900 mb-2">
                  Título *
                </label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="w-full px-4 py-3 bg-white/50 border-2 border-purple-300 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  placeholder="Ex: Fazer lição de casa"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-purple-900 mb-2">
                  Descrição
                </label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  className="w-full px-4 py-3 bg-white/50 border-2 border-purple-300 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  placeholder="Detalhes da tarefa..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-purple-900 mb-2">
                    Categoria
                  </label>
                  <select
                    value={newTask.category}
                    onChange={(e) => setNewTask({ ...newTask, category: e.target.value as any })}
                    className="w-full px-4 py-3 bg-white/50 border-2 border-purple-300 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-purple-600"
                  >
                    <option value="daily">📅 Diária</option>
                    <option value="weekly">📆 Semanal</option>
                    <option value="monthly">📊 Mensal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-purple-900 mb-2">
                    Prioridade
                  </label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as any })}
                    className="w-full px-4 py-3 bg-white/50 border-2 border-purple-300 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-purple-600"
                  >
                    <option value="low">✨ Baixa</option>
                    <option value="medium">⚡ Média</option>
                    <option value="high">🔥 Alta</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-purple-900 mb-2">
                  Pontos
                </label>
                <input
                  type="number"
                  value={newTask.points}
                  onChange={(e) => setNewTask({ ...newTask, points: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 bg-white/50 border-2 border-purple-300 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-purple-600"
                  min="1"
                  required
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={createTaskMutation.isPending}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-xl hover:from-green-600 hover:to-emerald-600 active:scale-95 transition-all disabled:opacity-50"
                >
                  {createTaskMutation.isPending ? "Criando..." : "✅ Criar Tarefa"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-gray-400 to-gray-500 text-white font-bold rounded-xl hover:from-gray-500 hover:to-gray-600 active:scale-95 transition-all"
                >
                  ❌ Cancelar
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Tasks List */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 mb-8">
        <h2 className="text-3xl font-black text-purple-900 mb-5">📋 Todas as Tarefas</h2>
        {tasksQuery.data && tasksQuery.data.length > 0 ? (
          <div className="space-y-3">
            {tasksQuery.data.map((task) => (
              <div
                key={task.id}
                className="backdrop-blur-md bg-white/40 border-2 border-white/60 rounded-2xl p-5 hover:bg-white/60 transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-black text-lg text-purple-900 mb-1">{task.title}</h3>
                    {task.description && (
                      <p className="text-sm text-purple-700 mb-3">{task.description}</p>
                    )}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="badge-gradient bg-gradient-to-r from-yellow-300 to-yellow-200 text-yellow-900 border-yellow-400">
                        ⭐ {task.points} pts
                      </span>
                      <span className="badge-gradient bg-gradient-to-r from-blue-300 to-blue-200 text-blue-900 border-blue-400">
                        {task.category === "daily"
                          ? "📅 Diária"
                          : task.category === "weekly"
                          ? "📆 Semanal"
                          : "📊 Mensal"}
                      </span>
                      <span
                        className={`badge-gradient ${
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
                      {task.completed && (
                        <span className="badge-gradient bg-gradient-to-r from-green-300 to-green-200 text-green-900 border-green-400">
                          ✅ Completa
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    disabled={deleteTaskMutation.isPending}
                    className="ml-4 p-3 hover:bg-red-100 rounded-xl transition-colors disabled:opacity-50"
                    title="Deletar tarefa"
                  >
                    <Trash2 className="w-5 h-5 text-red-600" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="backdrop-blur-md bg-white/40 border-2 border-white/60 rounded-2xl text-center py-12">
            <p className="text-xl font-black text-purple-900">Nenhuma tarefa criada</p>
          </div>
        )}
      </div>

      {/* History Section */}
      <div className="relative z-10 max-w-4xl mx-auto px-4">
        <h2 className="text-3xl font-black text-purple-900 mb-5">📜 Histórico</h2>
        {historyQuery.data && historyQuery.data.length > 0 ? (
          <div className="space-y-2">
            {historyQuery.data.slice(0, 10).map((item) => (
              <div
                key={item.id}
                className="backdrop-blur-md bg-white/40 border border-white/60 rounded-xl p-4 hover:bg-white/60 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-purple-900">{item.title}</p>
                    <p className="text-xs text-purple-600">
                      {new Date(item.completedAt).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-lg bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
                      +{item.pointsEarned} pts
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="backdrop-blur-md bg-white/40 border-2 border-white/60 rounded-2xl text-center py-12">
            <p className="text-xl font-black text-purple-900">Nenhuma tarefa completada ainda</p>
          </div>
        )}
      </div>

      {/* Admin Panel */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 mt-12 mb-8">
        <AdminPanel />
      </div>
    </div>
  );
}
