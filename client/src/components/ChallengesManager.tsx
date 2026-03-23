import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function ChallengesManager() {
  const { data: challenges, refetch } = trpc.challenges.getWeekly.useQuery();
  const createMutation = trpc.management.createChallengeFull.useMutation();
  const updateMutation = trpc.management.updateChallengeFull.useMutation();
  const deleteMutation = trpc.management.deleteChallengeFull.useMutation();

  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    icon: "🎯",
    targetCount: 5,
    bonusMultiplier: "1.5",
  });

  const handleCreate = async () => {
    try {
      await createMutation.mutateAsync(formData);
      toast.success("Desafio criado com sucesso!");
      setFormData({ title: "", description: "", icon: "🎯", targetCount: 5, bonusMultiplier: "1.5" });
      setIsCreating(false);
      refetch();
    } catch (error) {
      toast.error("Erro ao criar desafio");
    }
  };

  const handleUpdate = async (id: number) => {
    try {
      await updateMutation.mutateAsync({ challengeId: id, ...formData });
      toast.success("Desafio atualizado!");
      setEditingId(null);
      refetch();
    } catch (error) {
      toast.error("Erro ao atualizar");
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Tem certeza que deseja deletar este desafio?")) {
      try {
        await deleteMutation.mutateAsync(id);
        toast.success("Desafio deletado!");
        refetch();
      } catch (error) {
        toast.error("Erro ao deletar");
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-black text-purple-700 uppercase">🎯 Gerenciar Desafios</h3>
        <Button
          onClick={() => setIsCreating(!isCreating)}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold"
        >
          {isCreating ? "Cancelar" : "+ Novo Desafio"}
        </Button>
      </div>

      {/* Create Form */}
      {isCreating && (
        <Card className="p-6 bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-300">
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Nome do desafio"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border-2 border-blue-300 rounded-lg font-bold"
            />
            <textarea
              placeholder="Descrição e explicação do desafio"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border-2 border-blue-300 rounded-lg font-bold"
              rows={3}
            />
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Ícone (emoji)"
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                className="px-4 py-2 border-2 border-blue-300 rounded-lg text-center font-bold text-2xl"
              />
              <input
                type="number"
                placeholder="Tarefas para completar"
                value={formData.targetCount}
                onChange={(e) => setFormData({ ...formData, targetCount: parseInt(e.target.value) })}
                className="px-4 py-2 border-2 border-blue-300 rounded-lg font-bold"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-blue-900 mb-2">Multiplicador de Pontos</label>
              <select
                value={formData.bonusMultiplier}
                onChange={(e) => setFormData({ ...formData, bonusMultiplier: e.target.value })}
                className="w-full px-4 py-2 border-2 border-blue-300 rounded-lg font-bold"
              >
                <option value="1.5">1.5x (50% bônus)</option>
                <option value="2.0">2.0x (100% bônus)</option>
                <option value="2.5">2.5x (150% bônus)</option>
                <option value="3.0">3.0x (200% bônus)</option>
              </select>
            </div>
            <Button
              onClick={handleCreate}
              disabled={createMutation.isPending}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3"
            >
              ✅ Criar Desafio
            </Button>
          </div>
        </Card>
      )}

      {/* Challenges List */}
      <div className="grid gap-4">
        {challenges?.map((challenge: any) => (
          <Card key={challenge.id} className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-grow">
                <h4 className="font-bold text-purple-700 text-lg">{challenge.icon} {challenge.title}</h4>
                <p className="text-sm text-purple-600 mt-1">{challenge.description}</p>
                <p className="text-xs text-purple-500 mt-2">
                  Meta: {challenge.targetCount} tarefas | Bônus: {challenge.bonusMultiplier}x | Progresso: {challenge.currentProgress}/{challenge.targetCount}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => handleDelete(challenge.id)}
                  className="bg-red-500 hover:bg-red-600 text-white font-bold px-3 py-2"
                >
                  🗑️
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
