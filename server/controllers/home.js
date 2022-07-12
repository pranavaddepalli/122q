// For Home page
const moment = require("moment-timezone");
const Promise = require('bluebird');

const queue = require('./queue');
const models = require('../models');
const sockets = require('./sockets');
const waittime = require('./waittimes')

const OHQueue = queue.OHQueue;
const StudentStatus = queue.StudentStatus;

// default queue frozen property
let queueFrozen = false;

const ohq = new queue.OHQueue();

/** Dummy information for testing */
ohq.enqueue("student1");
ohq.enqueue("student2");
ohq.enqueue("student3");

exports.getOHQ = function() {
    return ohq;
};

exports.get = function (req, res) {
    res.status(200);

    let data = {
        queueData: {
            title: "15-122 Office Hours Queue",
            queueFrozen: queueFrozen,
            numStudents: ohq.size(),
            waitTime: waittime.get(),
            isAuthenticated: req.user?.isAuthenticated,
            isTA: req.user?.isTA,
            isAdmin: req.user?.isAdmin,
            andrewID: req.user?.andrewID
        },
        studentData: {}
    };

    // Handle when logged-in user is a student
    if (req.user.isAuthenticated && !req.user.isTA) {
        data.studentData["position"] = ohq.getPosition(req.user.student.student_id);

        if (data.studentData.position !== -1) {
            // doesn't include question ID because it doesn't need to be passed to client
            let entry = ohq.queue.get(data.studentData.position);
            data.studentData["status"] = entry.status;
            data.studentData["isFrozen"] = entry.isFrozen;
            data.studentData["question"] = entry.question;
            data.studentData["location"] = entry.location;
            data.studentData["topic"] = entry.topic;
        }
    }

    res.send(data);
}

exports.post_freeze_queue = function (req, res) {
    if (!req.user || !req.user.isTA) {
        return;
    }

    queueFrozen = true;
    sockets.queueFrozen(queueFrozen);
}

exports.post_unfreeze_queue = function (req, res) {
    if (!req.user || !req.user.isTA) {
        return;
    }

    queueFrozen = false;
    sockets.queueFrozen(queueFrozen);
}

exports.post_add_question = function (req, res) {
    if (!req.user) {
        res.status(400)
        res.json({message: 'user data not passed to server'})
        return
    } 

    if (ohq.getPosition(req.user.student.student_id) != -1) {
        res.status(400)
        res.json({message: 'student already on the queue'})
        return
    }

    let id = req.user.student.student_id

    ohq.enqueue(
        id,
        req.body.andrewID,
        req.body.question, 
        req.body.location, 
        req.body.topic,
        moment.tz(new Date(), "America/New_York").toDate()
    )

    
    let data = {
        status: ohq.getStatus(id),
        position: ohq.getPosition(id)
    }

    if(data.status != null && data.position != null) {
        res.status(200)
        data['message'] = "successfully added to queue";
        res.json(data)
    } else if (data.status == 5 || data.position == -1) {
        res.status(400)
        res.json({message: 'the server was unable to find you on the queue after adding you'})
    } else {
        res.status(500)
        res.json({message: 'the server was unable to add you to the queue'})
    }

    ohq.print()
}

exports.post_remove_student = function(req, res) {
    if (!req.user) {
        res.status(400)
        res.json({message: 'user data not passed to server'})
        return
    } 
    
    if (ohq.getPosition(req.user.student.student_id) === -1) {
        res.status(400)
        res.json({message: 'student not on the queue'})
        return
    }

    let id = req.user.student.student_id

    ohq.remove(id)

    if(ohq.getPosition(id) != -1) {
        res.status(500)
        res.json({message: "the server was unable to remove you from the queue"})
    }

    let data = {
        'message': "successfully removed from the queue"
    }
    
    res.status(200)
    res.json(data)
}