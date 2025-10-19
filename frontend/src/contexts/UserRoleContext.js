import React, { createContext, useContext, useState, useEffect } from 'react';

const UserRoleContext = createContext();

export const UserRoleProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    
    setLoading(false);
  }, []);

  const login = (userData, token) => {
    // Clean and validate token before storing
    const cleanToken = token ? token.trim().replace(/^["']|["']$/g, '') : '';
    
    if (!cleanToken) {
      console.error('❌ Invalid token provided to login');
      return;
    }
    
    console.log('✅ Logging in user:', userData.email);
    localStorage.setItem('token', cleanToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const hasRole = (roles) => {
    if (!user) return false;
    if (Array.isArray(roles)) {
      return roles.includes(user.role);
    }
    return user.role === roles;
  };

  // Get role information (icon, color, name)
  const getRoleInfo = (role) => {
    const roleMap = {
      student: { icon: '👨‍🎓', color: '#2196F3', name: 'Student' },
      teacher: { icon: '👨‍🏫', color: '#4CAF50', name: 'Teacher' },
      admin: { icon: '👨‍💼', color: '#FF9800', name: 'Admin' },
      hod: { icon: '👔', color: '#9C27B0', name: 'HOD' },
      dean: { icon: '🎓', color: '#F44336', name: 'Dean' }
    };
    return roleMap[role] || { icon: '👤', color: '#757575', name: 'User' };
  };

  // Check if user can access a specific role
  const canAccessRole = (role) => {
    if (!user) return false;
    return user.role === role;
  };

  // Get current role assignment
  const getCurrentRoleAssignment = () => {
    if (!user) return null;
    return {
      role: user.role,
      ...getRoleInfo(user.role)
    };
  };

  // Get available roles for current user
  const availableRoles = user ? [user.role] : [];
  
  // Active role (currently just the user's role)
  const activeRole = user ? user.role : null;
  
  // Check if user has multiple roles (currently single role system)
  const isMultiRole = false;
  
  // Switch role (placeholder for future multi-role support)
  const switchRole = (newRole) => {
    console.log('Role switching not yet implemented:', newRole);
  };

  return (
    <UserRoleContext.Provider value={{ 
      user, 
      loading, 
      login, 
      logout, 
      hasRole,
      isAuthenticated: !!user,
      activeRole,
      availableRoles,
      canAccessRole,
      getRoleInfo,
      isMultiRole,
      switchRole,
      getCurrentRoleAssignment
    }}>
      {children}
    </UserRoleContext.Provider>
  );
};

export const useUserRole = () => {
  const context = useContext(UserRoleContext);
  if (!context) {
    throw new Error('useUserRole must be used within UserRoleProvider');
  }
  return context;
};

export default UserRoleContext;
