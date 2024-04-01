import React, {useContext} from 'react';
import {
  Typography, Button, Dialog, DialogContent, Stack, useTheme,
} from '@mui/material';

import HomeService from '../../../services/HomeService';
import {QueueDataContext} from '../../../contexts/QueueDataContext';

export default function CooldownViolationOverlay(props) {
  const {open, setOpen, andrewID, question, location, topic, timePassed} = props;
  const theme = useTheme();

  const {queueData} = useContext(QueueDataContext);
  function callAddQuestionAPIOverrideCooldown() {
    if (queueData.allowCDOverride) {
      HomeService.addQuestion(
          JSON.stringify({
            andrewID: andrewID,
            question: question,
            location: location,
            topic: topic,
            overrideCooldown: true,
          }),
      ).then((res) => {
        if (res.status === 200) {
          setOpen(false);
        }
      });
    } else return;
  }

  if (queueData.allowCDOverride) {
    return (
      <Dialog open={open} maxWidth="sm" fullWidth>
        <DialogContent sx={{p: 5, textAlign: 'center'}} >
          <Typography variant='h6' textAlign='center'>
            You rejoined the queue too quickly! Please wait for {queueData.rejoinTime} minutes after finishing your last question, which will be in {queueData.rejoinTime - timePassed} minutes.
          </Typography>

          <Stack alignItems="baseline" justifyContent="space-around" direction="row" spacing={3}>
            <Button onClick={() => callAddQuestionAPIOverrideCooldown()} color='error' fullWidth variant="contained" sx={{maxHeight: '50px', mt: 3, alignContent: 'center'}} type="submit">
              Override Cooldown
            </Button>
            <Button onClick={() => setOpen(false)} style={{background: theme.alternateColors.cancel}} fullWidth variant="contained" sx={{maxHeight: '50px', mt: 3, alignContent: 'center'}} type="submit">
              Close
            </Button>
          </Stack>

          <Typography lineHeight={1.3} variant='subtitle1' textAlign='center' sx={{mt: 3}}>
            Overriding the cooldown will add you to the queue, however you will be frozen until a TA approves you.
          </Typography>
        </DialogContent>
      </Dialog>
    );
  } else {
    return (
      <Dialog open={open} maxWidth="sm" fullWidth>
        <DialogContent sx={{p: 5, textAlign: 'center'}} >
          <Typography variant='h6' textAlign='center'>
            You rejoined the queue too quickly! Please wait for {queueData.rejoinTime} minutes after finishing your last question, which will be in {queueData.rejoinTime - timePassed} minutes.
          </Typography>
          <Button onClick={() => setOpen(false)} style={{background: theme.alternateColors.cancel}} fullWidth variant="contained" sx={{maxHeight: '50px', mt: 3, alignContent: 'center'}} type="submit">
            Close
          </Button>
        </DialogContent>
      </Dialog>
    );
  }
}

