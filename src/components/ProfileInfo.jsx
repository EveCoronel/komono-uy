'use client';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { Loader2, Pencil, Check, X } from 'lucide-react';
import { obfuscateEmail } from '@/lib/utils';
import ChangePasswordModal from './ChangePasswordModal';

export default function ProfileInfo() {
  const { user, refreshUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [loading, setLoading] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false); // Estado para el modal

  const handleSave = async () => {
    setLoading(true);
    const res = await fetch('/api/user', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    setLoading(false);
    if (res.ok) {
      toast.success('Perfil actualizado');
      setEditing(false);
      await refreshUser();
    } else {
      toast.error('Error al guardar');
    }
  };

  if (!user) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-lg">
          {user.name?.[0]?.toUpperCase() || '👤'}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Nombre</p>
            {!editing && (
              <button
                onClick={() => setShowPasswordModal(true)}
                className="text-sm text-orange-600 hover:text-orange-700 flex items-center gap-1"
              >
                <Pencil className="w-4 h-4" />
                Cambiar contraseña
              </button>
            )}
          </div>

          {editing ? (
            <div className="mt-2 flex gap-2 items-center">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border border-gray-300 px-3 py-1.5 rounded-md text-sm focus:ring-2 focus:ring-orange-300 focus:outline-none w-full"
              />
              <button
                onClick={handleSave}
                className="text-green-600 hover:text-green-700"
                disabled={loading}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              </button>
              <button onClick={() => setEditing(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <p className="text-base text-gray-800 font-medium mt-1">{user.name}</p>
          )}
        </div>
      </div>

      <div className="border-t pt-4">
        <p className="text-sm text-gray-500">Email</p>
        <p className="text-base text-gray-800 font-medium">{obfuscateEmail(user.email)}</p>
      </div>

      <ChangePasswordModal
        open={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
      />
    </div>
  );
}
