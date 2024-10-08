import React from 'react';
import {
  Link,
} from '@mui/material';
import {useContext} from 'react';
import {QueueDataContext} from '../../contexts/QueueDataContext';

export default function OHQueueHeader() {
  const {queueData} = useContext(QueueDataContext);
  return (
    <Link variant="h6" color="#FFFFFF" fontWeight='bold' href="" underline="none" sx={{pt: 0.3}}>
      {queueData.title}
    </Link>
  );
}
