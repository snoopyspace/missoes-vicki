import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export function WeeklyChallenges() {
  const { data: challenges, isLoading } = trpc.challenges.getWeekly.useQuery();

  if (isLoading) {
    return <div className="text-center text-purple-600">Carregando desafios...</div>;
  }

  if (!challenges || challenges.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-black text-purple-700 uppercase">🎯 Desafios da Semana</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {challenges.map((challenge) => (
          <Card key={challenge.id} className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 hover:shadow-lg transition-all">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-4xl mb-2">{challenge.icon}</p>
                <h3 className="font-black text-purple-700 uppercase text-sm">{challenge.title}</h3>
              </div>
              <div className="text-right">
                <p className="text-xs text-purple-600 font-bold">Bônus</p>
                <p className="text-lg font-black text-purple-700">{challenge.bonusMultiplier}x</p>
              </div>
            </div>

            <p className="text-xs text-purple-600 mb-4">{challenge.description}</p>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-purple-700">Progresso</span>
                <span className="text-purple-600">{challenge.currentProgress}/{challenge.targetCount}</span>
              </div>
              <Progress
                value={(((challenge.currentProgress || 0) / challenge.targetCount) * 100)}
                className="h-2"
              />
            </div>

            {challenge.isCompleted && (
              <div className="mt-4 p-2 bg-green-100 border border-green-300 rounded-lg text-center">
                <p className="text-xs font-black text-green-700">✓ COMPLETO!</p>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
