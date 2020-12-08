export const testUserList = [
  { name: 'userOne', id: '1' },
  { name: 'userTwo', id: '2' }
];

export const testUserBotData = {
  body: [
    {
      value: JSON.stringify(testUserList)
    }
  ]
};

export const emptyUserBotData = {
  body: []
};

export const brokenUserBotData = {
  body: [
    {
      value: 'this should be a JSON string'
    }
  ]
};
