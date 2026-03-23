import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Loader2, Plus, Edit2, Trash2, LogOut } from "lucide-react";

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
  const medalsQuery = trpc.medals.list.useQuery();

  const createTaskMutation = trpc.tasks.create.useMutation();
  const deleteTaskMutation = trpc.tasks.delete.useMutation();

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createTaskMutation.mutateAsync(newTask);
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
    } catch (error) {
      console.error("Erro ao criar tarefa:", error);
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    if (confirm("Tem certeza que deseja deletar esta tarefa?")) {
      try {
        await deleteTaskMutation.mutateAsync(taskId);
        tasksQuery.refetch();
        dashboardQuery.refetch();
      } catch (error) {
        console.error("Erro ao deletar tarefa:", error);
      }
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("parentAuth");
    navigate("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[rgb(255_250_245)] to-[rgb(254_215_170)] flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[rgb(255_250_245)] to-[rgb(254_215_170)] pb-20 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-10 left-10 w-20 h-20 memphis-circle bg-[rgb(167_243_208)] opacity-20 animate-float" />
      <div className="absolute top-40 right-20 w-32 h-32 memphis-triangle bg-[rgb(221_214_254)] opacity-15 animate-float" style={{ animationDelay: "1s" }} />

      {/* Header */}
      <div className="relative z-10 pt-6 px-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between mb-8">
          <div>
            <h1 className="memphis-text text-4xl">👨‍👩‍👧 Painel dos Pais</h1>
            <p className="text-gray-600 font-semibold">Gerenciar progresso da Vicki</p>
          </div>
          <button
            onClick={handleLogout}
            className="btn-secondary flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 mb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="card-memphis bg-white">
            <div className="text-center">
              <div className="text-3xl mb-2">⭐</div>
              <p className="text-xs text-gray-600 font-bold">PONTOS TOTAIS</p>
              <p className="text-2xl font-bold text-accent">{dashboardQuery.data?.totalPoints || 0}</p>
            </div>
          </div>

          <div className="card-memphis bg-white">
            <div className="text-center">
              <div className="text-3xl mb-2">🏆</div>
              <p className="text-xs text-gray-600 font-bold">MEDALHAS</p>
              <p className="text-2xl font-bold text-accent">{dashboardQuery.data?.unlockedMedals || 0}</p>
            </div>
          </div>

          <div className="card-memphis bg-white">
            <div className="text-center">
              <div className="text-3xl mb-2">✅</div>
              <p className="text-xs text-gray-600 font-bold">TAREFAS FEITAS</p>
              <p className="text-2xl font-bold text-accent">{dashboardQuery.data?.completedTasks || 0}</p>
            </div>
          </div>

          <div className="card-memphis bg-white">
            <div className="text-center">
              <div className="text-3xl mb-2">🗺️</div>
              <p className="text-xs text-gray-600 font-bold">TESOURO</p>
              <p className="text-2xl font-bold text-accent">{Math.round(parseFloat(dashboardQuery.data?.treasureProgress || "0"))}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Create Task Section */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 mb-8">
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="btn-primary flex items-center gap-2 w-full md:w-auto"
        >
          <Plus className="w-4 h-4" />
          Nova Tarefa
        </button>

        {showCreateForm && (
          <div className="card-memphis bg-white mt-4">
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Título
                </label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-foreground rounded-lg font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Descrição
                </label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-foreground rounded-lg font-bold"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Categoria
                  </label>
                  <select
                    value={newTask.category}
                    onChange={(e) => setNewTask({ ...newTask, category: e.target.value as any })}
                    className="w-full px-4 py-2 border-2 border-foreground rounded-lg font-bold"
                  >
                    <option value="daily">Diária</option>
                    <option value="weekly">Semanal</option>
                    <option value="monthly">Mensal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Prioridade
                  </label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as any })}
                    className="w-full px-4 py-2 border-2 border-foreground rounded-lg font-bold"
                  >
                    <option value="low">Baixa</option>
                    <option value="medium">Média</option>
                    <option value="high">Alta</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Pontos
                </label>
                <input
                  type="number"
                  value={newTask.points}
                  onChange={(e) => setNewTask({ ...newTask, points: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border-2 border-foreground rounded-lg font-bold"
                  min="1"
                  required
                />
              </div>

              <div className="flex gap-2">
                <button type="submit" className="btn-primary flex-1">
                  ✅ Criar Tarefa
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="btn-secondary flex-1"
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
        <h2 className="memphis-text text-2xl mb-4">📋 Todas as Tarefas</h2>
        {tasksQuery.data && tasksQuery.data.length > 0 ? (
          <div className="space-y-3">
            {tasksQuery.data.map((task) => (
              <div key={task.id} className="task-item flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800">{task.title}</h3>
                  {task.description && (
                    <p className="text-sm text-gray-600">{task.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-bold">
                      ⭐ {task.points} pts
                    </span>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-bold">
                      {task.category === "daily"
                        ? "📅 Diária"
                        : task.category === "weekly"
                        ? "📆 Semanal"
                        : "📊 Mensal"}
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
                    {task.completed && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-bold">
                        ✅ Completa
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteTask(task.id)}
                  className="ml-4 p-2 hover:bg-red-100 rounded-lg transition-colors"
                  title="Deletar tarefa"
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="card-memphis bg-white text-center py-8">
            <p className="text-gray-600 font-semibold">Nenhuma tarefa criada ainda</p>
          </div>
        )}
      </div>

      {/* History Section */}
      <div className="relative z-10 max-w-4xl mx-auto px-4">
        <h2 className="memphis-text text-2xl mb-4">📜 Histórico de Tarefas</h2>
        {historyQuery.data && historyQuery.data.length > 0 ? (
          <div className="space-y-2">
            {historyQuery.data.slice(0, 10).map((item) => (
              <div key={item.id} className="card-memphis bg-white py-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-gray-800">{item.title}</p>
                    <p className="text-xs text-gray-600">
                      {new Date(item.completedAt).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-accent">+{item.pointsEarned} pts</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card-memphis bg-white text-center py-8">
            <p className="text-gray-600 font-semibold">Nenhuma tarefa completada ainda</p>
          </div>
        )}
      </div>
    </div>
  );
}
