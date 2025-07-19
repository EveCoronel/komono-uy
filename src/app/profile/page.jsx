"use client";
import { useRouter } from "next/navigation";
import { Button } from "@components/ui/button";
import { useAuth } from "@/context/AuthContext";
import OrdersGrid from "@/components/OrdersGrid";
import ProfileInfo from "@/components/ProfileInfo";
import RequireLoginMessage from "@/components/RequireLoginMessage";
export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });

      if (response.ok) {
        setUser(null);
        router.push('/');
        router.refresh();
      }
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (!user) {
    return <RequireLoginMessage />;
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Mi cuenta</h1>
        <Button variant="outline" onClick={handleLogout}>
          Cerrar sesión
        </Button>
      </div>

      <section className="mb-8">
        <ProfileInfo />
      </section>

      {/* <section className="mb-8">
        <AddressesGrid />
      </section> */}

      <section>
        <h2 className="text-xl font-semibold mb-2">Mis órdenes</h2>
        <OrdersGrid userId={user._id} />
      </section>
    </div>
  );
}