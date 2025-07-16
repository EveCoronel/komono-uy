export async function addFavorite(user_id, productId) {
    const res = await fetch(`/api/users/${user_id}/favorites/`, {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
    });
    if (!res.ok) throw new Error("Error al agregar a favoritos");
    return res.json();
}

export async function removeFavorite(user_id, productId) {
    const res = await fetch(`/api/users/${user_id}/favorites/`, {
        method: 'DELETE',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
    });
    if (!res.ok) throw new Error("Error al quitar de favoritos");
    return res.json();
}