export async function fetchGameData() {
    const response = await fetch("/api/player-stats", {
        credentials: "include",
        cache: "no-store",
    });

    if (!response.ok) {
        throw new Error("Failed to fetch player stats");
    }

    return response.json();
}
