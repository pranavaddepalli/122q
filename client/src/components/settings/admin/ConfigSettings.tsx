
import React, {useState, useEffect, useContext} from 'react';
import {
  Button, CardContent, Typography, TextField, Grid, Checkbox,
} from '@mui/material';

import BaseCard from '../../common/cards/BaseCard';

import SettingsService from '../../../services/SettingsService';
import {AdminSettingsContext} from '../../../contexts/AdminSettingsContext';
import {QueueDataContext} from '../../../contexts/QueueDataContext';

export default function ConfigSettings(props) {
  const {adminSettings} = useContext(AdminSettingsContext);
  const {queueData} = useContext(QueueDataContext);

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
        <Typography sx={{fontWeight: 'bold', ml: 1, mt: 1}} variant="body1" gutterBottom>
          Config Settings
        </Typography>
        <form onSubmit={handleUpdateCourseName}>
          <Grid container spacing={2} sx={{mb: 2}}>
            <Grid className="d-flex" item sx={{mx: 1, ml: 1}}>
              Course Name:
              <TextField
                id="course-name"
                placeholder="Course Name"
                variant="standard"
                sx={{ml: 1, mt: -1}}
                style={{width: '160px'}}
                value={courseName ?? ''}
                onChange={(e) => {
                  setCourseName(e.target.value);
                }}
              />
            </Grid>
            <Grid className="d-flex" item sx={{mr: 2}} xs={1.5}>
              <Button type="submit" variant="contained">Save</Button>
            </Grid>
          </Grid>
        </form>
        <form onSubmit={handleUpdateSemester}>
          <Grid container spacing={2} sx={{mb: 2}}>
            <Grid className="d-flex" item sx={{mt: 1, ml: 1}}>
              Current Semester:
              <TextField
                id="current-sem"
                variant="standard"
                sx={{ml: 1, mt: -1}}
                style={{width: '60px'}}
                inputProps={{maxLength: 3}}
                value={currSem ?? ''}
                onChange={(e) => {
                  setCurrSem(e.target.value);
                }}
              />
            </Grid>
            <Grid className="d-flex" item sx={{mr: 2}}>
              <Button type="submit" variant="contained">Save</Button>
            </Grid>
          </Grid>
        </form>
        <form onSubmit={handleUpdateCmuEmailEnabled}>
          <Grid container spacing={2} sx={{mb: 2}}>
            <Grid className="d-flex" item sx={{mt: 1, ml: 1}}>
              Enforce CMU Email:
              <Checkbox
                size="small"
                sx={{ml: 1}}
                checked={enforceCMUEmail}
                onChange={(e) => {
                  setEnforceCMUEmail(e.target.checked);
                }}
              />
            </Grid>
            <Grid className="d-flex" item sx={{mt: 1, mr: 2}}>
              <Button type="submit" variant="contained">Save</Button>
            </Grid>
          </Grid>
        </form>
        <form onSubmit={handleCooldownOverrideEnabled}>
          <Grid container spacing={2} sx={{mb: 2}}>
            <Grid className="d-flex" item sx={{mt: 1, ml: 1}}>
              Allow Cooldown Override:
              <Checkbox
                size="small"
                sx={{ml: 1}}
                checked={allowCDOverride}
                onChange={(e) => {
                  setAllowCDOverride(e.target.checked);
                }}
              />
            </Grid>
            <Grid className="d-flex" item sx={{mt: 1, mr: 2}}>
              <Button type="submit" variant="contained">Save</Button>
            </Grid>
          </Grid>
        </form>
        <form onSubmit={handleUpdateSlackURL}>
          <Grid container spacing={2} sx={{mt: 1, mb: 2}}>
            <Grid className="d-flex" item sx={{mx: 1}} xs={10}>
              <TextField
                id="slack-url"
                placeholder="Slack Webhook URL"
                variant="standard"
                fullWidth
                value={slackURL ?? ''}
                onChange={(e) => {
                  setSlackURL(e.target.value);
                }}
              />
            </Grid>
            <Grid className="d-flex" item sx={{mr: 2}} xs={1.5}>
              <Button type="submit" variant="contained">Save</Button>
            </Grid>
          </Grid>
        </form>
        <form onSubmit={handleUpdateQuestionsURL}>
          <Grid container spacing={2}>
            <Grid className="d-flex" item sx={{mx: 1, mb: 1}} xs={10}>
              <TextField
                id="questions-url"
                placeholder="Questions Guide URL"
                variant="standard"
                fullWidth
                value={questionsURL ?? ''}
                onChange={(e) => {
                  setQuestionsURL(e.target.value);
                }}
              />
            </Grid>
            <Grid className="d-flex" item sx={{mr: 2}} xs={1.5}>
              <Button type="submit" variant="contained">Save</Button>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </BaseCard>
  );
}
