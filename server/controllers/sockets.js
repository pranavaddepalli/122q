let crypto = require('crypto');
let models = require('../models');
let settings = require('./settings');

let config = require('../config/config');

let sio;

let ta_room = crypto.randomBytes(72).toString('base64');
let student_room = crypto.randomBytes(72).toString('base64');

/**
 * Initialize socket.io
 */
exports.init = function (server) {
    sio = require("socket.io")(server, {
        cors: {
            origin: config.PROTOCOL + "://" + config.DOMAIN + ":" + config.CLIENT_PORT,
            methods: ["GET", "POST"]
        },
        // buffer last minute of messages
        connectionStateRecovery: {
            maxDisconnectionDuration: 1 * 60 * 1000,
            skipMiddlewares: true
        }
    });

    sio.on("connection", (socket) => {
        console.log("New client connected");
        socket.join(student_room); // By default, join the student room

        socket.on("authenticate", function (auth) {
            if (!auth) return;

            models.account.findOne({
                where: { access_token: auth },
                include: [
                    {
                        model: models.semester_user,
                        where: { sem_id: settings.get_admin_settings().currSem },
                        as: "semester_users"
                    }
                ]
            }).then(function (result) {
                if (!result) return;

                socket.session = result;
                if (result.semester_users[0].is_ta) {
                    socket.leave(student_room);
                    socket.join(ta_room);
                } else {
                    // get andrew id and join room
                    let andrewID = result.email.split("@")[0];
                    socket.join(andrewID);
                }
            });
        });

        socket.on("disconnect", () => {
            console.log(`Client disconnected (${socket.session?.name})`);
        });
    });
};

/**
 * Emit queue data to all clients
 */
exports.queueData = function (queueData) {
    if (!sio) {
        console.log("ERROR: Socket.io is not initialized yet");
        return;
    }

    sio.emit("queueData", {
        ...queueData
    });
}

/**
 * Emit student data to a specific student
 */
exports.studentData = function (studentData) {
    if (!sio) {
        console.log("ERROR: Socket.io is not initialized yet");
        return;
    }

    sio.to(studentData.andrewID).emit("studentData", {
        ...studentData
    });
}

/**
 * Emit data for all students on the queue to all TAs
 */
exports.allStudents = function (allStudents) {
    if (!sio) {
        console.log("ERROR: Socket.io is not initialized yet");
        return;
    }

    sio.to(ta_room).emit("allStudents", {
        allStudents: allStudents
    });
}

/**
 * Socket that students subscribe to that emits when they're getting help
 */
exports.help = function (studentAndrewID, name) {
    if (!sio) {
        console.log("ERROR: Socket.io is not initialized yet");
        return;
    }

    sio.to(studentAndrewID).emit("help", {
        andrewID: studentAndrewID,
        data: {
            taData: {
                taName: name,
            }
        }
    });
}

/**
 * Socket that students subscribe to that emits when they're unhelped
 */
exports.unhelp = function (studentAndrewID, taAndrewID) {
    if (!sio) {
        console.log("ERROR: Socket.io is not initialized yet");
        return;
    }

    sio.to(studentAndrewID).emit("unhelp", {
        andrewID: studentAndrewID,
        data: {
            taData: {
                taAndrewID: taAndrewID
            }
        }
    });
}

/**
 * Socket that emits when a new student joins the queue
 */
exports.add = function (studentData) {
    sio.to(ta_room).emit("add", {
        studentData: studentData
    });
}

/**
 * Socket that emits to a student when they're removed from the queue
 */
exports.remove = function (studentAndrewID) {
    if (!sio) {
        console.log("ERROR: Socket.io is not initialized yet");
        return;
    }

    sio.to(studentAndrewID).emit("remove", {
        andrewID: studentAndrewID,
    });
}

/**
 * Socket that emits to a student when they need to update their question
 */
exports.updateQRequest = function (studentAndrewID) {
    if (!sio) {
        console.log("ERROR: Socket.io is not initialized yet");
        return;
    }

    sio.to(studentAndrewID).emit("updateQRequest", {
        andrewID: studentAndrewID,
    });
}

/**
 * Socket that emits to a student when they receive a message
 */
exports.message = function (studentAndrewID, name) {
    if (!sio) {
        console.log("ERROR: Socket.io is not initialized yet");
        return;
    }

    sio.to(studentAndrewID).emit("message", {
        andrewID: studentAndrewID,
        data: {
            taName: name,
        }
    });
}

/**
 * Socket that emits when a TA approves a student's cooldown override request
 */
exports.approveCooldown = function (studentAndrewID) {
    if (!sio) {
        console.log("ERROR: Socket.io is not initialized yet");
        return;
    }

    sio.to(studentAndrewID).emit("approveCooldown", {
        andrewID: studentAndrewID,
    });
}

exports.remind = function (taAndrewId) {
    if (!sio) {
        console.log("ERROR: Socket.io is not initialized yet");
        return;
    }

    sio.emit(`remind/${taAndrewId}`);
}

exports.doneHelping = function (taAndrewId, studentAndrewId, helpTime) {
    if (!sio) {
        console.log("ERROR: Socket.io is not initialized yet");
        return;
    }

    sio.emit(`doneHelping/${taAndrewId}`, {
        studentAndrewId: studentAndrewId,
        helpTime: helpTime
    });
}
