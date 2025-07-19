"use client";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Bell, CheckCircle } from "lucide-react";
import clsx from "clsx";
import { useRouter } from "next/navigation";

export default function NotificationsModal({ open, onClose, notifications = [], onMarkAsRead }) {
  const router = useRouter();

  return (
    <Dialog.Root open={open} onOpenChange={val => !val && onClose?.()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" />
        <Dialog.Content className="fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md animate-in fade-in slide-in-from-top-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Bell className="text-orange-500" />
              <Dialog.Title className="text-lg font-semibold text-gray-800">Notificaciones</Dialog.Title>
            </div>
            <Dialog.Close asChild>
              <button className="text-gray-400 hover:text-gray-600" aria-label="Cerrar">
                <X className="w-5 h-5" />
              </button>
            </Dialog.Close>
          </div>

          {/* Descripción */}
          <Dialog.Description className="mb-3 text-sm text-gray-500">
            Tus últimas novedades y alertas
          </Dialog.Description>

          {/* Lista de notificaciones */}
          <div className="max-h-80 overflow-y-auto space-y-3 pr-1">
            {notifications.length === 0 ? (
              <div className="text-center text-gray-400 py-12">No tienes notificaciones.</div>
            ) : (
              notifications.map((n, i) => {
                const notificationContent = (
                  <div
                    key={n._id || i}
                    className={clsx(
                      "relative bg-orange-50 border-l-4 p-3 rounded-lg shadow-sm transition",
                      n.read ? "border-gray-300 opacity-60" : "border-orange-400"
                    )}
                  >
                    <div className="font-medium text-gray-800">{n.title}</div>
                    <div className="text-sm text-gray-600">{n.message}</div>
                    <div className="text-[11px] text-gray-400 mt-1">{n.date && new Date(n.date).toLocaleString()}</div>

                    {!n.read && (
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          onMarkAsRead?.(n._id);
                        }}
                        className="absolute top-2 right-2 text-gray-400 hover:text-green-500 transition"
                        aria-label="Marcar como leído"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                );
                if (n.link) {
                  return (
                    <div
                      key={n._id || i}
                      className="block w-full text-left hover:opacity-90 transition cursor-pointer"
                      onClick={async () => {
                        if (!n.read) await onMarkAsRead?.(n._id);
                        onClose?.();
                        router.push(n.link);
                      }}
                      tabIndex={0}
                      role="button"
                      onKeyDown={e => {
                        if (e.key === "Enter" || e.key === " ") {
                          if (!n.read) onMarkAsRead?.(n._id);
                          onClose?.();
                          router.push(n.link);
                        }
                      }}
                    >
                      {notificationContent}
                    </div>
                  );
                }
                return (
                  <div key={n._id || i}>{notificationContent}</div>
                );
              })
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
