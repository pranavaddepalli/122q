import {QueueData} from '../../../types/QueueData';
import React, {createContext, useEffect, useState} from 'react';
import HomeService from '../services/HomeService';
import {socketSubscribeTo} from '../services/SocketsService';

/**
 * Context object for queue data
 *
 * This context will be loaded for all users
 *
 * This context is updated via the `queueData` socket
 */
const QueueDataContext = createContext({
  queueData: {} as QueueData,
  setQueueData: ((queueData: QueueData) => {}) as React.Dispatch<React.SetStateAction<QueueData>>,
});

/**
 * Context provider for queue data
 * @return {React.Provider} Context provider for queue data
 */
const QueueDataContextProvider = ({children}: {children: React.ReactNode}) => {
  const [queueData, setQueueData] = useState<QueueData>({
    title: 'Office Hours Queue',
    uninitializedSem: false,
    queueFrozen: true,
    allowCDOverride: true,

    numStudents: 0,
    rejoinTime: 15,
    numUnhelped: 0,
    minsPerStudent: 0,
    numTAs: 0,

    announcements: [],
    questionsURL: '',
    topics: [],
    locations: {
      dayDictionary: {},
      roomDictionary: {},
    },

    tas: [],
  });

  // Load queue data and subscribe to changes
  useEffect(() => {
    HomeService.getAll().then((res) => {
      setQueueData(res.data);
      document.title = res.data.title;
    });

    socketSubscribeTo('queueData', (data: QueueData) => {
      setQueueData(data);
    });

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        HomeService.getAll().then((res) => {
          setQueueData(res.data);
        });
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  return (
    <QueueDataContext.Provider value={{queueData, setQueueData}}>
      {children}
    </QueueDataContext.Provider>
  );
};

export {QueueDataContext, QueueDataContextProvider};
