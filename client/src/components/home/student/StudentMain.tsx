import React, {useContext, useEffect, useMemo, useState} from 'react';

import YourEntry from './YourEntry';
import RemoveQOverlay from './RemoveQConfirm';
import TAHelpingOverlay from './TAHelpingOverlay';
import UpdateQuestionOverlay from './UpdateQuestionOverlay';
import MessageRespond from './MessageOverlay';
import AskQuestion from '../shared/AskQuestion';

import HomeService from '../../../services/HomeService';
import {StudentStatusValues} from '../../../services/StudentStatus';
import {socketSubscribeTo} from '../../../services/SocketsService';
import {UserDataContext} from '../../../contexts/UserDataContext';
import {QueueDataContext} from '../../../contexts/QueueDataContext';
import {StudentDataContext} from '../../../contexts/StudentDataContext';

function StudentMain() {
  const [removeConfirm, setRemoveConfirm] = useState(false);
  const [messagingTAName, setMessagingTAName] = useState('');

  const {queueData} = useContext(QueueDataContext);
  const {studentData} = useContext(StudentDataContext);
  const {userData} = useContext(UserDataContext);

  useEffect(() => {
    socketSubscribeTo('help', (res) => {
      if (res.andrewID === userData.andrewID) {
        new Notification('It\'s your turn to get help!', {
          'body': `${res.data.taData.taName} is ready to help you.`,
          'requireInteraction': true,
        });
      } else {
        console.log('Received help for other student');
      }
    });

    socketSubscribeTo('updateQRequest', (res) => {
      if (res.andrewID === userData.andrewID) {
        new Notification('Please update your question', {
          'requireInteraction': true,
        });
      } else {
        console.log('Received updateQRequest for other student');
      }
    });

    socketSubscribeTo('message', (res) => {
      if (res.andrewID === userData.andrewID) {
        setMessagingTAName(res.data.taName);

        new Notification('You\'ve been messaged by a TA', {
          'requireInteraction': true,
        });
      } else {
        console.log('Received message for other student');
      }
    });

    socketSubscribeTo('remove', (res) => {
      if (res.andrewID === userData.andrewID) {
        new Notification('You\'ve been removed from the queue', {
          'requireInteraction': true,
        });
      } else {
        console.log('Received remove for other student');
      }
    });

    socketSubscribeTo('approveCooldown', (res) => {
      if (res.andrewID === userData.andrewID) {
        new Notification('Your entry been approved by a TA', {
          'requireInteraction': true,
        });
      } else {
        console.log('Received approveCooldown for other student');
      }
    });
  }, [userData.andrewID]);

  const removeFromQueue = () => {
    HomeService.removeStudent(
        JSON.stringify({
          andrewID: userData.andrewID,
          doneHelping: false,
        }),
    ).then((res) => {
      if (res.status === 200) {
        setRemoveConfirm(false);
      }
    });
  };

  const dismissMessage = () => {
    HomeService.dismissMessage(
        JSON.stringify({
          andrewID: userData.andrewID,
        }),
    );
  };

  const statusDependentComponents = useMemo(() => {
    return (
      <div>
        {
          (studentData.status !== StudentStatusValues.OFF_QUEUE) ?
            <div>
              <YourEntry
                openRemoveOverlay={() => setRemoveConfirm(true)}
              />
              <RemoveQOverlay
                open={removeConfirm}
                removeFromQueue={() => removeFromQueue()}
                handleClose={() => setRemoveConfirm(false)}
              />
            </div> :
            (queueData.queueFrozen ? null :
              <AskQuestion/>
            )
        }
      </div>
    );
  }, [studentData.status, queueData.queueFrozen, removeConfirm]);

  return (
    <div>
      {statusDependentComponents}

      <TAHelpingOverlay
        open={studentData.status === StudentStatusValues.BEING_HELPED}
      />

      <UpdateQuestionOverlay
        open={studentData.status === StudentStatusValues.FIXING_QUESTION}
        handleClose={() => {}}
      />

      <MessageRespond
        open={studentData.status === StudentStatusValues.RECEIVED_MESSAGE}
        messagingTAName={messagingTAName}
        removeFromQueue={removeFromQueue}
        dismissMessage={dismissMessage}
        handleClose={() => {}}
      />
    </div>
  );
}

export default StudentMain;
