import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const AVATAR_OPTIONS = ["👧", "👦", "🧒", "👱‍♀️", "👩", "🧑", "🤖", "🦄", "🐱", "🐶", "🦊", "🐻", "🐼", "🦁", "🐯"];

export function VickiProfileManager() {
  const { data: profile } = trpc.profile.get.useQuery();
  const updateMutation = trpc.profile.update.useMutation();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: (profile as any)?.name || "Vicki",
    avatar: (profile as any)?.avatar || "👧",
    bio: (profile as any)?.bio || "",
    favoriteColor: (profile as any)?.favoriteColor || "#7c3aed",
  });

  const handleSave = async () => {
    try {
      await updateMutation.mutateAsync(editData);
      toast.success("Perfil da Vicki atualizado com sucesso!");
      setIsEditing(false);
    } catch (error) {
      toast.error("Erro ao atualizar perfil");
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-black text-purple-700 uppercase">👧 Perfil da Vicki</h3>

      {/* Profile Preview */}
      <Card className="p-8 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 text-center">
        <div className="text-6xl mb-4">{(profile as any)?.avatar || "👧"}</div>
        <h2 className="text-3xl font-black text-purple-700 mb-2">{(profile as any)?.name || "Vicki"}</h2>
        <p className="text-purple-600 font-bold mb-4">{(profile as any)?.bio || "Adorei completar tarefas!"}</p>
        <div className="w-12 h-12 rounded-full mx-auto" style={{ backgroundColor: (profile as any)?.favoriteColor || "#7c3aed" }} />
      </Card>

      {/* Edit Form */}
      {isEditing ? (
        <Card className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200">
          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-bold text-purple-900 mb-2">Nome</label>
              <input
                type="text"
                value={editData.name}
                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                className="w-full px-4 py-2 bg-white/50 border-2 border-purple-300 rounded-lg font-bold focus:outline-none focus:ring-2 focus:ring-purple-600"
                placeholder="Nome da Vicki"
              />
            </div>

            {/* Avatar */}
            <div>
              <label className="block text-sm font-bold text-purple-900 mb-2">Avatar</label>
              <div className="grid grid-cols-5 gap-2">
                {AVATAR_OPTIONS.map((avatar) => (
                  <button
                    key={avatar}
                    type="button"
                    onClick={() => setEditData({ ...editData, avatar })}
                    className={`text-3xl p-2 rounded-lg transition-all ${
                      editData.avatar === avatar
                        ? "bg-purple-600 scale-110"
                        : "bg-white/50 hover:bg-white/80"
                    }`}
                  >
                    {avatar}
                  </button>
                ))}
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-bold text-purple-900 mb-2">Bio</label>
              <textarea
                value={editData.bio}
                onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                className="w-full px-4 py-2 bg-white/50 border-2 border-purple-300 rounded-lg font-bold focus:outline-none focus:ring-2 focus:ring-purple-600"
                placeholder="Sobre a Vicki..."
                rows={2}
              />
            </div>

            {/* Favorite Color */}
            <div>
              <label className="block text-sm font-bold text-purple-900 mb-2">Cor Favorita</label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={editData.favoriteColor}
                  onChange={(e) => setEditData({ ...editData, favoriteColor: e.target.value })}
                  className="w-16 h-10 rounded-lg cursor-pointer border-2 border-purple-300"
                />
                <span className="text-sm font-bold text-purple-600">{editData.favoriteColor}</span>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={updateMutation.isPending}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-lg hover:from-green-600 hover:to-emerald-600 active:scale-95 transition-all disabled:opacity-50"
              >
                {updateMutation.isPending ? "Salvando..." : "✅ Salvar Alterações"}
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditData({
                    name: (profile as any)?.name || "Vicki",
                    avatar: (profile as any)?.avatar || "👧",
                    bio: (profile as any)?.bio || "",
                    favoriteColor: (profile as any)?.favoriteColor || "#7c3aed",
                  });
                }}
                className="flex-1 px-4 py-2 bg-gray-400 text-white font-bold rounded-lg hover:bg-gray-500 active:scale-95 transition-all"
              >
                ❌ Cancelar
              </button>
            </div>
          </div>
        </Card>
      ) : (
        <Button
          onClick={() => setIsEditing(true)}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold px-4 py-3 rounded-lg hover:from-purple-700 hover:to-pink-600 active:scale-95 transition-all"
        >
          ✏️ Editar Perfil
        </Button>
      )}
    </div>
  );
}
