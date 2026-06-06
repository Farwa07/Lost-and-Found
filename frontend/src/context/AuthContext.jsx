import { createContext, useContext, useEffect, useMemo, useState } from "react";

const AuthContext = createContext();

const REGISTERED_USER_KEY = "lostFoundRegisteredUser";
const USERS_KEY = "lostFoundUsers";
const CURRENT_USER_KEY = "lostFoundCurrentUser";
const AUTH_TOKEN_KEY = "lostFoundAuthToken";
const PROFILE_DATA_KEY = "lostFoundProfileData";

const defaultAdminUser = {
  id: "admin-001",
  fullName: "System Admin",
  email: "admin@lostfound.com",
  phone: "03000000000",
  password: "Admin@123",
  role: "Admin",
  status: "Active",
  joinedAt: "2026-01-01",
};

const safeParse = (value, fallback = null) => {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

const normalizeEmail = (email = "") => {
  return String(email).trim().toLowerCase();
};

const createUserId = () => {
  return `user-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
};

const getTodayDate = () => {
  return new Date().toISOString().slice(0, 10);
};

const getRegisteredUserFromStorage = () => {
  return safeParse(localStorage.getItem(REGISTERED_USER_KEY));
};

const getUsersFromStorage = () => {
  const users = safeParse(localStorage.getItem(USERS_KEY), []);

  return Array.isArray(users) ? users : [];
};

const getCurrentUserFromStorage = () => {
  return safeParse(localStorage.getItem(CURRENT_USER_KEY));
};

const getAuthTokenFromStorage = () => {
  return localStorage.getItem(AUTH_TOKEN_KEY) || "";
};

const ensureDefaultAdmin = (users = []) => {
  const hasAdmin = users.some(
    (user) => normalizeEmail(user.email) === normalizeEmail(defaultAdminUser.email)
  );

  if (hasAdmin) {
    return users;
  }

  return [defaultAdminUser, ...users];
};

const writeUsersToStorage = (users) => {
  const usersWithAdmin = ensureDefaultAdmin(users);

  localStorage.setItem(USERS_KEY, JSON.stringify(usersWithAdmin));

  return usersWithAdmin;
};

const findUserByEmail = (email, users = getUsersFromStorage()) => {
  const cleanEmail = normalizeEmail(email);

  return users.find((user) => normalizeEmail(user.email) === cleanEmail) || null;
};

const normalizeUserForStorage = (userData, existingUser = null) => {
  return {
    id: existingUser?.id || userData.id || createUserId(),
    fullName: userData.fullName || userData.name || existingUser?.fullName || "",
    email: normalizeEmail(userData.email || existingUser?.email || ""),
    phone: userData.phone || existingUser?.phone || "",
    password: userData.password || existingUser?.password || "",
    role: userData.role || existingUser?.role || "Registered User",
    status: userData.status || existingUser?.status || "Active",
    joinedAt: existingUser?.joinedAt || userData.joinedAt || getTodayDate(),
  };
};

const makePublicUser = (user) => {
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    role: user.role || "Registered User",
    status: user.status || "Active",
  };
};

export function AuthProvider({ children }) {
  const [registeredUser, setRegisteredUser] = useState(() =>
    getRegisteredUserFromStorage()
  );

  const [users, setUsers] = useState(() =>
    writeUsersToStorage(getUsersFromStorage())
  );

  const [currentUser, setCurrentUser] = useState(() =>
    getCurrentUserFromStorage()
  );

  const [authToken, setAuthToken] = useState(() => getAuthTokenFromStorage());

  const loadAuthData = () => {
    const latestUsers = writeUsersToStorage(getUsersFromStorage());

    setUsers(latestUsers);
    setRegisteredUser(getRegisteredUserFromStorage());
    setCurrentUser(getCurrentUserFromStorage());
    setAuthToken(getAuthTokenFromStorage());
  };

  useEffect(() => {
    loadAuthData();

    window.addEventListener("authChanged", loadAuthData);
    window.addEventListener("storage", loadAuthData);

    return () => {
      window.removeEventListener("authChanged", loadAuthData);
      window.removeEventListener("storage", loadAuthData);
    };
  }, []);

  const register = (userData) => {
    const previousUsers = writeUsersToStorage(getUsersFromStorage());

    const existingUser = findUserByEmail(userData.email, previousUsers);

    const registeredData = normalizeUserForStorage(userData, existingUser);

    const nextUsers = existingUser
      ? previousUsers.map((user) =>
          normalizeEmail(user.email) === normalizeEmail(registeredData.email)
            ? {
                ...user,
                ...registeredData,
              }
            : user
        )
      : [registeredData, ...previousUsers];

    const savedUsers = writeUsersToStorage(nextUsers);

    const profileData = {
      fullName: registeredData.fullName,
      email: registeredData.email,
      phone: registeredData.phone,
      role: registeredData.role,
    };

    localStorage.setItem(REGISTERED_USER_KEY, JSON.stringify(registeredData));
    localStorage.setItem(PROFILE_DATA_KEY, JSON.stringify(profileData));

    setRegisteredUser(registeredData);
    setUsers(savedUsers);

    window.dispatchEvent(new Event("authChanged"));

    return registeredData;
  };

  const login = (userData) => {
    const previousUsers = writeUsersToStorage(getUsersFromStorage());

    const existingUser =
      findUserByEmail(userData.email, previousUsers) ||
      normalizeUserForStorage(userData);

    if (existingUser.status === "Blocked") {
      return {
        success: false,
        message: "This account is blocked by admin.",
      };
    }

    const currentUserData = makePublicUser(existingUser);

    localStorage.setItem(AUTH_TOKEN_KEY, "lost-found-demo-token");

    localStorage.setItem(
      CURRENT_USER_KEY,
      JSON.stringify(currentUserData)
    );

    localStorage.setItem(
      PROFILE_DATA_KEY,
      JSON.stringify({
        fullName: currentUserData.fullName,
        email: currentUserData.email,
        phone: currentUserData.phone,
        role: currentUserData.role,
      })
    );

    localStorage.setItem(REGISTERED_USER_KEY, JSON.stringify(existingUser));

    setAuthToken("lost-found-demo-token");
    setCurrentUser(currentUserData);
    setRegisteredUser(existingUser);

    window.dispatchEvent(new Event("authChanged"));
    window.dispatchEvent(new Event("profileUpdated"));

    return {
      success: true,
      user: currentUserData,
    };
  };

  const logout = () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(CURRENT_USER_KEY);

    setAuthToken("");
    setCurrentUser(null);

    window.dispatchEvent(new Event("authChanged"));
  };

  const updateUserInList = (updatedUserData) => {
    const previousUsers = writeUsersToStorage(getUsersFromStorage());

    const updatedUser = normalizeUserForStorage(updatedUserData);

    const exists = previousUsers.some(
      (user) => normalizeEmail(user.email) === normalizeEmail(updatedUser.email)
    );

    const nextUsers = exists
      ? previousUsers.map((user) =>
          normalizeEmail(user.email) === normalizeEmail(updatedUser.email)
            ? {
                ...user,
                ...updatedUser,
              }
            : user
        )
      : [updatedUser, ...previousUsers];

    const savedUsers = writeUsersToStorage(nextUsers);

    setUsers(savedUsers);

    if (
      currentUser &&
      normalizeEmail(currentUser.email) === normalizeEmail(updatedUser.email)
    ) {
      const nextCurrentUser = makePublicUser(updatedUser);

      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(nextCurrentUser));
      localStorage.setItem(PROFILE_DATA_KEY, JSON.stringify(nextCurrentUser));

      setCurrentUser(nextCurrentUser);
    }

    if (
      registeredUser &&
      normalizeEmail(registeredUser.email) === normalizeEmail(updatedUser.email)
    ) {
      localStorage.setItem(REGISTERED_USER_KEY, JSON.stringify(updatedUser));
      setRegisteredUser(updatedUser);
    }

    window.dispatchEvent(new Event("authChanged"));
    window.dispatchEvent(new Event("profileUpdated"));

    return updatedUser;
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
      isRegistered,
      isLoggedIn,
      isAdmin,
      register,
      login,
      logout,
      findUserByEmail: (email) => findUserByEmail(email, users),
      updateUserInList,
    }),
    [registeredUser, users, currentUser, authToken, isRegistered, isLoggedIn, isAdmin]
  );

  return (
    <AuthContext.Provider value={authValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}