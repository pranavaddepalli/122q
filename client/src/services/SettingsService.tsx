import http from '../http-common';

class SettingsDataService {
  getAdminSettings() {
    return http.get('/settings/adminSettings');
  }
  updateVideoChatSettings(data) {
    return http.post('/settings/videoChat/update', data);
  }
  updateNotifSettings(data) {
    return http.post('/settings/notifs/update', data);
  }
  createTopic(data) {
    return http.post('/settings/topics/create', data);
  }
  updateTopic(data) {
    return http.post('/settings/topics/update', data);
  }
  deleteTopic(data) {
    return http.post('/settings/topics/delete', data);
  }
  downloadTopicCSV() {
    return http.post('/settings/topics/downloadCSV');
  }
  uploadTopicCSV(data) {
    return http.post('/settings/topics/uploadCSV', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }
  createTA(data) {
    return http.post('/settings/tas/create', data);
  }
  updateTA(data) {
    return http.post('/settings/tas/update', data);
  }
  deleteTA(data) {
    return http.post('/settings/tas/delete', data);
  }
  downloadTACSV() {
    return http.post('/settings/tas/downloadCSV');
  }
  uploadTACSV(data) {
    return http.post('/settings/tas/uploadCSV', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }
  updateCourseName(data) {
    return http.post('/settings/config/coursename/update', data);
  }
  updateSemester(data) {
    return http.post('/settings/config/sem/update', data);
  }
  updateSlackURL(data) {
    return http.post('/settings/config/slack/update', data);
  }
  updateQuestionsURL(data) {
    return http.post('/settings/config/questions/update', data);
  }
  updateRejoinTime(data) {
    return http.post('/settings/config/rejoin/update', data);
  }
  updateEnforceCmuEmail(data) {
    return http.post('/settings/config/enforcecmuemail/update', data);
  }
  updateAllowCDOverride(data) {
    return http.post('/settings/config/allowcdoverride/update', data);
  }
  updatePreferredName(data) {
    return http.post('/settings/preferredname/update', data);
  }
  updateLocations(data) {
    return http.post('/settings/locations/update', data);
  }
  addLocation(data) {
    return http.post('/settings/locations/add', data);
  }
  removeLocation(data) {
    return http.post('/settings/locations/remove', data);
  }
}

export default new SettingsDataService();
