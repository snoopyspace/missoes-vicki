import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function RewardsShop() {
  const { data: rewards, isLoading } = trpc.rewards.getAll.useQuery();
  const { data: points } = trpc.stats.getDashboard.useQuery();
  const redeemMutation = trpc.rewards.redeem.useMutation();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const categories = ["experience", "physical", "digital"];
  const categoryLabels = {
    experience: "🎉 Experiências",
    physical: "🎁 Físicas",
    digital: "💻 Digitais",
  };

  const filteredRewards = selectedCategory === "all"
    ? rewards
    : rewards?.filter(r => r.category === selectedCategory);

  const handleRedeem = async (rewardId: number, cost: number) => {
    const availablePoints = points?.totalPoints || 0;

    if (availablePoints < cost) {
      toast.error(`Você precisa de ${cost - availablePoints} pontos a mais!`);
      return;
    }

    try {
      const result = await redeemMutation.mutateAsync(rewardId);
      if (result) {
        toast.success(`Recompensa resgatada! Código: ${result.redeemCode}`);
      }
    } catch (error) {
      toast.error("Erro ao resgatar recompensa");
    }
  };

  if (isLoading) {
    return <div className="text-center text-purple-600">Carregando loja...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-purple-700 uppercase">🏪 Loja de Recompensas</h2>
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-full font-black text-lg">
          💰 {points?.totalPoints || 0} pontos
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap">
        <Button
          onClick={() => setSelectedCategory("all")}
          className={`px-4 py-2 rounded-full font-bold transition-all ${
            selectedCategory === "all"
              ? "bg-purple-600 text-white"
              : "bg-purple-100 text-purple-700 hover:bg-purple-200"
          }`}
        >
          Todas
        </Button>
        {categories.map((cat) => (
          <Button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-full font-bold transition-all ${
              selectedCategory === cat
                ? "bg-purple-600 text-white"
                : "bg-purple-100 text-purple-700 hover:bg-purple-200"
            }`}
          >
            {categoryLabels[cat as keyof typeof categoryLabels]}
          </Button>
        ))}
      </div>

      {/* Rewards Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredRewards?.map((reward) => (
          <Card
            key={reward.id}
            className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 hover:shadow-lg transition-all flex flex-col"
          >
            <div className="flex items-start justify-between mb-4">
              <p className="text-4xl">{reward.icon}</p>
              <div className="text-right">
                <p className="text-xs text-purple-600 font-bold">Custo</p>
                <p className="text-lg font-black text-purple-700">{reward.pointsCost}</p>
              </div>
            </div>

            <h3 className="font-black text-purple-700 uppercase text-sm mb-2">{reward.title}</h3>
            <p className="text-xs text-purple-600 mb-4 flex-grow">{reward.description}</p>

            <Button
              onClick={() => handleRedeem(reward.id, reward.pointsCost)}
              disabled={
                redeemMutation.isPending ||
                (points?.totalPoints || 0) < reward.pointsCost
              }
              className={`w-full font-bold py-2 rounded-lg transition-all ${
                (points?.totalPoints || 0) < reward.pointsCost
                  ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                  : "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 active:scale-95"
              }`}
            >
              {redeemMutation.isPending ? "Resgatando..." : "Resgatar"}
            </Button>
          </Card>
        ))}
      </div>

      {filteredRewards?.length === 0 && (
        <div className="text-center py-12">
          <p className="text-purple-600 font-bold">Nenhuma recompensa disponível nesta categoria</p>
        </div>
      )}
    </div>
  );
}
