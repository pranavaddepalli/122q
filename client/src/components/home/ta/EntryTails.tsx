import React from 'react';
import {
  Stack, useTheme,
} from '@mui/material';

import YouAreHelping from './TailOptions/YouAreHelping';
import ActionsHelp from './TailOptions/ActionsHelp';
import ActionsFreeze from './TailOptions/ActionsFreeze';
import StudentStatus from './TailOptions/StudentStatus';
import LeapStudentActions from './TailOptions/LeapStudentActions';

import {StudentStatusValues} from '../../../services/StudentStatus';
import PersistentOptions from './TailOptions/PersistentOptions';

export default function EntryTails(props) {
  const {student, index, isHelping, helpIdx} = props;

  const showApproval = props.showCooldownApproval;

  const status = student.status;

  const themeHook = useTheme();

  const getCorrectTail = (status) => {
    switch (status) {
      case StudentStatusValues.BEING_HELPED: {
        if (isHelping && (index === helpIdx)) {
          return (YouAreHelping({...props, theme: themeHook}));
        } else {
          return (ActionsHelp(props));
        }
      }
      case StudentStatusValues.WAITING: return (ActionsHelp(props));
      case StudentStatusValues.FIXING_QUESTION: return (ActionsHelp(props));
      case StudentStatusValues.FROZEN: return (ActionsFreeze(props));
      case StudentStatusValues.RECEIVED_MESSAGE: return (ActionsHelp(props));
      case StudentStatusValues.COOLDOWN_VIOLATION:
        if (showApproval) {
          return (LeapStudentActions(props));
        } else {
          return (ActionsHelp({...props, color: 'secondary'}));
        }
      default: return;
    }
  };
  return (
    <Stack
      direction="column"
      alignItems="center"
      sx={{mr: {xs: 1, sm: 2, lg: 3}, ml: {xs: 1, sm: 2}, my: 1.5}}
    >
      <StudentStatus student={student} index={index} isHelping={isHelping} helpIdx={helpIdx}/>
      {getCorrectTail(status)}
    </Stack>
  );
}
