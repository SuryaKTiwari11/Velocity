import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authApi, paymentApi } from "../front2backconnect/api";

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isAdmin: false,
      isPremium: false, // Add premium status
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

          // Check premium status after successful login
          try {
            const premiumResponse = await paymentApi.checkPremium();
            const { isPremium } = premiumResponse.data;
            set({ isPremium });
          } catch (error) {
            console.log("Could not check premium status:", error);
            set({ isPremium: false });
          }

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
      ssoSuccess: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.authSuccess();
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
            isPremium: false,
            isLoading: false,
            error: null,
          });
        } catch {
          set({
            user: null,
            isAuthenticated: false,
            isAdmin: false,
            isPremium: false,
            error: "Logout failed",
            isLoading: false,
          });
        }
      },
      checkAuth: async () => {
        set({ isLoading: true });
        try {
          const response = await authApi.curUser();
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

          // Check premium status after successful auth
          try {
            const premiumResponse = await paymentApi.checkPremium();
            const { isPremium } = premiumResponse.data;
            set({ isPremium });
          } catch (error) {
            console.log("Could not check premium status:", error);
            set({ isPremium: false });
          }

          return true;
        } catch {
          set({
            user: null,
            isAuthenticated: false,
            isAdmin: false,
            isPremium: false,
            isLoading: false,
          });
          return false;
        }
      },

      // Check premium status - student level
      checkPremium: async () => {
        try {
          const response = await paymentApi.checkPremium();
          const { isPremium } = response.data;
          set({ isPremium });
          return isPremium;
        } catch (error) {
          console.log("Error checking premium:", error);
          set({ isPremium: false });
          return false;
        }
      },

      // Update premium status
      setPremium: (isPremium) => set({ isPremium }),
    }),
    {
      name: "auth-storage",
      getStorage: () => localStorage,
      partialize: (state) => ({
        user: state.user,
        isAdmin: state.isAdmin,
        isAuthenticated: state.isAuthenticated,
        isPremium: state.isPremium, // Store premium status
        //!this helps store int he localStorage
      }),
    }
  )
);

export default useAuthStore;
