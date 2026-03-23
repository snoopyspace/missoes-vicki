import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function RewardsManager() {
  const { data: rewards, refetch } = trpc.rewards.getAll.useQuery();
  const createMutation = trpc.management.createRewardFull.useMutation();
  const updateMutation = trpc.management.updateRewardFull.useMutation();
  const deleteMutation = trpc.management.deleteRewardFull.useMutation();

  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    icon: "🎁",
    category: "digital",
    pointsCost: 100,
    quantity: 0,
  });

  const handleCreate = async () => {
    try {
      await createMutation.mutateAsync(formData);
      toast.success("Recompensa criada com sucesso!");
      setFormData({ title: "", description: "", icon: "🎁", category: "digital", pointsCost: 100, quantity: 0 });
      setIsCreating(false);
      refetch();
    } catch (error) {
      toast.error("Erro ao criar recompensa");
    }
  };

  const handleUpdate = async (id: number) => {
    try {
      await updateMutation.mutateAsync({ rewardId: id, ...formData });
      toast.success("Recompensa atualizada!");
      setEditingId(null);
      refetch();
    } catch (error) {
      toast.error("Erro ao atualizar");
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Tem certeza que deseja deletar esta recompensa?")) {
      try {
        await deleteMutation.mutateAsync(id);
        toast.success("Recompensa deletada!");
        refetch();
      } catch (error) {
        toast.error("Erro ao deletar");
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-black text-purple-700 uppercase">🎁 Gerenciar Recompensas</h3>
        <Button
          onClick={() => setIsCreating(!isCreating)}
          className="bg-green-500 hover:bg-green-600 text-white font-bold"
        >
          {isCreating ? "Cancelar" : "+ Nova Recompensa"}
        </Button>
      </div>

      {/* Create Form */}
      {isCreating && (
        <Card className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300">
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Nome da recompensa"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border-2 border-green-300 rounded-lg font-bold"
            />
            <textarea
              placeholder="Descrição detalhada"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border-2 border-green-300 rounded-lg font-bold"
              rows={2}
            />
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Ícone (emoji)"
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                className="px-4 py-2 border-2 border-green-300 rounded-lg text-center font-bold text-2xl"
              />
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="px-4 py-2 border-2 border-green-300 rounded-lg font-bold"
              >
                <option value="digital">Digital</option>
                <option value="physical">Física</option>
                <option value="experience">Experiência</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="number"
                placeholder="Custo em pontos"
                value={formData.pointsCost}
                onChange={(e) => setFormData({ ...formData, pointsCost: parseInt(e.target.value) })}
                className="px-4 py-2 border-2 border-green-300 rounded-lg font-bold"
              />
              <input
                type="number"
                placeholder="Quantidade (0=ilimitado)"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                className="px-4 py-2 border-2 border-green-300 rounded-lg font-bold"
              />
            </div>
            <Button
              onClick={handleCreate}
              disabled={createMutation.isPending}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3"
            >
              ✅ Criar Recompensa
            </Button>
          </div>
        </Card>
      )}

      {/* Rewards List */}
      <div className="grid gap-4">
        {rewards?.map((reward: any) => (
          <Card key={reward.id} className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-grow">
                <h4 className="font-bold text-purple-700 text-lg">{reward.icon} {reward.title}</h4>
                <p className="text-sm text-purple-600 mt-1">{reward.description}</p>
                <p className="text-xs text-purple-500 mt-2">
                  Categoria: {reward.category} | Custo: {reward.pointsCost} pts | Qtd: {reward.quantity === 0 ? "∞" : reward.quantity}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => handleDelete(reward.id)}
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
