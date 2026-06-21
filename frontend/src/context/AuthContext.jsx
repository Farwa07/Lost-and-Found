import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { loginUser as loginUserApi, getProfile as getProfileApi } from "../api/authApi";
import { setToken as saveApiToken } from "../api/apiClient";

const AuthContext = createContext();

const REGISTERED_USER_KEY = "lostFoundRegisteredUser";
const USERS_KEY = "lostFoundUsers";
const CURRENT_USER_KEY = "lostFoundCurrentUser";
const AUTH_TOKEN_KEY = "lostFoundAuthToken";
const PROFILE_DATA_KEY = "lostFoundProfileData";

const safeParse = (value, fallback = null) => {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

const normalizeEmail = (email = "") => String(email).trim().toLowerCase();

const toFrontendRole = (role = "user") => {
  return String(role).toLowerCase() === "admin" ? "Admin" : "Registered User";
};

const toFrontendStatus = (status = "active") => {
  return String(status).toLowerCase() === "blocked" ? "Blocked" : "Active";
};

const normalizeBackendUser = (user = {}) => {
  if (!user) return null;

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
    role: toFrontendRole(user.role),
    backendRole: user.role || "user",
    status: toFrontendStatus(user.status),
    backendStatus: user.status || "active",
    joinedAt: user.createdAt || user.joinedAt || "",
  };
};

const writeCurrentUser = (user, token = localStorage.getItem(AUTH_TOKEN_KEY)) => {
  if (!user) return;

  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  localStorage.setItem(REGISTERED_USER_KEY, JSON.stringify(user));
  localStorage.setItem(
    PROFILE_DATA_KEY,
    JSON.stringify({
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      city: user.city,
      address: user.address,
      bio: user.bio,
      profileImage: user.profileImage,
      role: user.role,
      status: user.status,
    })
  );

  const users = safeParse(localStorage.getItem(USERS_KEY), []);
  const validUsers = Array.isArray(users) ? users : [];
  const exists = validUsers.some(
    (item) => normalizeEmail(item.email) === normalizeEmail(user.email)
  );

  const nextUsers = exists
    ? validUsers.map((item) =>
        normalizeEmail(item.email) === normalizeEmail(user.email)
          ? { ...item, ...user }
          : item
      )
    : [user, ...validUsers];

  localStorage.setItem(USERS_KEY, JSON.stringify(nextUsers));

  if (token) {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  }
};

export function AuthProvider({ children }) {
  const [registeredUser, setRegisteredUser] = useState(() =>
    safeParse(localStorage.getItem(REGISTERED_USER_KEY))
  );
  const [users, setUsers] = useState(() =>
    safeParse(localStorage.getItem(USERS_KEY), []) || []
  );
  const [currentUser, setCurrentUser] = useState(() =>
    safeParse(localStorage.getItem(CURRENT_USER_KEY))
  );
  const [authToken, setAuthToken] = useState(
    () => localStorage.getItem(AUTH_TOKEN_KEY) || ""
  );
  const [authLoading, setAuthLoading] = useState(false);

  const refreshStorageState = () => {
    setRegisteredUser(safeParse(localStorage.getItem(REGISTERED_USER_KEY)));
    setUsers(safeParse(localStorage.getItem(USERS_KEY), []) || []);
    setCurrentUser(safeParse(localStorage.getItem(CURRENT_USER_KEY)));
    setAuthToken(localStorage.getItem(AUTH_TOKEN_KEY) || "");
  };

  useEffect(() => {
    window.addEventListener("authChanged", refreshStorageState);
    window.addEventListener("storage", refreshStorageState);

    return () => {
      window.removeEventListener("authChanged", refreshStorageState);
      window.removeEventListener("storage", refreshStorageState);
    };
  }, []);

  useEffect(() => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);

    if (!token || currentUser) return;

    let mounted = true;

    const loadProfile = async () => {
      try {
        const data = await getProfileApi();
        const normalizedUser = normalizeBackendUser(data.user);

        if (!mounted || !normalizedUser) return;

        writeCurrentUser(normalizedUser, token);
        refreshStorageState();
      } catch {
        saveApiToken("");
        localStorage.removeItem(CURRENT_USER_KEY);
        localStorage.removeItem(REGISTERED_USER_KEY);
        localStorage.removeItem(PROFILE_DATA_KEY);
        refreshStorageState();
      }
    };

    loadProfile();

    return () => {
      mounted = false;
    };
  }, [currentUser]);

  const login = async (email, password) => {
    setAuthLoading(true);

    try {
      const data = await loginUserApi({ email, password });
      const normalizedUser = normalizeBackendUser(data.user);

      saveApiToken(data.token);
      writeCurrentUser(normalizedUser, data.token);

      setAuthToken(data.token || "");
      setCurrentUser(normalizedUser);
      setRegisteredUser(normalizedUser);
      setUsers(safeParse(localStorage.getItem(USERS_KEY), []) || []);

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
    localStorage.removeItem(CURRENT_USER_KEY);

    setAuthToken("");
    setCurrentUser(null);

    window.dispatchEvent(new Event("authChanged"));
  };

  const updateUserInList = (updatedUserData) => {
    const updatedUser = {
      ...(currentUser || {}),
      ...updatedUserData,
      email: normalizeEmail(updatedUserData.email || currentUser?.email || ""),
    };

    writeCurrentUser(updatedUser, authToken);
    refreshStorageState();
    window.dispatchEvent(new Event("authChanged"));
    window.dispatchEvent(new Event("profileUpdated"));

    return updatedUser;
  };

  const register = (userData) => {
    const normalizedUser = normalizeBackendUser({
      ...userData,
      role: userData.role || "user",
      status: userData.status || "active",
    });

    writeCurrentUser(normalizedUser, authToken);
    refreshStorageState();
    window.dispatchEvent(new Event("authChanged"));

    return normalizedUser;
  };

  const findUserByEmail = (email) => {
    const cleanEmail = normalizeEmail(email);
    return (
      users.find((user) => normalizeEmail(user.email) === cleanEmail) ||
      (normalizeEmail(registeredUser?.email) === cleanEmail ? registeredUser : null)
    );
  };

  const isRegistered = Boolean(registeredUser);
  const isLoggedIn = Boolean(authToken && currentUser);
  const isAdmin = Boolean(isLoggedIn && currentUser?.role === "Admin");

  const authValue = useMemo(
    () => ({
      registeredUser,
      users,
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
    }),
    [
      registeredUser,
      users,
      currentUser,
      authToken,
      authLoading,
      isRegistered,
      isLoggedIn,
      isAdmin,
    ]
  );

  return <AuthContext.Provider value={authValue}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
