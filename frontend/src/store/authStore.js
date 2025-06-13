import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authApi } from "../front2backconnect/api";

// Create auth store with persistence
const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isAdmin: false,
      isLoading: false,
      error: null,
      // Actions
      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.login(credentials);
          const { user, token, isAdmin } = response.data;

          set({
            user,
            token,
            isAdmin,
            isAuthenticated: true,
            isLoading: false,
          });

          return { success: true };
        } catch (error) {
          set({
            error: error.response?.data?.message || "Login failed",
            isLoading: false,
          });

          // Special case for unverified emails
          if (error.response?.data?.needsVerification) {
            return {
              success: false,
              error: error.response?.data?.error || "Email not verified",
              needsVerification: true,
              email: error.response?.data?.email,
            };
          }

          return {
            success: false,
            error: error.response?.data?.error || "Login failed",
          };
        }
      }, // Handle Social Login Success
      handleSSOSuccess: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.checkAuthSuccess();
          const { user, token } = response.data;

          set({
            user,
            token,
            isAdmin: user.isAdmin || false,
            isAuthenticated: true,
            isLoading: false,
          });

          return { success: true };
        } catch (error) {
          set({
            error: error.response?.data?.message || "SSO authentication failed",
            isLoading: false,
          });
          return {
            success: false,
            error: error.response?.data?.message || "SSO authentication failed",
          };
        }
      },
      signup: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          console.log("Signing up user:", userData.email);
          const response = await authApi.signup(userData);
          console.log("Signup response:", response.data);

          // Check for successful signup
          if (response.data && response.data.success) {
            // Typically just register the user, but don't login automatically
            set({ isLoading: false });
            return {
              success: true,
              message:
                response.data.message || "Signup successful! Please log in.",
            };
          } else {
            throw new Error(
              response.data?.error || "Signup failed with unknown error"
            );
          }
        } catch (error) {
          console.error("Signup error:", error);
          const errorMessage =
            error.response?.data?.error ||
            error.response?.data?.message ||
            error.message ||
            "Signup failed";

          set({
            error: errorMessage,
            isLoading: false,
          });

          return {
            success: false,
            error: errorMessage,
          };
        }
      },
      logout: async () => {
        set({ isLoading: true });
        console.log("Logging out user...");

        // Check if we're logging out the hardcoded admin account
        const currentState = get();
        if (currentState.user?.email === "admin@example.com") {
          console.log("Logging out hardcoded admin account");
          // Just reset state without making API call for hardcoded admin
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isAdmin: false,
            isLoading: false,
            error: null,
          });

          // Clear any stored tokens
          localStorage.removeItem("sso-token");

          return;
        }

        try {
          console.log("Calling logout API endpoint");
          const response = await authApi.logout();

          // Clear all auth-related storage
          localStorage.removeItem("sso-token");

          // Debugging output
          console.log("Logout response:", response.data);
          console.log("Cleared auth tokens from storage");

          // Reset the auth state
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isAdmin: false,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          console.error("Logout error:", error);

          // Even if the API call fails, clear local state for better UX
          localStorage.removeItem("sso-token");

          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isAdmin: false,
            error: error.response?.data?.message || "Logout failed",
            isLoading: false,
          });
        }
      },
      checkAuth: async () => {
        set({ isLoading: true });

        // Check if we already have a hard-coded admin in state
        const currentState = get();
        if (
          currentState.user?.email === "admin@example.com" &&
          currentState.isAdmin &&
          currentState.isAuthenticated
        ) {
          set({ isLoading: false });
          return true;
        }

        try {
          const response = await authApi.getCurrentUser();
          const { user, isAdmin } = response.data;

          set({
            user,
            isAdmin,
            isAuthenticated: true,
            isLoading: false,
          });

          return true;
        } catch (error) {
          set({
            user: null,
            isAuthenticated: false,
            isAdmin: false,
            isLoading: false,
          });
          return false;
        }
      }, // Helper function to check if user can edit an employee
      canEditEmployee: (employeeEmail) => {
        const { isAdmin } = get();
        // Only admins can edit employees
        return isAdmin;
      },
    }),
    {
      name: "auth-storage", // name for the storage
      getStorage: () => localStorage, // use localStorage for persistence
    }
  )
);

export default useAuthStore;
