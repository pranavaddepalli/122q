/**
 * Type of queue data that is visible to all queue users
 */
export type QueueData = {
  // most important global data
  title: string;
  uninitializedSem: boolean;
  queueFrozen: boolean;
  allowCDOverride: boolean;
  ownerEmail: string;

  // global stats
  numStudents: number;
  rejoinTime: number;
  numUnhelped: number;
  minsPerStudent: number;
  numTAs: number;

  // queue data
  announcements: {
    id: number;
    content: string;
  }[];

  questionsURL: string;

  topics: {
    assignment_id: number;
    name: string;
    category: string;
    start_date: string;
    end_date: string;
  }[];
  locations: {
    dayDictionary: any;
    roomDictionary: any;
  };

  tas: {
    ta_id: number;
    name: string;
    preferred_name: string;
    email: string;
    isAdmin: boolean;
  }[];
};
