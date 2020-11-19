export const testParticipantOneName = 'Incident Commander';
export const testParticipantTwoName = 'The Lizard Queen';
export const testParticipantThreeName = 'Quarterback';

export const testParticipantOneLabel = 'IC';
export const testParticipantTwoLabel = 'LQ';
export const testParticipantThreeLabel = 'QB';

export const testBotDataId = 'testID12345';

export const testUserObject = { name: 'Geoff' };

export const roomWithParticipantsRoles = {
  body: {
    settings: {
      participantsRoles: [
        { name: 'Incident Commander', label: 'IC' },
        { name: 'The Lizard Queen', label: 'LQ' }
      ]
    }
  }
};

export const expectedParticipantsObjectFromRoomType = {
  ic: {
    name: 'Incident Commander', label: 'IC',
  },
  lq: {
    name: 'The Lizard Queen',
    label: 'LQ'
  }
};

export const expectedParticipantsObjectWithParticipantRemoved = {
  lq: {
    name: 'The Lizard Queen',
    label: 'LQ'
  }
};

export const expectedParticipantsObjectWithParticipantAdded = {
  ic: {
    name: 'Incident Commander', label: 'IC',
  },
  lq: {
    name: 'The Lizard Queen', label: 'LQ'
  },
  qb: {
    name: 'Quarterback', label: 'QB'
  }
};

export const expectedParticipantsObjectWithUserAssigned = {
  ic: {
    name: 'Incident Commander', label: 'IC', user: testUserObject
  },
  lq: {
    name: 'The Lizard Queen', label: 'LQ'
  }
};

export const roomWithoutParticipantRoles = {
  body: {
    settings: {
      notParticipantRoles: [
        1, 2, 3, 4
      ]
    }
  }
};


export const rolesBotData = {
  body: [
    {
      id: testBotDataId,
      value: JSON.stringify(expectedParticipantsObjectFromRoomType)
    }
  ]
};

export const rolesBotDataWithAssignedUser = {
  body: [
    {
      id: testBotDataId,
      value: JSON.stringify(expectedParticipantsObjectWithUserAssigned)
    }
  ]
};

export const brokenRolesBotData = {
  body: [
    {
      value: 'this should be JSON, not a string'
    }
  ]
};
