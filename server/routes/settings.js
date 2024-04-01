const express = require('express');
const router = express.Router();

const settings = require('../controllers/settings');

router.get('/adminSettings', settings.get_queue_settings);

router.post('/videoChat/update', settings.post_update_video_chat);
router.post('/notifs/update', settings.post_update_notifs);
router.post('/preferredname/update', settings.post_update_preferredname);

router.post('/topics/create', settings.post_create_topic);
router.post('/topics/update', settings.post_update_topic);
router.post('/topics/delete', settings.post_delete_topic);
router.post('/topics/downloadCSV', settings.post_download_topic_csv);
router.post('/topics/uploadCSV', settings.post_upload_topic_csv);

router.post('/tas/create', settings.post_create_ta);
router.post('/tas/update', settings.post_update_ta);
router.post('/tas/delete', settings.post_delete_ta);
router.post('/tas/downloadCSV', settings.post_download_ta_csv);
router.post('/tas/uploadCSV', settings.post_upload_ta_csv);

router.post('/config/sem/update', settings.post_update_semester);
router.post('/config/slack/update', settings.post_update_slack_url);
router.post('/config/questions/update', settings.post_update_questions_url);
router.post('/config/rejoin/update', settings.post_update_rejoin_time);
router.post('/config/enforcecmuemail/update', settings.post_update_enforce_cmu_email);
router.post('/config/allowcdoverride/update', settings.post_update_allow_cooldown_override);

router.post('/locations/update', settings.post_update_locations);
router.post('/locations/add', settings.add_location);
router.post('/locations/remove', settings.remove_location);

module.exports = router;
