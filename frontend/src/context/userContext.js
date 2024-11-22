import { createContext, useState, useContext } from "react";

// Create the context
const UserContext = createContext();

// Create the provider component
export const UserProvider = ({ children }) => {
    const [userName, setUserName] = useState(null); // Shared userName state

    return (
        <UserContext.Provider value={{ userName, setUserName }}>
            {children}
        </UserContext.Provider>
    );
};

// Custom hook for easier usage
export const useUserContext = () => useContext(UserContext);
