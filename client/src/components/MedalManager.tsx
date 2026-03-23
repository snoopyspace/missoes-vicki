import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Trash2, Plus } from "lucide-react";

const EMOJI_ICONS = ["🏆", "⭐", "🎖️", "👑", "💎", "🔥", "⚡", "🌟", "🎯", "🚀", "💪", "🎨", "🎭", "🎪", "🎸"];
const CONDITIONS = [
  { value: "complete_5_tasks", label: "Completar 5 Tarefas" },
  { value: "complete_10_tasks", label: "Completar 10 Tarefas" },
  { value: "complete_20_tasks", label: "Completar 20 Tarefas" },
  { value: "earn_50_points", label: "Ganhar 50 Pontos" },
  { value: "earn_100_points", label: "Ganhar 100 Pontos" },
  { value: "earn_200_points", label: "Ganhar 200 Pontos" },
  { value: "combo_5", label: "Combo de 5 Tarefas" },
  { value: "combo_10", label: "Combo de 10 Tarefas" },
];

export function MedalManager() {
  const [showForm, setShowForm] = useState(false);
  const [newMedal, setNewMedal] = useState({
    name: "",
    description: "",
    icon: "🏆",
    condition: "complete_5_tasks",
  });

  const { data: medals } = trpc.medals.list.useQuery();
  const { data: medalProgress } = trpc.medals.getProgress.useQuery();
  const createMutation = trpc.medals.create.useMutation();
  const deleteMutation = trpc.medals.delete.useMutation();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMedal.name.trim()) {
      toast.error("Nome da medalha é obrigatório");
      return;
    }

    try {
      await createMutation.mutateAsync(newMedal);
      toast.success("Medalha criada com sucesso!");
      setNewMedal({
        name: "",
        description: "",
        icon: "🏆",
        condition: "complete_5_tasks",
      });
      setShowForm(false);
    } catch (error) {
      toast.error("Erro ao criar medalha");
    }
  };

  const handleDelete = async (medalId: number) => {
    if (!confirm("Tem certeza que deseja deletar esta medalha?")) return;
    try {
      await deleteMutation.mutateAsync(medalId);
      toast.success("Medalha deletada!");
    } catch (error) {
      toast.error("Erro ao deletar medalha");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-black text-purple-700 uppercase">🏅 Gerenciar Medalhas</h3>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold px-4 py-2 rounded-lg hover:from-purple-700 hover:to-pink-600 active:scale-95 transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nova Medalha
        </Button>
      </div>

      {/* Create Form */}
      {showForm && (
        <Card className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200">
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-purple-900 mb-2">Nome *</label>
              <input
                type="text"
                value={newMedal.name}
                onChange={(e) => setNewMedal({ ...newMedal, name: e.target.value })}
                className="w-full px-4 py-2 bg-white/50 border-2 border-purple-300 rounded-lg font-bold focus:outline-none focus:ring-2 focus:ring-purple-600"
                placeholder="Ex: Campeão de Tarefas"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-purple-900 mb-2">Descrição</label>
              <textarea
                value={newMedal.description}
                onChange={(e) => setNewMedal({ ...newMedal, description: e.target.value })}
                className="w-full px-4 py-2 bg-white/50 border-2 border-purple-300 rounded-lg font-bold focus:outline-none focus:ring-2 focus:ring-purple-600"
                placeholder="Descrição da medalha..."
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-purple-900 mb-2">Ícone</label>
                <div className="grid grid-cols-5 gap-2">
                  {EMOJI_ICONS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setNewMedal({ ...newMedal, icon: emoji })}
                      className={`text-2xl p-2 rounded-lg transition-all ${
                        newMedal.icon === emoji
                          ? "bg-purple-600 scale-110"
                          : "bg-white/50 hover:bg-white/80"
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-purple-900 mb-2">Condição</label>
                <select
                  value={newMedal.condition}
                  onChange={(e) => setNewMedal({ ...newMedal, condition: e.target.value })}
                  className="w-full px-4 py-2 bg-white/50 border-2 border-purple-300 rounded-lg font-bold focus:outline-none focus:ring-2 focus:ring-purple-600"
                >
                  {CONDITIONS.map((cond) => (
                    <option key={cond.value} value={cond.value}>
                      {cond.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-lg hover:from-green-600 hover:to-emerald-600 active:scale-95 transition-all disabled:opacity-50"
              >
                {createMutation.isPending ? "Criando..." : "✅ Criar Medalha"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 px-4 py-2 bg-gray-400 text-white font-bold rounded-lg hover:bg-gray-500 active:scale-95 transition-all"
              >
                ❌ Cancelar
              </button>
            </div>
          </form>
        </Card>
      )}

      {/* Medals List */}
      <div className="grid gap-4">
        {medals?.map((medal) => {
          const progress = medalProgress?.find(m => m.id === medal.id);
          return (
            <Card key={medal.id} className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-grow">
                  <div className="text-4xl">{medal.icon}</div>
                  <div>
                    <h4 className="font-bold text-purple-700">{medal.name}</h4>
                    <p className="text-sm text-purple-600">{medal.description}</p>
                    <p className="text-xs text-purple-500 mt-1">
                      Condição: {CONDITIONS.find(c => c.value === medal.condition)?.label}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {progress && (
                    <div className="text-right mr-4">
                      <p className="text-xs text-purple-600 font-bold">Progresso</p>
                      <div className="w-20 h-2 bg-purple-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-600 to-pink-500 transition-all"
                          style={{ width: `${progress.progress}%` }}
                        />
                      </div>
                      <p className="text-xs text-purple-700 font-bold mt-1">{progress.progress}%</p>
                    </div>
                  )}

                  <Button
                    onClick={() => handleDelete(medal.id)}
                    disabled={deleteMutation.isPending}
                    className="bg-red-500 hover:bg-red-600 text-white font-bold p-2 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {progress?.isUnlocked && (
                <div className="mt-3 p-2 bg-green-100 border border-green-300 rounded-lg text-center">
                  <p className="text-xs font-black text-green-700">✓ DESBLOQUEADA!</p>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {medals?.length === 0 && (
        <div className="text-center py-12">
          <p className="text-purple-600 font-bold">Nenhuma medalha criada ainda</p>
        </div>
      )}
    </div>
  );
}
