import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authApi } from "../front2backconnect/api";

// Create auth store with persistence
const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isAdmin: false,
      isLoading: false,
      error: null,
      // Actions
      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.login(credentials);
          const { user } = response.data;

          // Make sure we're correctly extracting isAdmin from the user object
          const isAdmin = user && user.isAdmin === true;
          console.log("Login successful, isAdmin:", isAdmin);

          set({
            user,
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
          const { user } = response.data;

          set({
            user,
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
            isAuthenticated: false,
            isAdmin: false,
            isLoading: false,
            error: null,
          });

          return;
        }

        try {
          console.log("Calling logout API endpoint");
          await authApi.logout();

          // Reset the auth state
          set({
            user: null,
            isAuthenticated: false,
            isAdmin: false,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          console.error("Logout error:", error);

          // Even if the API call fails, clear local state for better UX
          set({
            user: null,
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
          console.log("Admin user found in state, skipping API check");
          set({ isLoading: false });
          return true;
        }

        try {
          console.log("Checking authentication with backend...");
          const response = await authApi.getCurrentUser();
          const { user, employeeInfo } = response.data;

          // Make sure we're correctly extracting isAdmin from the user object
          const isAdmin = user && user.isAdmin === true;
          console.log(
            "Auth check successful, isAdmin:",
            isAdmin,
            "user:",
            user,
            "employeeInfo:",
            employeeInfo
          );

          // Store both user and employee info
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
        } catch (error) {
          console.error("Auth check failed:", error);
          set({
            user: null,
            isAuthenticated: false,
            isAdmin: false,
            isLoading: false,
          });
          return false;
        }
      },
      // Helper function to check if user can edit an employee
      canEditEmployee: (employeeEmail) => {
        const { isAdmin } = get();
        // Only admins can edit employees
        return isAdmin;
      },
    }),
    {
      name: "auth-storage", // name for the storage
      getStorage: () => localStorage, // use localStorage for persistence
      partialize: (state) => ({
        // Only persist these fields to localStorage
        user: state.user,
        isAdmin: state.isAdmin,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;
