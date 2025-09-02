import React,{ useState, useEffect, useContext, createContext } from "react";

const AuthContext = createContext();

export const AuthProvider = ({children}) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthStatus = () => {
      const storedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      
      console.log("AuthContext: Checking auth status...");
      console.log("Stored user:", storedUser);
      console.log("Stored token:", token ? "Present" : "Missing");
      
      if (storedUser && token) {
        try {
          const userData = JSON.parse(storedUser);
          // Basic validation - check if token and user data exist
          // Handle both 'id' and '_id' fields for compatibility
          if ((userData.id || userData._id) && token) {
            console.log("AuthContext: Valid user data found, setting user");
            // Add token to user data for consistency
            const userWithToken = { ...userData, token };
            setUser(userWithToken);
          } else {
            console.log("AuthContext: Invalid user data, clearing");
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            setUser(null);
          }
        } catch (error) {
          console.log("AuthContext: Error parsing user data, clearing");
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          setUser(null);
        }
      } else {
        console.log("AuthContext: No user data or token found");
        setUser(null);
      }
      setLoading(false);
    };
    
    checkAuthStatus();
  }, [])

  const login = (userData) => {
    console.log("AuthContext: Login called with:", userData);
    // Ensure token is included in user data
    const userWithToken = { ...userData, token: localStorage.getItem('token') };
    setUser(userWithToken);
    localStorage.setItem('user', JSON.stringify(userWithToken));
    console.log("AuthContext: User state updated, new state:", userWithToken);
  }

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  }
  
  const checkAuth = () => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      return false;
    }
    
    try {
      const user = JSON.parse(userData);
      // Check for either 'id' or '_id' to handle different data structures
      return !!(user.id || user._id) && token;
    } catch {
      return false;
    }
  }
  
  // Make isAuthenticated reactive to user state changes
  const isAuthenticated = !!user;
  
  return(
    <AuthContext.Provider value={{
      user, 
      login, 
      logout,
      checkAuth,
      isAuthenticated,
      currentUser: user,
      loading
    }}>
    {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext);











