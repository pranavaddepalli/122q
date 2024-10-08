import React, {createContext, useEffect, useState, useContext} from 'react';
import {AdminSettings} from '../../../types/AdminSettings';
import {UserDataContext} from './UserDataContext';
import SettingsService from '../services/SettingsService';

/**
 * Context object for admin settings
 *
 * This context will only be loaded for users who are course administrators
 *
 * This context is **not** updated via sockets
 */
const AdminSettingsContext = createContext({
  adminSettings: {
    currSem: '',
    slackURL: undefined,
    enforceCMUEmail: true,
    courseName: '',
  },
  setAdminSettings: ((adminSettings: AdminSettings) => {}) as React.Dispatch<React.SetStateAction<AdminSettings>>,
});

/**
 * Context provider for admin settings
 * @return {React.Provider} Context provider for admin settings
 */
const AdminSettingsContextProvider = ({children}: {children: React.ReactNode}) => {
  const {userData} = useContext(UserDataContext);
  const [adminSettings, setAdminSettings] = useState<AdminSettings>({
    currSem: '',
    slackURL: undefined,
    enforceCMUEmail: true,
    courseName: '',
  });

  // Load admin settings if user is an admin
  useEffect(() => {
    if (userData.isAdmin) {
      SettingsService.getAdminSettings().then((res) => {
        setAdminSettings(res.data);
      });
    }
  }, [userData.isAdmin]);

  return (
    <AdminSettingsContext.Provider value={{adminSettings, setAdminSettings}}>
      {children}
    </AdminSettingsContext.Provider>
  );
};

export {AdminSettingsContext, AdminSettingsContextProvider};
