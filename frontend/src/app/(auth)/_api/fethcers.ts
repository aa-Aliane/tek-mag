import api from "@/lib/api/client";

/* fetchers and queries related to the authenticated user and their permissions */

const fetchCurrentUser = async () => {
  try {
    const response = await api.get("/auth/me");
    return response.data;
  } catch (error) {
    console.error("Error fetching current user:", error);
    throw error;
  }
};

/* login fetcher */
const login = async (username: string, password: string) => {
  try {
    const response = await api.post("/auth/login", { username, password });
    return response.data;
  } catch (error) {
    console.error("Error during login:", error);
    throw error;
  }
};

const logout = async () => {
  try {
    await api.post("/auth/logout");
  } catch (error) {
    console.error("Error during logout:", error);
    throw error;
  }
};

export { fetchCurrentUser, login, logout };
