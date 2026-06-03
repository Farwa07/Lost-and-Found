import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

const safeParse = (value) => {
  try {
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
};

const getRegisteredUserFromStorage = () => {
  return safeParse(localStorage.getItem("lostFoundRegisteredUser"));
};

const getCurrentUserFromStorage = () => {
  return safeParse(localStorage.getItem("lostFoundCurrentUser"));
};

const getAuthTokenFromStorage = () => {
  return localStorage.getItem("lostFoundAuthToken") || "";
};

export function AuthProvider({ children }) {
  const [registeredUser, setRegisteredUser] = useState(() =>
    getRegisteredUserFromStorage()
  );

  const [currentUser, setCurrentUser] = useState(() =>
    getCurrentUserFromStorage()
  );

  const [authToken, setAuthToken] = useState(() =>
    getAuthTokenFromStorage()
  );

  const loadAuthData = () => {
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
    const registeredData = {
      fullName: userData.fullName,
      email: userData.email,
      phone: userData.phone,
      password: userData.password,
    };

    const profileData = {
      fullName: userData.fullName,
      email: userData.email,
      phone: userData.phone,
    };

    localStorage.setItem(
      "lostFoundRegisteredUser",
      JSON.stringify(registeredData)
    );

    localStorage.setItem(
      "lostFoundProfileData",
      JSON.stringify(profileData)
    );

    setRegisteredUser(registeredData);

    window.dispatchEvent(new Event("authChanged"));
  };

  const login = (userData) => {
    const currentUserData = {
      fullName: userData.fullName,
      email: userData.email,
      phone: userData.phone,
    };

    localStorage.setItem("lostFoundAuthToken", "lost-found-demo-token");

    localStorage.setItem(
      "lostFoundCurrentUser",
      JSON.stringify(currentUserData)
    );

    localStorage.setItem(
      "lostFoundProfileData",
      JSON.stringify(currentUserData)
    );

    setAuthToken("lost-found-demo-token");
    setCurrentUser(currentUserData);

    window.dispatchEvent(new Event("authChanged"));
  };

  const logout = () => {
    localStorage.removeItem("lostFoundAuthToken");
    localStorage.removeItem("lostFoundCurrentUser");

    setAuthToken("");
    setCurrentUser(null);

    window.dispatchEvent(new Event("authChanged"));
  };

  const isRegistered = Boolean(registeredUser);
  const isLoggedIn = Boolean(authToken && currentUser);

  return (
    <AuthContext.Provider
      value={{
        registeredUser,
        currentUser,
        isRegistered,
        isLoggedIn,
        register,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}