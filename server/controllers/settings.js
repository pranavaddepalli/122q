// For settings page
const moment = require('moment-timezone');
const Promise = require('bluebird');
const csvtojson = require('csvtojson');

const models = require('../models');
const sockets = require('./sockets');
const slack = require('./slack');
const home = require('./home');
const path = require('path');

// Global admin settings
// FIXME: some default values are set to simplify testing;
// In production, these should be cleared
var fs = require('fs');
const defaultAdminSettings = {
  courseName: '',
  currSem: 'S23',
  slackURL: null,
  questionsURL: '',
  rejoinTime: 15,
  enforceCMUEmail: true,
  allowCDOverride: true,
  dayDictionary: {},
};

const adminSettingsPath = path.join(
  __dirname,
  '..',
  '..',
  'adminSettings.json'
);

let adminSettings = defaultAdminSettings;

// whenever starting server, check if adminSettings.json is up to date
updateAdminSettingsJSON();

function haveSameKeys(obj1, obj2) {
  const obj1Keys = Object.keys(obj1).sort();
  const obj2Keys = Object.keys(obj2).sort();
  return JSON.stringify(obj1Keys) === JSON.stringify(obj2Keys);
}

// If no admin setting have been generated, use the above default values
function _createAdminSettingsJSON() {
  if (!fs.existsSync(adminSettingsPath)) {
    var json = JSON.stringify(adminSettings);
    fs.writeFileSync(adminSettingsPath, json, 'utf8');
  }
}

// If admin settings have been generated, but the keys don't match, update the missing keys
function updateAdminSettingsJSON() {
  if (!fs.existsSync(adminSettingsPath)) {
    _createAdminSettingsJSON();
  }

  if (
    !haveSameKeys(
      adminSettings,
      JSON.parse(fs.readFileSync(adminSettingsPath, 'utf8'))
    )
  ) {
    let currAdminSettings = fs.readFileSync(
      adminSettingsPath,
      'utf8',
      (flag = 'r+')
    );
    let newAdminSettings = JSON.parse(currAdminSettings);
    for (let key in adminSettings) {
      if (!newAdminSettings.hasOwnProperty(key)) {
        newAdminSettings[key] = adminSettings[key];
      }
    }
    var json = JSON.stringify(newAdminSettings);
    fs.writeFileSync(adminSettingsPath, json, 'utf8', function () {
      console.log('Updated admin settings JSON');
    });
  }
}

exports.get_admin_settings = function () {
  // if file doesn't exist, create it
  if (!fs.existsSync(adminSettingsPath)) {
    updateAdminSettingsJSON();
  }

  let data = fs.readFileSync(adminSettingsPath, 'utf8', (flag = 'r+'));
  if (data) {
    adminSettings = JSON.parse(data);
  } else {
    console.log('No admin settings found');
    adminSettings = defaultAdminSettings;
  }

  return adminSettings;
};

exports.get_queue_settings = function (req, res) {
  res.status(200);
  res.json(adminSettings);
};

/** Helper Functions **/
function respond_error(req, res, message, status) {
  res.status(status);
  res.json({ message: message });
}

function respond(req, res, message, data, status) {
  res.status(status);
  if (message) {
    data['message'] = message;
  }
  res.json(data);
}

function respond_success(req, res, message = null) {
  if (!req.user) {
    respond_error(
      req,
      res,
      "You don't have permissions to view this page",
      404
    );
    return;
  }

  respond(req, res, message, {}, 200);
}

function writeAdminSettings(settings) {
  var json = JSON.stringify(settings);
  fs.writeFileSync('../adminSettings.json', json, 'utf8', function () {
    return;
  });
}

/** General Settings **/
exports.post_update_video_chat = function (req, res) {
  if (!req.user || !req.user.isTA) {
    respond_error(
      req,
      res,
      "You don't have permissions to perform this operation",
      403
    );
    return;
  }

  var enabled = req.body.enabled;
  var url = req.body.url;

  let account = req.user.account;
  let ta = req.user.ta;
  let settings = {};
  if (account.settings) {
    settings = account.settings;
  }

  let urlChanged = ta.zoom_url != url;

  settings['videoChatEnabled'] = enabled;
  account.settings = settings;
  account.changed('settings', true); // JSON fields need to be explictly marked as changed
  ta.zoom_url = url;

  Promise.props({
    ta: ta.save(),
    account: account.save(),
  })
    .then(function (results) {
      req.user.account = results.account;
      req.user.ta = results.ta;
      respond_success(
        req,
        res,
        urlChanged ? `Settings updated successfully` : ''
      );
    })
    .catch((err) => {
      console.log(err);
      message = err.message || 'An error occurred while updating settings';
      respond_error(req, res, message, 500);
    });
};

exports.post_update_preferredname = function (req, res) {
  if (!req.user) {
    respond_error(
      req,
      res,
      "You don't have permissions to perform this operation",
      403
    );
    return;
  }
  var pname = req.body.preferred_name;

  let account = req.user.account;
  account.preferred_name = pname;

  Promise.props({
    account: account.save(),
  })
    .then(function (results) {
      req.user.account = results.account;
      respond_success(req, res, `Settings updated successfully`);
    })
    .catch((err) => {
      console.log(err);
      message = err.message || 'An error occurred while updating settings';
      respond_error(req, res, message, 500);
    });
};

exports.post_update_notifs = function (req, res) {
  if (!req.user || !req.user.isTA) {
    respond_error(
      req,
      res,
      "You don't have permissions to perform this operation",
      403
    );
    return;
  }

  var joinEnabled = req.body.joinEnabled;
  var remindEnabled = req.body.remindEnabled;
  var remindTime = req.body.remindTime;

  if (remindTime < 0) {
    // Do nothing if remind time is invalid
    respond_success(req, res);
    return;
  }

  let account = req.user.account;
  let settings = {};
  if (account.settings) {
    settings = account.settings;
  }

  settings['joinNotifsEnabled'] = joinEnabled;
  settings['remindNotifsEnabled'] = remindEnabled;
  settings['remindTime'] = remindTime;
  account.settings = settings;
  account.changed('settings', true); // JSON fields need to be explictly marked as changed

  Promise.props({
    account: account.save(),
  })
    .then(function (results) {
      req.user.account = results.account;
      respond_success(req, res);
    })
    .catch((err) => {
      console.log(err);
      message = err.message || 'An error occurred while updating settings';
      respond_error(req, res, message, 500);
    });
};

/** ADMIN FUNCTIONS **/
/** Config Settings **/
exports.post_update_course_name = function (req, res) {
  if (!req.user || !req.user.isAdmin) {
    respond_error(
      req,
      res,
      "You don't have permissions to perform this operation",
      403
    );
    return;
  }

  var courseName = req.body.courseName;
  // @Review: Any validations needed here (such as empty string)?
  if (!courseName) {
    respond_error(req, res, 'Invalid/missing parameters in request', 400);
    return;
  }

  if (adminSettings.courseName == courseName) {
    respond_success(req, res);
    return;
  }

  // @Review: Should the courseName be stored in the database? Currently, only
  // storing it in the adminSettings.json file. Perhaps could be part of a
  // larger medium-sized effort to move all admin settings to a new table in the
  // database.
  adminSettings.courseName = courseName;
  writeAdminSettings(adminSettings);
  respond_success(
    req,
    res,
    `Course name updated successfully to ${courseName}`
  );
};

exports.post_update_semester = function (req, res) {
  if (!req.user || !req.user.isAdmin) {
    respond_error(
      req,
      res,
      "You don't have permissions to perform this operation",
      403
    );
    return;
  }

  var sem_id = req.body.sem_id;
  if (!sem_id || sem_id.length != 3) {
    respond_error(req, res, 'Invalid/missing parameters in request', 400);
    return;
  }

  // If already at current semester, no need to change
  if (sem_id == adminSettings.currSem) {
    respond_success(req, res);
    return;
  }

  models.semester
    .findOrCreate({
      where: {
        sem_id: sem_id,
      },
    })
    .then(function (results) {
      adminSettings.currSem = results[0].sem_id;
      writeAdminSettings(adminSettings);
      respond_success(
        req,
        res,
        `Current semester set to ${sem_id} successfully`
      );
    })
    .catch((err) => {
      message =
        err.message || 'An error occurred while updating current semester';
      respond_error(req, res, message, 500);
    });
};

exports.post_update_slack_url = function (req, res) {
  if (!req.user || !req.user.isAdmin) {
    respond_error(
      req,
      res,
      "You don't have permissions to perform this operation",
      403
    );
    return;
  }

  var slackURL = req.body.slackURL;
  if (!slackURL) {
    respond_error(req, res, 'Invalid/missing parameters in request', 400);
    return;
  }

  if (adminSettings.slackURL == slackURL) return;

  adminSettings.slackURL = slackURL;
  writeAdminSettings(adminSettings);
  slack.update_slack();
  respond_success(req, res, `Slack Webhook URL updated successfully`);
};

exports.post_update_questions_url = function (req, res) {
  if (!req.user || !req.user.isAdmin) {
    respond_error(
      req,
      res,
      "You don't have permissions to perform this operation",
      403
    );
    return;
  }

  var questionsURL = req.body.questionsURL;
  if (!questionsURL) {
    respond_error(req, res, 'Invalid/missing parameters in request', 400);
    return;
  }

  if (adminSettings.questionsURL == questionsURL) return;

  adminSettings.questionsURL = questionsURL;
  writeAdminSettings(adminSettings);
  home.emit_new_queue_data();
  respond_success(req, res, `Questions Guide URL updated successfully`);
};

exports.post_update_rejoin_time = function (req, res) {
  if (!req.user || !req.user.isAdmin) {
    respond_error(
      req,
      res,
      "You don't have permissions to perform this operation",
      403
    );
    return;
  }

  var rejoinTime = req.body.rejoinTime;
  if (!rejoinTime || isNaN(rejoinTime)) {
    respond_error(req, res, 'Invalid/missing parameters in request', 400);
    return;
  }

  if (adminSettings.rejoinTime == rejoinTime) return;

  adminSettings.rejoinTime = rejoinTime;
  writeAdminSettings(adminSettings);
  home.emit_new_queue_data();
  respond_success(
    req,
    res,
    `Rejoin time updated successfully to ${rejoinTime} minutes`
  );
};

exports.post_update_enforce_cmu_email = function (req, res) {
  if (!req.user || !req.user.isAdmin) {
    respond_error(
      req,
      res,
      "You don't have permissions to perform this operation",
      403
    );
    return;
  }

  var enforceCMUEmail = req.body.enforceCMUEmail;

  if (enforceCMUEmail == null || enforceCMUEmail == undefined) {
    respond_error(req, res, 'Invalid/missing parameters in request', 400);
    return;
  }

  if (adminSettings.enforceCMUEmail == enforceCMUEmail) return;

  adminSettings.enforceCMUEmail = enforceCMUEmail;
  writeAdminSettings(adminSettings);
  respond_success(
    req,
    res,
    `Enforcing CMU email updated successfully to: ${enforceCMUEmail}`
  );
};

exports.post_update_allow_cooldown_override = function (req, res) {
  if (!req.user || !req.user.isAdmin) {
    respond_error(
      req,
      res,
      "You don't have permission to perform this operation",
      403
    );
    return;
  }

  var allowCDOverride = req.body.allowCDOverride;

  if (allowCDOverride == null || allowCDOverride == undefined) {
    respond_error(req, res, 'Invalid/missing parameters in request', 400);
    return;
  }

  if (adminSettings.allowCDOverride == allowCDOverride) return;

  adminSettings.allowCDOverride = allowCDOverride;
  writeAdminSettings(adminSettings);
  home.emit_new_queue_data();
  respond_success(
    req,
    res,
    `Allow Cooldown Override updated successfuly to: ${allowCDOverride}`
  );
};

/** Topics Functions **/
exports.post_create_topic = function (req, res) {
  if (!req.user || !req.user.isAdmin) {
    respond_error(
      req,
      res,
      "You don't have permissions to perform this operation",
      403
    );
    return;
  }

  var name = req.body.name;
  var category = req.body.category;
  var start_date = moment
    .tz(new Date(req.body.start_date), 'America/New_York')
    .toDate(); // TODO: get timezone (get from client? global config?)
  var end_date = moment
    .tz(new Date(req.body.end_date), 'America/New_York')
    .toDate();
  if (!start_date.getTime() || !end_date.getTime() || !name || !category) {
    respond_error(req, res, 'Invalid/missing parameters in request', 400);
    return;
  }

  Promise.props({
    assignment: (function () {
      return models.assignment.findOrCreate({
        where: {
          name: name,
          category: category,
        },
      });
    })(),
  })
    .then(function (results) {
      return models.assignment_semester.create({
        assignment_id: results.assignment[0].assignment_id,
        sem_id: adminSettings.currSem,
        start_date: start_date,
        end_date: end_date,
      });
    })
    .then(function () {
      home.emit_new_queue_data();
      respond_success(req, res, `Assignment ${name} created successfully`);
    })
    .catch((err) => {
      message = err.message || 'An error occurred while creating topic';
      respond_error(req, res, message, 500);
    });
};

exports.post_update_topic = function (req, res) {
  if (!req.user || !req.user.isAdmin) {
    respond_error(
      req,
      res,
      "You don't have permissions to perform this operation",
      403
    );
    return;
  }

  var assignment_id = req.body.assignment_id;
  var name = req.body.name;
  var category = req.body.category;
  var start_date = moment
    .tz(new Date(req.body.start_date), 'America/New_York')
    .toDate(); // TODO: get timezone (get from client? global config?)
  var end_date = moment
    .tz(new Date(req.body.end_date), 'America/New_York')
    .toDate();
  if (
    !start_date.getTime() ||
    !end_date.getTime() ||
    !name ||
    !category ||
    !assignment_id
  ) {
    respond_error(req, res, 'Invalid/missing parameters in request', 400);
    return;
  }

  Promise.props({
    assignment_semester: (function () {
      return models.assignment_semester.findOne({
        where: {
          assignment_id: assignment_id,
          sem_id: adminSettings.currSem,
        },
      });
    })(),
    assignment: (function () {
      return models.assignment.findOne({
        where: {
          assignment_id: assignment_id,
        },
      });
    })(),
  })
    .then(function (results) {
      if (results.assignment_semester == null || results.assignment == null) {
        respond_error(req, res, 'Invalid assignment id: topic not found', 400);
        return;
      }

      return Promise.props({
        assignment_semester: (function () {
          return results.assignment_semester.update({
            start_date: start_date,
            end_date: end_date,
          });
        })(),
        assignment: (function () {
          return results.assignment.update({
            name: name,
            category: category,
          });
        })(),
      });
    })
    .then(function () {
      home.emit_new_queue_data();
      respond_success(req, res, `Assignment ${name} updated successfully`);
    })
    .catch((err) => {
      message = err.message || 'An error occurred while updating topic';
      respond_error(req, res, message, 500);
    });
};

exports.post_delete_topic = function (req, res) {
  if (!req.user || !req.user.isAdmin) {
    respond_error(
      req,
      res,
      "You don't have permissions to perform this operation",
      403
    );
    return;
  }

  var assignment_id = req.body.assignment_id;
  if (!assignment_id) {
    respond_error(req, res, 'Invalid/missing parameters in request', 400);
    return;
  }

  models.assignment
    .destroy({
      where: {
        assignment_id: assignment_id,
      },
    })
    .then(function () {
      home.emit_new_queue_data();
      respond_success(req, res, `Assignment deleted successfully`);
    })
    .catch((err) => {
      message = err.message || 'An error occurred while deleting topic';
      respond_error(req, res, message, 500);
    });
};

exports.post_download_topic_csv = function (req, res) {
  if (!req.user || !req.user.isAdmin) {
    respond_error(
      req,
      res,
      "You don't have permissions to perform this operation",
      403
    );
    return;
  }

  try {
    const file = `${__dirname}/../public/files/topics_example.csv`;
    res.download(file);
  } catch (err) {
    console.log(err);
    message = err.message || 'An error occurred while downloading CSV';
    respond_error(req, res, message, 500);
  }
};

exports.post_upload_topic_csv = function (req, res) {
  if (!req.user || !req.user.isAdmin) {
    respond_error(
      req,
      res,
      "You don't have permissions to perform this operation",
      403
    );
    return;
  }

  const file = req.file;
  if (!file) {
    respond_error(req, res, 'No CSV file was uploaded', 400);
    return;
  }

  let csvData = file.buffer.toString('utf8');
  csvtojson()
    .fromString(csvData)
    .then(async (data) => {
      var assignments = [];
      var topics = [];
      for (var i = 0; i < data.length; ++i) {
        topics.push(data[i]);
      }

      await Promise.all(
        topics.map((topic) => {
          var name = topic.name;
          var category = topic.category;
          var start_date = new Date(topic.start_date);
          var end_date = new Date(topic.end_date);

          if (
            !start_date.getTime() ||
            !end_date.getTime() ||
            !name ||
            !category
          ) {
            throw new Error('Invalid fields in CSV file');
          }

          assignments.push(
            models.assignment
              .findOrCreate({
                where: {
                  name: name,
                  category: category,
                },
              })
              .then(([assignment]) => {
                return Promise.props({
                  assignment_semester: models.assignment_semester.findOne({
                    where: {
                      assignment_id: assignment.assignment_id,
                      sem_id: adminSettings.currSem,
                    },
                  }),
                  assignment: assignment,
                });
              })
              .then((result) => {
                let assignment_semester = result.assignment_semester;
                let assignment = result.assignment;

                if (!assignment_semester) {
                  return models.assignment_semester.create({
                    assignment_id: assignment.assignment_id,
                    sem_id: adminSettings.currSem,
                    start_date: start_date,
                    end_date: end_date,
                  });
                }

                return assignment_semester.update({
                  start_date: start_date,
                  end_date: end_date,
                });
              })
          );
        })
      );

      return Promise.props({
        assignments: Promise.all(assignments),
      });
    })
    .then(() => {
      home.emit_new_queue_data();
      respond_success(req, res, `Assignments created successfully`);
    })
    .catch((err) => {
      console.log(err);
      message =
        err.message || 'An error occurred while creating uploaded topics';
      respond_error(req, res, message, 500);
    });
};

/** TA Functions **/
exports.post_create_ta = function (req, res) {
  if (!req.user || !req.user.isAdmin) {
    respond_error(
      req,
      res,
      "You don't have permissions to perform this operation",
      403
    );
    return;
  }

  var name = req.body.name;
  var email = req.body.email;
  var isAdmin = req.body.isAdmin;
  if (!name || !email) {
    respond_error(req, res, 'Invalid/missing parameters in request', 400);
    return;
  }

  models.account
    .findOrCreate({
      where: {
        email: email,
      },
    })
    .then(function ([account, accountCreated]) {
      return Promise.props({
        account: (function () {
          if (accountCreated) {
            account.set({ name: name, preferred_name: name });
          }
          return account.save();
        })(),
        semester_user: models.semester_user.findOrCreate({
          where: {
            user_id: account.user_id,
            sem_id: adminSettings.currSem,
          },
        }),
        ta: models.ta.findOrCreate({
          where: {
            ta_id: account.user_id,
          },
        }),
      });
    })
    .then(function (results) {
      return Promise.props({
        semester_user: results.semester_user[0].update({
          is_ta: 1,
        }),
        ta: results.ta[0].update({
          is_admin: isAdmin ? 1 : 0,
        }),
      });
    })
    .then(function () {
      home.emit_new_queue_data();
      respond_success(req, res, `TA ${name} created successfully`);
    })
    .catch((err) => {
      console.log(err);
      message = err.message || 'An error occurred while creating topic';
      respond_error(req, res, message, 500);
    });
};

exports.post_update_ta = function (req, res) {
  if (!req.user || !req.user.isAdmin) {
    respond_error(
      req,
      res,
      "You don't have permissions to perform this operation",
      403
    );
    return;
  }

  var user_id = req.body.user_id;
  var isAdmin = req.body.isAdmin;
  if (!user_id) {
    respond_error(req, res, 'Invalid/missing parameters in request', 400);
    return;
  }

  Promise.props({
    semester_user: (function () {
      // We grab this to verify the user exists for this semester
      return models.semester_user.findOne({
        where: {
          user_id: user_id,
          sem_id: adminSettings.currSem,
        },
      });
    })(),
    account: (function () {
      // We grab this to verify the user has an account
      return models.account.findOne({
        where: {
          user_id: user_id,
        },
      });
    })(),
    ta: (function () {
      return models.ta.findOne({
        where: {
          ta_id: user_id,
        },
      });
    })(),
  })
    .then(function (results) {
      if (
        results.semester_user == null ||
        results.account == null ||
        results.ta == null
      ) {
        respond_error(req, res, 'Invalid user id: TA not found', 400);
        return;
      }

      return Promise.props({
        ta: (function () {
          return results.ta.update({
            is_admin: isAdmin ? 1 : 0,
          });
        })(),
        name: results.account.name,
      });
    })
    .then(function (results) {
      home.emit_new_queue_data();
      respond_success(req, res, `TA ${results.name} updated successfully`);
    })
    .catch((err) => {
      message = err.message || 'An error occurred while updating TA';
      respond_error(req, res, message, 500);
    });
};

exports.post_delete_ta = function (req, res) {
  if (!req.user || !req.user.isAdmin) {
    respond_error(
      req,
      res,
      "You don't have permissions to perform this operation",
      403
    );
    return;
  }

  var user_id = req.body.user_id;
  if (!user_id) {
    respond_error(req, res, 'Invalid/missing parameters in request', 400);
    return;
  }

  models.semester_user
    .findOne({
      where: {
        user_id: user_id,
        sem_id: adminSettings.currSem,
      },
    })
    .then(function (sem_user) {
      return sem_user.update({
        is_ta: 0,
      });
    })
    .then(function () {
      home.emit_new_queue_data();
      respond_success(req, res, `TA deleted successfully`);
    })
    .catch((err) => {
      message = err.message || 'An error occurred while deleting TA';
      respond_error(req, res, message, 500);
    });
};

exports.post_download_ta_csv = function (req, res) {
  if (!req.user || !req.user.isAdmin) {
    respond_error(
      req,
      res,
      "You don't have permissions to perform this operation",
      403
    );
    return;
  }

  try {
    const file = `${__dirname}/../public/files/tas_example.csv`;
    res.download(file);
  } catch (err) {
    console.log(err);
    message = err.message || 'An error occurred while downloading CSV';
    respond_error(req, res, message, 500);
  }
};

exports.post_upload_ta_csv = function (req, res) {
  if (!req.user || !req.user.isAdmin) {
    respond_error(
      req,
      res,
      "You don't have permissions to perform this operation",
      403
    );
    return;
  }

  const file = req.file;
  if (!file) {
    respond_error(req, res, 'No CSV file was uploaded', 400);
    return;
  }

  let csvData = file.buffer.toString('utf8');
  csvtojson()
    .fromString(csvData)
    .then((data) => {
      var tas = [];
      for (var i = 0; i < data.length; ++i) {
        var name = data[i].name;
        var email = data[i].email;
        var is_admin = data[i].is_admin;

        if (!name || !email || !is_admin) {
          throw new Error('Invalid fields in CSV file');
        }

        is_admin = is_admin.toLowerCase() == 'true';

        tas.push(
          Promise.props({
            name: name,
            isAdmin: is_admin,
            account: models.account.findOrCreate({
              where: {
                email: email,
              },
            }),
          })
            .then((results) => {
              let [account, accountCreated] = results.account;
              return Promise.props({
                account: (function () {
                  if (accountCreated) {
                    account.set({
                      name: results.name,
                      preferred_name: results.name,
                    });
                  }
                  return account.save();
                })(),
                semester_user: models.semester_user.findOrCreate({
                  where: {
                    user_id: account.user_id,
                    sem_id: adminSettings.currSem,
                  },
                }),
                ta: models.ta.findOrCreate({
                  where: {
                    ta_id: account.user_id,
                  },
                }),
                isAdmin: results.isAdmin,
              });
            })
            .then((results) => {
              return Promise.props({
                semester_user: results.semester_user[0].update({
                  is_ta: 1,
                }),
                ta: results.ta[0].update({
                  is_admin: results.isAdmin ? 1 : 0,
                }),
              });
            })
        );
      }

      return Promise.props({
        tas: Promise.all(tas),
      });
    })
    .then(() => {
      home.emit_new_queue_data();
      respond_success(req, res, `TAs created successfully`);
    })
    .catch((err) => {
      console.log(err);
      message = err.message || 'An error occurred while creating uploaded tas';
      respond_error(req, res, message, 500);
    });
};

/* BEGIN LOCATIONS */
// invariant: rooms are held at -1 to make sure they appear in the options, but could be empty days
// when removing a room, need to remove it from -1 as well
// mapping is 1-to-1 where Sunday = 0... Saturday = 6

const dayToRoomDictionary = (obj) => {
  if (obj) {
    return Object.entries(obj).reduce((ret, entry) => {
      const [key, rooms] = entry;
      for (let roomIdx in rooms) {
        let room = rooms[roomIdx];
        if (ret[room]) {
          // seen before
          let keyInt = parseInt(key);
          if (keyInt != null) {
            ret[room].push(keyInt);
          }
        } else {
          let keyInt = parseInt(key);
          if (keyInt != null) {
            ret[room] = [keyInt];
          }
        }
      }

      return ret;
    }, {});
  } else {
    return {};
  }
};

exports.add_location = function (req, res) {
  if (!req.user || !req.user.isAdmin) {
    respond_error(
      req,
      res,
      "You don't have permissions to perform this operation",
      403
    );
    return;
  }

  var room = req.body.room;
  if (!room) {
    respond_error(req, res, 'Invalid/missing parameters in request', 400);
    return;
  }

  if (adminSettings.dayDictionary['-1']) {
    adminSettings.dayDictionary['-1'].push(room);
  } else {
    adminSettings.dayDictionary['-1'] = [room];
  }

  writeAdminSettings(adminSettings);
  home.emit_new_queue_data();
  respond_success(req, res, `Location added successfully`);
};

exports.post_update_locations = function (req, res) {
  if (!req.user || !req.user.isAdmin) {
    respond_error(
      req,
      res,
      "You don't have permissions to perform this operation",
      403
    );
    return;
  }

  var room = req.body.room;
  var days = req.body.days;
  var daysOfWeek = req.body.daysOfWeek;
  if (!room || !days || !daysOfWeek) {
    respond_error(req, res, 'Invalid/missing parameters in request', 400);
    return;
  }

  var newDayDictionary = adminSettings.dayDictionary;
  for (var day in daysOfWeek) {
    if (days.includes(daysOfWeek[day])) {
      // day is selected for room
      // check to see if room already appears for that day in dayDictionary
      let currRoomForDay = newDayDictionary[day];
      if (!currRoomForDay) {
        // no rooms for this day yet
        newDayDictionary[day] = [room];
      } else if (currRoomForDay && !currRoomForDay.includes(room)) {
        currRoomForDay.push(room);
        newDayDictionary[day] = currRoomForDay;
      }
    } else {
      // day is NOT selected for room
      // make sure that it room doesn't appear for that day
      let currRoomForDay = newDayDictionary[day];
      if (currRoomForDay && currRoomForDay.includes(room)) {
        currRoomForDay.splice(currRoomForDay.indexOf(room), 1);
        newDayDictionary[day] = currRoomForDay;
      }
    }
  }
  adminSettings.dayDictionary = newDayDictionary;

  writeAdminSettings(adminSettings);
  home.emit_new_queue_data();
  respond_success(req, res, `Location changed successfully`);
};

exports.internal_get_locations = function () {
  return {
    dayDictionary: adminSettings.dayDictionary,
    roomDictionary: dayToRoomDictionary(adminSettings.dayDictionary),
  };
};

exports.remove_location = function (req, res) {
  if (!req.user || !req.user.isAdmin) {
    respond_error(
      req,
      res,
      "You don't have permissions to perform this operation",
      403
    );
    return;
  }

  var room = req.body.room;
  var days = req.body.days;
  if (!room || !days) {
    respond_error(req, res, 'Invalid/missing parameters in request', 400);
    return;
  }

  for (dayIdx in days) {
    if (dayIdx && dayIdx != null) {
      let dayInt = days[dayIdx];
      if (!adminSettings.dayDictionary[dayInt].includes(room)) {
        console.log("hmm shouldn't really have a day selected for this room");
      } else {
        let roomArrForDay = adminSettings.dayDictionary[dayInt];
        // safe because room is in roomArrForDay so idx >= 0
        roomArrForDay.splice(roomArrForDay.indexOf(room), 1);
        adminSettings.dayDictionary[dayInt] = roomArrForDay;
      }
    }
  }

  // REMOVE ROOM FROM -1!!
  let emptyRoomArr = adminSettings.dayDictionary['-1'];
  let idx = emptyRoomArr.indexOf(room);
  if (idx >= 0) {
    emptyRoomArr.splice(idx, 1);
  }
  adminSettings.dayDictionary['-1'] = emptyRoomArr;

  writeAdminSettings(adminSettings);
  home.emit_new_queue_data();
  respond_success(req, res, `Location removed successfully`);
};
