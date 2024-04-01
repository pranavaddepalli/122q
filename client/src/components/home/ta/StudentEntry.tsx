import React, {useState, useEffect, useRef, useContext} from 'react';
import {
  Stack, TableCell, Typography,
} from '@mui/material';
import PauseIcon from '@mui/icons-material/Pause';

import EntryTails from './EntryTails';
import ItemRow from '../../common/table/ItemRow';

import {QueueDataContext} from '../../../contexts/QueueDataContext';

import HomeService from '../../../services/HomeService';
import {StudentStatusValues} from '../../../services/StudentStatus';
import {Settings} from '@mui/icons-material';
import {debug} from 'util';

export default function StudentEntry(props) {
  const {queueData} = useContext(QueueDataContext);
  const {student, index, handleClickHelp, removeStudent, handleClickUnfreeze} = props;

  const [confirmRemove, setConfirmRemove] = useState(false);
  const removeRef = useRef();

  const [showCooldownApproval, setShowCooldownApproval] = useState(queueData.allowCDOverride && student['status'] === StudentStatusValues.COOLDOWN_VIOLATION);

  useEffect(() => {
    const closeExpanded = (e) => {
      const path = e.path || (e.composedPath && e.composedPath());
      if (!path.includes(removeRef.current)) {
        setConfirmRemove(false);
      }
    };

    document.body.addEventListener('click', closeExpanded);
    return () => {
      document.body.removeEventListener('click', closeExpanded);
    };
  }, []);

  // Update showCooldownApproval when allowCDOverride changes
  useEffect(() => {
    setShowCooldownApproval(queueData.allowCDOverride && student['status'] === StudentStatusValues.COOLDOWN_VIOLATION);
  }, [queueData.allowCDOverride, student['status']]);

  function handleRemoveButton() {
    if (confirmRemove) {
      setConfirmRemove(false);
      removeStudent(index, false);
    } else {
      setConfirmRemove(true);
    }
  }

  const handleClickUpdateQ = () => {
    student['status'] = StudentStatusValues.FIXING_QUESTION;
  };

  const approveCooldownOverride = () => {
    HomeService.approveCooldownOverride(
        JSON.stringify({
          andrewID: student['andrewID'],
        },
        )).then((res) => {
      if (res.status === 200) {
        setShowCooldownApproval(false);
        student.status = StudentStatusValues.WAITING;
        student.isFrozen = false;
      }
    });
  };

  return (
    <ItemRow
      index={index}
      rowKey={student.andrewID}
    >
      <TableCell padding='none' component="th" scope="row" sx={{py: 2, pl: 3.25, pr: 2, width: '20%'}}>
        {student.name} ({student.andrewID})<br/>
        [{student.location}]
      </TableCell>
      <TableCell padding='none' align="left" sx={{py: 2, pr: 2, width: '60%'}}>
        <Stack direction="row" alignItems="center" spacing={1}>
          { student.isFrozen && <PauseIcon fontSize="inherit"/> }
          { <Typography variant='body2'>[{student.topic.name}]</Typography> }
          { <Typography variant='body2' sx={{whiteSpace: 'pre-line'}}> {student.question} </Typography>}
        </Stack>
      </TableCell>
      <TableCell padding='none'>
        {
          EntryTails(
              {
                ...props,
                removeRef: removeRef,
                confirmRemove: confirmRemove,
                handleRemoveButton: handleRemoveButton,
                removeStudent: removeStudent,
                handleClickHelp: handleClickHelp,
                handleClickUnfreeze: handleClickUnfreeze,
                showCooldownApproval: showCooldownApproval,
                approveCooldownOverride: approveCooldownOverride,
                handleClickUpdateQ: handleClickUpdateQ,
              },
          )
        }
      </TableCell>
    </ItemRow>
  );
}
