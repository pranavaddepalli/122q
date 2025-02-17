import React, { useState, useEffect, useContext } from 'react';
import {
  Button,
  CardContent,
  Typography,
  TextField,
  Grid,
  Checkbox,
  Stack,
} from '@mui/material';

import BaseCard from '../../common/cards/BaseCard';

import SettingsService from '../../../services/SettingsService';
import { AdminSettingsContext } from '../../../contexts/AdminSettingsContext';
import { QueueDataContext } from '../../../contexts/QueueDataContext';
import { UserDataContext } from '../../../contexts/UserDataContext';

export default function ConfigSettings(props) {
  const { adminSettings } = useContext(AdminSettingsContext);
  const { queueData } = useContext(QueueDataContext);
  const { userData } = useContext(UserDataContext);

  const [currSem, setCurrSem] = useState('');
  const [slackURL, setSlackURL] = useState('');
  const [questionsURL, setQuestionsURL] = useState('');
  const [enforceCMUEmail, setEnforceCMUEmail] = useState(true);
  const [allowCDOverride, setAllowCDOverride] = useState(true);
  const [courseName, setCourseName] = useState('');

  useEffect(() => {
    setCurrSem(adminSettings.currSem);
    setSlackURL(adminSettings.slackURL);
    setEnforceCMUEmail(adminSettings.enforceCMUEmail);
    setCourseName(adminSettings.courseName);
  }, [adminSettings]);
  useEffect(() => {
    setAllowCDOverride(queueData.allowCDOverride);
    setQuestionsURL(queueData.questionsURL);
  }, [queueData]);

  const handleUpdateCourseName = (event) => {
    event.preventDefault();
    if (courseName === adminSettings.courseName) return;

    SettingsService.updateCourseName(
        JSON.stringify({
          courseName: courseName,
        }),
    );
  };

  const handleUpdateSemester = (event) => {
    event.preventDefault();
    if (currSem === adminSettings.currSem) return;

    SettingsService.updateSemester(
        JSON.stringify({
          sem_id: currSem,
        }),
    ).then(() => {
      // Reload entire page since we've changed semesters
      window.location.reload();
    });
  };

  const handleUpdateSlackURL = (event) => {
    event.preventDefault();
    if (slackURL === adminSettings.slackURL) return;

    SettingsService.updateSlackURL(
        JSON.stringify({
          slackURL: slackURL,
        }),
    );
  };

  const handleUpdateQuestionsURL = (event) => {
    event.preventDefault();
    if (questionsURL === queueData.questionsURL) return;

    SettingsService.updateQuestionsURL(
        JSON.stringify({
          questionsURL: questionsURL,
        }),
    );
  };

  const handleUpdateCmuEmailEnabled = (event) => {
    event.preventDefault();

    SettingsService.updateEnforceCmuEmail(
        JSON.stringify({
          enforceCMUEmail: enforceCMUEmail,
        }),
    );
  };

  const handleCooldownOverrideEnabled = (event) => {
    event.preventDefault();

    SettingsService.updateAllowCDOverride(
        JSON.stringify({
          allowCDOverride: allowCDOverride,
        }),
    );
  };

  return (
    <BaseCard>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Configuration Settings
        </Typography>

        <Stack spacing={3}>
          {/* Course Name */}
          <form onSubmit={handleUpdateCourseName}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Typography>Course Name:</Typography>
              <TextField
                size="small"
                value={courseName ?? ''}
                onChange={(e) => setCourseName(e.target.value)}
                sx={{ width: 200 }}
              />
              <Button type="submit" variant="contained">
                Save
              </Button>
              <Typography variant="caption" color="text.secondary">
                Display name for the course
              </Typography>
            </Stack>
          </form>

          {/* Current Semester */}
          <form onSubmit={handleUpdateSemester}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Typography>Current Semester:</Typography>
              <TextField
                size="small"
                value={currSem ?? ''}
                onChange={(e) => setCurrSem(e.target.value)}
                disabled={!userData.isOwner}
                inputProps={{ maxLength: 3 }}
                sx={{ width: 80 }}
              />
              <Button
                type="submit"
                variant="contained"
                disabled={!userData.isOwner}
              >
                Save
              </Button>
              <Typography variant="caption" color="text.secondary">
                {!userData.isOwner ?
                  `Only ${queueData.ownerEmail} can change semester` :
                  'Format: F23, S24, etc'}
              </Typography>
            </Stack>
          </form>

          {/* Enforce CMU Email */}
          <form onSubmit={handleUpdateCmuEmailEnabled}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Typography>Enforce CMU Email:</Typography>
              <Checkbox
                checked={enforceCMUEmail}
                onChange={(e) => setEnforceCMUEmail(e.target.checked)}
              />
              <Button type="submit" variant="contained">
                Save
              </Button>
              <Typography variant="caption" color="text.secondary">
                Require cmu.edu emails
              </Typography>
            </Stack>
          </form>

          {/* Allow Cooldown Override */}
          <form onSubmit={handleCooldownOverrideEnabled}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Typography>Allow Cooldown Override:</Typography>
              <Checkbox
                checked={allowCDOverride}
                onChange={(e) => setAllowCDOverride(e.target.checked)}
              />
              <Button type="submit" variant="contained">
                Save
              </Button>
              <Typography variant="caption" color="text.secondary">
                Allow students to override cooldown
              </Typography>
            </Stack>
          </form>

          {/* Slack Webhook URL */}
          <form onSubmit={handleUpdateSlackURL}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Typography>Slack Webhook URL:</Typography>
              <TextField
                size="small"
                value={slackURL ?? ''}
                onChange={(e) => setSlackURL(e.target.value)}
                placeholder="https://hooks.slack.com/..."
                sx={{ width: 250 }}
              />
              <Button type="submit" variant="contained">
                Save
              </Button>
              <Typography variant="caption" color="text.secondary">
                URL for Slack notifications
              </Typography>
            </Stack>
          </form>

          {/* Questions Guide URL */}
          <form onSubmit={handleUpdateQuestionsURL}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Typography>Questions Guide URL:</Typography>
              <TextField
                size="small"
                value={questionsURL ?? ''}
                onChange={(e) => setQuestionsURL(e.target.value)}
                placeholder="https://..."
                sx={{ width: 250 }}
              />
              <Button type="submit" variant="contained">
                Save
              </Button>
              <Typography variant="caption" color="text.secondary">
                Link to question guidelines
              </Typography>
            </Stack>
          </form>
        </Stack>
      </CardContent>
    </BaseCard>
  );
}
