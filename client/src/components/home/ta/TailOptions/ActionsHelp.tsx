import React from 'react';
import {
  Button, Stack,
} from '@mui/material';

import PersistentOptions from './PersistentOptions';

import {StudentStatusValues} from '../../../../services/StudentStatus';

export default function ActionsHelp(props) {
  const {
    student, index, isHelping, handleClickHelp,
  } = props;

  const buttonColor = props.color == null ? 'info' : props.color;

  return (
    <Stack
      direction={{xs: 'column', sm: 'row'}}
      sx={{alignItems: 'center', justifyContent: 'flex-end'}}
    >
      <Button disabled={student.status === StudentStatusValues.BEING_HELPED || isHelping} color={buttonColor} variant="contained" onClick={() => handleClickHelp(index)} sx={{m: 0.5}}>
        Help
      </Button>
      {PersistentOptions(props)}
    </Stack>
  );
}
