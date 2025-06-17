import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authApi } from "../front2backconnect/api";

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isAdmin: false,
      isLoading: false,
      error: null,
      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.login(credentials);
          const { user } = response.data;
          const isAdmin = user && user.isAdmin === true;

          set({
            user,
            isAdmin,
            isAuthenticated: true,
            isLoading: false,
          });
          return { success: true };
        } catch (error) {
          set({
            error: "Login failed",
            isLoading: false,
          });

            if (error.response?.data?.needsVerification) {
            const email = error.response?.data?.email || "";
            return {
              success: false,
              error: "Email not verified",
              needsVerification: true,
              email: email,
            };
            }

          return {
            success: false,
            error: "Login failed",
          };
        }
      },
      handleSSOSuccess: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.checkAuthSuccess();
          const { user } = response.data;

          set({
            user,
            isAdmin: user.isAdmin || false,
            isAuthenticated: true,
            isLoading: false,
          });
          return { success: true };
        } catch {
          set({
            error: "SSO authentication failed",
            isLoading: false,
          });
          return {
            success: false,
            error: "SSO authentication failed",
          };
        }
      },
      signup: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.signup(userData);
          if (response.data && response.data.success) {
            set({ isLoading: false });
            return {
              success: true,
              message:
                response.data.message || "Signup successful! Please log in.",
            };
          } else {
            throw new Error("Signup failed with unknown error");
          }
        } catch {
          set({
            error: "Signup failed",
            isLoading: false,
          });

          return {
            success: false,
            error: "Signup failed",
          };
        }
      },
      logout: async () => {
        set({ isLoading: true });

        try {
          await authApi.logout();
          set({
            user: null,
            isAuthenticated: false,
            isAdmin: false,
            isLoading: false,
            error: null,
          });
        } catch {
          set({
            user: null,
            isAuthenticated: false,
            isAdmin: false,
            error: "Logout failed",
            isLoading: false,
          });
        }
      },
      checkAuth: async () => {
        set({ isLoading: true });
        try {
          const response = await authApi.getCurrentUser();
          const { user, employeeInfo } = response.data;
          const isAdmin = user && user.isAdmin === true;
          set({
            user: {
              ...user,
              employeeInfo: employeeInfo || null,
            },
            isAdmin,
            isAuthenticated: true,
            isLoading: false,
          });

          return true;
        } catch {
          set({
            user: null,
            isAuthenticated: false,
            isAdmin: false,
            isLoading: false,
          });
          return false;
        }
      },
      canEditEmployee: () => {
        const { isAdmin } = get();
        return isAdmin;
      },
    }),
    {
      name: "auth-storage",
      getStorage: () => localStorage,
      partialize: (state) => ({
        user: state.user,
        isAdmin: state.isAdmin,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;
