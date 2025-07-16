import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export default function ProfileInfo() {
  const { user, refreshUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    const res = await fetch("/api/user", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    setLoading(false);
    if (res.ok) {
      toast.success("Perfil actualizado");
      setEditing(false);
      await refreshUser();
    } else {
      toast.error("Error al guardar");
    }
  };

  if (!user) return null;

  return (
    <div className="bg-white p-4 rounded shadow">
      {editing ? (
        <div className="flex items-center gap-4">
          <input
            className="border p-2 rounded"
            value={name}
            onChange={e => setName(e.target.value)}
          />
          <button className="btn" onClick={handleSave} disabled={loading}>
            Guardar
          </button>
          <button className="btn" onClick={() => setEditing(false)}>
            Cancelar
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-6">
          <p><strong>Nombre:</strong> {user.name}</p>
          <button className="btn" onClick={() => setEditing(true)}>
            Editar
          </button>
        </div>
      )}
      <p><strong>Email:</strong> {user.email}</p>
    </div>
  );
}
