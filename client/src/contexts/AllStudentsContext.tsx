import React, {createContext, useEffect, useState, useContext} from 'react';
import {StudentData} from '../../../types/StudentData';
import {UserDataContext} from '../contexts/UserDataContext';
import HomeService from '../services/HomeService';
import {socketSubscribeTo} from '../services/SocketsService';

/**
 * Context object for all students on the queue
 *
 * This context will only be loaded for users who are TAs
 *
 * This context is updated via the `allStudents` socket
 */
const AllStudentsContext = createContext({
  allStudents: [] as StudentData[],
  setAllStudents: ((allStudents: StudentData[]) => {}) as React.Dispatch<React.SetStateAction<StudentData[]>>,
});

/**
 * Context provider for all students on the queue
 * @return {React.Provider} Context provider for all students
 */
const AllStudentsContextProvider = ({children}: {children: React.ReactNode}) => {
  const {userData} = useContext(UserDataContext);
  const [allStudents, setAllStudents] = useState<StudentData[]>([]);

  // Load all students if user is a TA and subscribe to changes
  useEffect(() => {
    if (userData.isTA) {
      HomeService.getAllStudents().then((res) => {
        setAllStudents(res.data.allStudents);
      });

      socketSubscribeTo('allStudents', (data: {allStudents: StudentData[]}) => {
        setAllStudents(data.allStudents);
      });

      // const handleVisibilityChange = () => {
      //   if (document.visibilityState === 'visible') {
      //     HomeService.getAllStudents().then((res) => {
      //       setAllStudents(res.data.allStudents);
      //     });
      //   }
      // };
      // document.addEventListener('visibilitychange', handleVisibilityChange);
    }
  }, [userData.isTA]);

  return (
    <AllStudentsContext.Provider value={{allStudents, setAllStudents}}>
      {children}
    </AllStudentsContext.Provider>
  );
};

export {AllStudentsContext, AllStudentsContextProvider};
