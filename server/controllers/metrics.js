const Sequelize = require('sequelize');
const Promise = require("bluebird");
const moment = require("moment-timezone");
let settings = require('./settings');

const models = require('../models');
const { sequelize } = require('../models');

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

exports.get_helped_students = (req, res) => {
    if (!req.user || !req.user.isTA) {
        respond_error(req, res, "You don't have permissions to perform this operation", 403);
        return;
    }

    let questions = [];
    models.question.findAll({
        where: {
            ta_id: req.user.ta.ta_id,
            help_time: {
                [Sequelize.Op.ne]: null
            },
            sem_id: settings.get_admin_settings().currSem,
        },
        order: [['entry_time', 'DESC']]
    }).then((questionModels) =>  {
        let accountReqs = [];

        for (const questionModel of questionModels) {
            let question = questionModel.dataValues;
            questions.push({
                student_name: "",
                student_andrew: "",
                start_date: question.help_time,
                end_date: question.exit_time,
                question: question.question
            });

            accountReqs.push(models.account.findByPk(question.student_id));
        }

        return Promise.all(accountReqs);
    }).then((accounts) => {
        for (var i = 0; i < questions.length; i++) {
            let account = accounts[i].dataValues;
            if (account != null) {
                questions[i].student_name = account.preferred_name;
                questions[i].student_andrew = account.email.split("@")[0];
            }
        }

        respond(req, res, "Got helped students", { helpedStudents: questions }, 200);
    });
}

exports.get_num_questions_answered = (req, res) => {
    if (!req.user || !req.user.isTA) {
        respond_error(req, res, "You don't have permissions to perform this operation", 403);
        return;
    }

    models.question.findAndCountAll({
        where: {
            ta_id: req.user.ta.ta_id,
            help_time: {
                [Sequelize.Op.ne]: null
            },
            sem_id: settings.get_admin_settings().currSem,
        }
    }).then(({count, rows}) =>  {
        respond(req, res, "Got number of questions answered", { numQuestions: count }, 200);
    });
}

exports.get_avg_time_per_question = (req, res) => {
    if (!req.user || !req.user.isTA) {
        respond_error(req, res, "You don't have permissions to perform this operation", 403);
        return;
    }

    models.question.findAndCountAll({
        where: {
            ta_id: req.user.ta.ta_id,
            help_time: {
                [Sequelize.Op.ne]: null,
            },
            sem_id: settings.get_admin_settings().currSem,
        }
    }).then(({count, rows}) =>  {
        let averageTime = 0;

        for (const questionModel of rows) {
            let question = questionModel.dataValues;
            averageTime += (question.exit_time - question.help_time) / 1000 / 60;
        }

        if (count != 0) averageTime /= count;

        respond(req, res, "Got average time per question", { averageTime: averageTime }, 200);
    });
}

exports.get_num_questions_today = (req, res) => {
    if (!req.user || !req.user.isTA) {
        respond_error(req, res, "You don't have permissions to perform this operation", 403);
        return;
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);


    models.question.findAndCountAll({
        where: {
            entry_time: {
                [Sequelize.Op.between]: [startOfDay, endOfDay],
            },
            sem_id: settings.get_admin_settings().currSem,
        }
    }).then(({count}) =>  {
        respond(req, res, "Got number of questions today", { numQuestionsToday: count }, 200);
    });
}


exports.get_num_bad_questions_today = (req, res) => {
    if (!req.user || !req.user.isTA) {
        respond_error(req, res, "You don't have permissions to perform this operation", 403);
        return;
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    models.question.findAndCountAll({
        where: {
            entry_time: {
                [Sequelize.Op.between]: [startOfDay, endOfDay],
            },
            num_asked_to_fix: {
                [Sequelize.Op.gt]: 0
            },
            sem_id: settings.get_admin_settings().currSem,
        }
    }).then(({count}) =>  {
        respond(req, res, "Got number of bad questions today", { numBadQuestionsToday: count }, 200);
    });
}

exports.get_avg_wait_time_today = (req, res) => {
    if (!req.user || !req.user.isTA) {
        respond_error(req, res, "You don't have permissions to perform this operation", 403);
        return;
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    models.question.findAndCountAll({
        where: {
            entry_time: {
                [Sequelize.Op.between]: [startOfDay, endOfDay],
            },
            help_time: {
                [Sequelize.Op.ne]: null,
            },
            sem_id: settings.get_admin_settings().currSem,
        }
    }).then(({count, rows}) =>  {

        let avgWaitTime = 0;

        for (const questionModel of rows) {
            let question = questionModel.dataValues;
            avgWaitTime += (question.help_time - question.entry_time) / 1000 / 60;
        }

        if (count != 0) avgWaitTime /= count;

        respond(req, res, "Got average wait time today", { avgWaitTime: avgWaitTime }, 200);
    });
}

exports.get_ta_student_ratio_today = (req, res) => {
    if (!req.user || !req.user.isTA) {
        respond_error(req, res, "You don't have permissions to perform this operation", 403);
        return;
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    models.question.findAndCountAll({
        where: {
            entry_time: {
                [Sequelize.Op.between]: [startOfDay, endOfDay],
            },
            sem_id: settings.get_admin_settings().currSem,
        }
    }).then(({count, rows}) =>  {
        const taCount = rows.reduce((acc, questionModel) => {
            let question = questionModel.dataValues;

            acc[question.ta_id] = (acc[question.ta_id] || 0) + 1;
            return acc;
        }, {});

        const studentCount = rows.reduce((acc, questionModel) => {
            let question = questionModel.dataValues;

            acc[question.student_id] = (acc[question.student_id] || 0) + 1;
            return acc;
        }, {});

        function reduce(numerator,denominator){
            var gcd = function gcd(a,b){
              return b ? gcd(b, a%b) : a;
            };
            gcd = gcd(numerator,denominator);
            return [numerator/gcd, denominator/gcd];
          }

        const ratio = reduce(Object.keys(taCount).length, Object.keys(studentCount).length);

        respond(req, res, "Got TA:Student ratio today", { taStudentRatio: ratio[0] + ":" + ratio[1] }, 200);
    });
}

exports.get_total_num_questions = (req, res) => {
    if (!req.user || !req.user.isTA) {
        respond_error(req, res, "You don't have permissions to perform this operation", 403);
        return;
    }

    models.question.findAndCountAll({
        where: {
            sem_id: settings.get_admin_settings().currSem,
            help_time: {
                [Sequelize.Op.ne]: null
            },
        }
    }).then(({count}) =>  {
        respond(req, res, "Got number of questions answered", { numQuestions: count }, 200);
    });
}

exports.get_total_avg_time_per_question = (req, res) => {
    if (!req.user || !req.user.isTA) {
        respond_error(req, res, "You don't have permissions to perform this operation", 403);
        return;
    }

    models.question.findAndCountAll({
        where: {
            help_time: {
                [Sequelize.Op.ne]: null,
            },
            sem_id: settings.get_admin_settings().currSem,
        }
    }).then(({count, rows}) =>  {
        let averageTime = 0;

        for (const questionModel of rows) {
            let question = questionModel.dataValues;
            averageTime += (question.exit_time - question.help_time) / 1000 / 60;
        }

        if (count != 0) averageTime /= count;

        respond(req, res, "Got average time per question", { averageTime: averageTime }, 200);
    });
}

exports.get_total_avg_wait_time = (req, res) => {
    if (!req.user || !req.user.isTA) {
        respond_error(req, res, "You don't have permissions to perform this operation", 403);
        return;
    }

    models.question.findAndCountAll({
        where: {
            help_time: {
                [Sequelize.Op.ne]: null,
            },
            sem_id: settings.get_admin_settings().currSem,
        }
    }).then(({count, rows}) =>  {

        let avgWaitTime = 0;

        for (const questionModel of rows) {
            let question = questionModel.dataValues;
            avgWaitTime += (question.help_time - question.entry_time) / 1000 / 60;
        }

        if (count != 0) avgWaitTime /= count;

        respond(req, res, "Got average wait time", { totalAvgWaitTime: avgWaitTime }, 200);
    });
}

exports.get_num_students_per_day_last_week = (req, res) => {
    if (!req.user || !req.user.isTA) {
        respond_error(req, res, "You don't have permissions to perform this operation", 403);
        return;
    }

    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7);

    models.question.findAll({
        attributes: [
            [Sequelize.fn('date', Sequelize.literal(`"entry_time" AT TIME ZONE 'EST'`)), 'day'],
            [Sequelize.fn('count', Sequelize.col('question_id')), 'count']
        ],
        where: {
            entry_time: {
                [Sequelize.Op.gte]: sevenDaysAgo,
            },
            help_time: {
                [Sequelize.Op.ne]: null
            },
            sem_id: settings.get_admin_settings().currSem,
        },
        group: [Sequelize.fn('date', Sequelize.literal(`"entry_time" AT TIME ZONE 'EST'`))],
        order: [[Sequelize.col('day'), 'ASC']]
    }).then((data) =>  {
        let numStudentsPerDayLastWeek = [];

        for (const row of data) {
            let datecount = row.dataValues;
            numStudentsPerDayLastWeek.push({'day': datecount.day, 'students': datecount.count});
        }

        respond(req, res, "Got number of students per day last week", { numStudentsPerDayLastWeek: numStudentsPerDayLastWeek }, 200);
    });
}

// number of students per day of the week (final chart)
exports.get_num_students_per_day = (req, res) => {
    if (!req.user || !req.user.isTA) {
        respond_error(req, res, "You don't have permissions to perform this operation", 403);
        return;
    }

    models.question.findAll({
        attributes: [
            [Sequelize.fn('date_part', 'dow', Sequelize.literal(`"entry_time" AT TIME ZONE 'EST'`)), 'day_of_week'],
            [Sequelize.fn('count', Sequelize.col('question_id')), 'count']
        ],
        where: {
            sem_id: settings.get_admin_settings().currSem,
            help_time: {
                [Sequelize.Op.ne]: null
            },
        },
        group: [Sequelize.fn('date_part', 'dow', Sequelize.literal(`"entry_time" AT TIME ZONE 'EST'`))],
        order: [[Sequelize.col('count'), 'DESC']]
    }).then((data) =>  {
        let numStudentsPerDay = [];
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

        for (const row of data) {
            let datecount = row.dataValues;
            datecount.day_of_week = days[datecount.day_of_week];
            numStudentsPerDay.push({'day': datecount.day_of_week, 'students': datecount.count});
        }

        respond(req, res, "Got number of students per day", { numStudentsPerDay: numStudentsPerDay }, 200);
    });
}

exports.get_num_students_overall = (req, res) => {
    if (!req.user || !req.user.isTA) {
        respond_error(req, res, "You don't have permissions to perform this operation", 403);
        return;
    }

    models.question.findAll({
        attributes: [
            [Sequelize.fn('date', Sequelize.literal(`"entry_time" AT TIME ZONE 'EST'`)), 'day'],
            [Sequelize.fn('count', Sequelize.col('question_id')), 'count']
        ],
        where: {
            sem_id: settings.get_admin_settings().currSem,
            help_time: {
                [Sequelize.Op.ne]: null
            },
        },
        group: [Sequelize.fn('date', Sequelize.literal(`"entry_time" AT TIME ZONE 'EST'`))],
        order: [[Sequelize.col('day'), 'ASC']]
    }).then((data) =>  {
        let numStudentsOverall = [];

        for (const row of data) {
            let datecount = row.dataValues;
            numStudentsOverall.push({'day': datecount.day, 'students': datecount.count});
        }

        respond(req, res, "Got number of students overall", { numStudentsOverall: numStudentsOverall }, 200);
    });
}

exports.get_ranked_students = (req, res) => {
    if (!req.user || !req.user.isTA || !req.user.isAdmin) {
        respond_error(req, res, "You don't have permission to perform this operation", 403);
        return;
    }

    let studentMap = {};
    models.question.findAll({
        where: {
            sem_id: settings.get_admin_settings().currSem,
            help_time: {
                [Sequelize.Op.ne]: null
            }
        }
    }).then((questionModels) => {


        for (const questionModel of questionModels) {
            let question = questionModel.dataValues;

            if (question.student_id in studentMap) {
                studentMap[question.student_id].count++;
                studentMap[question.student_id].timeHelped += (question.exit_time - question.help_time) / 1000 / 60;
                studentMap[question.student_id].badCount += parseInt(question.num_asked_to_fix);
            } else {
                studentMap[question.student_id] = {
                    count: 1,
                    timeHelped: (question.exit_time - question.help_time) / 1000 / 60,
                    badCount: parseInt(question.num_asked_to_fix)
                };
            }
        }

        let accountReqs = [];
        for (const student_id in studentMap) {
            accountReqs.push(models.account.findByPk(student_id));
        }

        return Promise.all(accountReqs);
    }).then((accounts) => {
        let rankedStudents = [];

        for (const account of accounts) {
            let accountData = account.dataValues;
            let user_id = accountData.user_id;

            if (user_id in studentMap) {
                rankedStudents.push({
                    student_name: accountData.preferred_name,
                    student_andrew: accountData.email.split("@")[0],
                    count: studentMap[user_id].count,
                    badCount: studentMap[user_id].badCount,
                    timeHelped: Math.round(studentMap[user_id].timeHelped * 10) / 10,
                });
            }
        }

        rankedStudents.sort((a, b) => {
            if (a.count != b.count) {
                return b.count - a.count;
            } else {
                return b.timeHelped - a.timeHelped;
            }
        });
        respond(req, res, "Got ranked students", { rankedStudents: rankedStudents }, 200);
    });
}

exports.get_ranked_tas = (req, res) => {
    if (!req.user || !req.user.isTA || !req.user.isAdmin) {
        respond_error(req, res, "You don't have permission to perform this operation", 403);
        return;
    }

    let taMap = {};
    models.question.findAll({
        where: {
            sem_id: settings.get_admin_settings().currSem,
            help_time: {
                [Sequelize.Op.ne]: null
            }
        }
    }).then((questionModels) => {

        for (const questionModel of questionModels) {
            let question = questionModel.dataValues;

            if (question.ta_id in taMap) {
                taMap[question.ta_id].count++;
                taMap[question.ta_id].timeHelping += (question.exit_time - question.help_time) / 1000 / 60;
            } else {
                taMap[question.ta_id] = {
                    count: 1,
                    timeHelping: (question.exit_time - question.help_time) / 1000 / 60,
                };
            }
        }

        let accountReqs = [];
        for (const ta_id in taMap) {
            accountReqs.push(models.account.findByPk(ta_id));
        }

        return Promise.all(accountReqs);
    }).then((accounts) => {
        let rankedTAs = [];

        for (const account of accounts) {
            let accountData = account.dataValues;
            let user_id = accountData.user_id;

            if (user_id in taMap) {
                rankedTAs.push({
                    ta_name: accountData.preferred_name,
                    ta_andrew: accountData.email.split("@")[0],
                    count: taMap[user_id].count,
                    timeHelping: Math.round(taMap[user_id].timeHelping * 10) / 10,
                });
            }
        }

        rankedTAs.sort((a, b) => {
            if (a.count != b.count) {
                return b.count - a.count;
            } else {
                return b.timeHelped - a.timeHelped;
            }
        });
        respond(req, res, "Got ranked TAs", { rankedTAs: rankedTAs }, 200);
    });
}
