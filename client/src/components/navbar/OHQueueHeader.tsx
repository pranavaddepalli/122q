import React from 'react';
import {
  Link,
} from '@mui/material';
import {useContext} from 'react';
import {AdminSettingsContext} from '../../contexts/AdminSettingsContext';

export default function OHQueueHeader() {
  const {adminSettings} = useContext(AdminSettingsContext);
  const courseName = adminSettings.courseName;
  return (
    <Link variant="h6" color="#FFFFFF" fontWeight='bold' href="" underline="none" sx={{pt: 0.3}}>
      {courseName} Office Hours Queue
    </Link>
  );
}
