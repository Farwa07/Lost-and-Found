import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getProfile as getProfileApi, loginUser as loginUserApi } from "../api/authApi";
import { setToken as saveApiToken } from "../api/apiClient";

const AuthContext = createContext();

const AUTH_TOKEN_KEY = "lostFoundAuthToken";

const normalizeEmail = (email = "") => String(email).trim().toLowerCase();

const toBackendRole = (role = "user") =>
  String(role).trim().toLowerCase() === "admin" ? "admin" : "user";

const toFrontendRole = (role = "user") =>
  toBackendRole(role) === "admin" ? "Admin" : "Registered User";

const toBackendStatus = (status = "active") =>
  String(status).trim().toLowerCase() === "blocked" ? "blocked" : "active";

const toFrontendStatus = (status = "active") =>
  toBackendStatus(status) === "blocked" ? "Blocked" : "Active";

const getUserFromResponse = (response) => response?.user || response?.data || response || null;

const normalizeBackendUser = (user = {}) => {
  if (!user) return null;

  const rawRole = user.backendRole || user.role || "user";
  const rawStatus = user.backendStatus || user.status || "active";

  return {
    id: user.id || user._id || "",
    _id: user._id || user.id || "",
    fullName: user.fullName || user.name || "Registered User",
    email: normalizeEmail(user.email || ""),
    phone: user.phone || "",
    city: user.city || "",
    address: user.address || "",
    bio: user.bio || "",
    profileImage: user.profileImage || "",
    role: toFrontendRole(rawRole),
    backendRole: toBackendRole(rawRole),
    status: toFrontendStatus(rawStatus),
    backendStatus: toBackendStatus(rawStatus),
    joinedAt: user.createdAt || user.joinedAt || "",
  };
};

export function AuthProvider({ children }) {
  const [authToken, setAuthToken] = useState(
    () => localStorage.getItem(AUTH_TOKEN_KEY) || ""
  );
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(() => Boolean(localStorage.getItem(AUTH_TOKEN_KEY)));

  const loadProfile = async (token = localStorage.getItem(AUTH_TOKEN_KEY) || "") => {
    if (!token) {
      setCurrentUser(null);
      setAuthToken("");
      setAuthLoading(false);
      return null;
    }

    try {
      setAuthLoading(true);
      const data = await getProfileApi();
      const normalizedUser = normalizeBackendUser(getUserFromResponse(data));
      setCurrentUser(normalizedUser);
      setAuthToken(token);
      return normalizedUser;
    } catch (error) {
      saveApiToken("");
      setAuthToken("");
      setCurrentUser(null);
      return null;
    } finally {
      setAuthLoading(false);
    }
  };

  useEffect(() => {
    loadProfile(authToken);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleAuthChanged = () => {
      const token = localStorage.getItem(AUTH_TOKEN_KEY) || "";
      setAuthToken(token);
      loadProfile(token);
    };

    const handleStorage = (event) => {
      if (!event.key || event.key === AUTH_TOKEN_KEY) {
        handleAuthChanged();
      }
    };

    window.addEventListener("authChanged", handleAuthChanged);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("authChanged", handleAuthChanged);
      window.removeEventListener("storage", handleStorage);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (email, password) => {
    setAuthLoading(true);

    try {
      const data = await loginUserApi({ email, password });
      const normalizedUser = normalizeBackendUser(getUserFromResponse(data));

      saveApiToken(data.token);
      setAuthToken(data.token || "");
      setCurrentUser(normalizedUser);

      window.dispatchEvent(new Event("authChanged"));
      window.dispatchEvent(new Event("profileUpdated"));

      return {
        success: true,
        user: normalizedUser,
        token: data.token,
        message: data.message || "Login successful",
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Login failed",
      };
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = () => {
    saveApiToken("");
    setAuthToken("");
    setCurrentUser(null);
    window.dispatchEvent(new Event("authChanged"));
  };

  const updateUserInList = (updatedUserData = {}) => {
    const normalizedUser = normalizeBackendUser({
      ...(currentUser || {}),
      ...updatedUserData,
      email: updatedUserData.email || currentUser?.email || "",
      backendRole:
        updatedUserData.backendRole ||
        updatedUserData.role ||
        currentUser?.backendRole ||
        currentUser?.role ||
        "user",
      backendStatus:
        updatedUserData.backendStatus ||
        updatedUserData.status ||
        currentUser?.backendStatus ||
        currentUser?.status ||
        "active",
    });

    setCurrentUser(normalizedUser);
    window.dispatchEvent(new Event("profileUpdated"));

    return normalizedUser;
  };

  const register = (userData) => normalizeBackendUser(userData);

  const findUserByEmail = (email) => {
    const cleanEmail = normalizeEmail(email);

    if (normalizeEmail(currentUser?.email) === cleanEmail) {
      return currentUser;
    }

    return null;
  };

  const isRegistered = Boolean(authToken || currentUser);
  const isLoggedIn = Boolean(authToken);
  const isAdmin = Boolean(
    isLoggedIn &&
      (
        String(currentUser?.backendRole || "").trim().toLowerCase() === "admin" ||
        String(currentUser?.role || "").trim().toLowerCase() === "admin"
      )
  );

  const authValue = useMemo(
    () => ({
      registeredUser: currentUser,
      users: currentUser ? [currentUser] : [],
      currentUser,
      authToken,
      authLoading,
      isRegistered,
      isLoggedIn,
      isAdmin,
      register,
      login,
      logout,
      findUserByEmail,
      updateUserInList,
      normalizeBackendUser,
      refreshProfile: loadProfile,
    }),
    [currentUser, authToken, authLoading, isRegistered, isLoggedIn, isAdmin]
  );

  return <AuthContext.Provider value={authValue}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
