// src/contexts/UserContext.jsx
import React, { createContext, useState, useContext } from 'react';
import PropTypes from 'prop-types';

// Create a Context for the User
const UserContext = createContext();

// Custom hook for using the User Context
export const useUserContext = () => useContext(UserContext);

// The UserProvider component to manage the user state
export const UserProvider = ({ children }) => {
  const [userName, setUserName] = useState(null);

  const login = (name) => {
    setUserName(name);
  };

  const logout = () => {
    setUserName(null);
    localStorage.removeItem('token'); // Remove JWT token
  };

  return (
    <UserContext.Provider value={{ userName, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};

// Prop type validation for the children prop
UserProvider.propTypes = {
  children: PropTypes.node.isRequired, // Ensures that 'children' is passed and is of type node
};
