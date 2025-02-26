import React, {createContext, useEffect, useState, useContext} from 'react';
import {StudentData} from '../../../types/StudentData';
import {UserDataContext} from '../contexts/UserDataContext';
import HomeService from '../services/HomeService';
import {ensureSocketConnected, socketSubscribeTo} from '../services/SocketsService';
import {StudentStatusValues} from '../services/StudentStatus';

/**
 * Context object for student data
 *
 * This context will only be loaded for users who are students
 *
 * This context is updated via the `studentData` socket
 */
const StudentDataContext = createContext({
  studentData: {
    name: '',
    andrewID: '',
    location: '',
    topic: {
      assignment_id: -1,
      name: '',
    },
    question: '',
    isFrozen: false,
    message: '',
    messageBuffer: [],
    status: StudentStatusValues.OFF_QUEUE as number,
    position: -1,
  } as StudentData,
  setStudentData: ((studentData: StudentData) => {}) as React.Dispatch<React.SetStateAction<StudentData>>,
});

/**
 * Context provider for student data
 * @return {React.Provider} Context provider for student data
 */
const StudentDataContextProvider = ({children}: {children: React.ReactNode}) => {
  const {userData} = useContext(UserDataContext);
  const [studentData, setStudentData] = useState<StudentData>({
    name: '',
    andrewID: '',
    location: '',
    topic: {
      assignment_id: -1,
      name: '',
    },
    question: '',
    isFrozen: false,
    message: '',
    messageBuffer: [],
    status: StudentStatusValues.OFF_QUEUE as number,
    position: -1,
  });

  // Load student data and subscribe to changes
  useEffect(() => {
    if (userData.isAuthenticated) {
      HomeService.getStudentData().then((res) => {
        if (res.status === 200 && res.data.andrewID === userData.andrewID) {
          setStudentData(res.data);
        }
      });

      socketSubscribeTo('studentData', (data: StudentData) => {
        if (data.andrewID === userData.andrewID) {
          setStudentData(data);
        } else {
          console.log('Student data id doesn\'t match andrewID');
        }
      });

      const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible') {
          HomeService.getStudentData().then((res) => {
            if (res.status === 200 && res.data.andrewID === userData.andrewID) {
              setStudentData(res.data);
            } else if (res.data.andrewID === userData.andrewID) {
              console.log('Student data id doesn\'t match andrewID');
            }
            ensureSocketConnected();
          });
        }
      };
      document.addEventListener('visibilitychange', handleVisibilityChange);
    }
  }, [userData.isAuthenticated]);

  return (
    <StudentDataContext.Provider value={{studentData, setStudentData}}>
      {children}
    </StudentDataContext.Provider>
  );
};

export {StudentDataContext, StudentDataContextProvider};
