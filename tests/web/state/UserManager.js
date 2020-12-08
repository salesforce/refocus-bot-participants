import { expect } from 'chai';
import sinon from 'sinon';
import * as mockdata from './mocks/userData';
import Users from '../../../web/state/UserManager';

describe('Users.js >', () => {
  describe('getUsers function >', () => {
    const roomId = '11';
    const botName = 'Test';

    it('Ok, returns parsed object of userList', async () => {
      const getBotDataFake = sinon.fake.resolves(mockdata.testUserBotData);
      const bdk = {
        getBotData: getBotDataFake,
        getRoomId: () => roomId,
      };
      const users = new Users(bdk, botName);
      const result = await users.getUsers();
      const expected = mockdata.testUserList;
      expect(result).to.deep.equal(expected);
    });

    it('Fail, returns undefined if botData cannot be fetched', async () => {
      const getBotDataFake = sinon.fake.resolves(mockdata.brokenUserBotData);
      const bdk = {
        getBotData: getBotDataFake,
        getRoomId: () => roomId,
      };
      const users = new Users(bdk, botName);
      const result = await users.getUsers();
      const expected = undefined;
      expect(result).to.equal(expected);
    });
  });


  describe('addUser function >', () => {
    const roomId = '22';
    const botName = 'TestBotName';

    it('Ok, adds a new user to the existing list.', async () => {
      const getBotDataFake = sinon.fake.resolves(mockdata.testUserBotData);
      const upsertBotDataFake = sinon.fake.resolves({});
      const bdk = {
        getBotData: getBotDataFake,
        getRoomId: () => roomId,
        upsertBotData: upsertBotDataFake
      };

      const users = new Users(bdk, botName);
      const newTestUser = { name: 'newUser', id: '5' };
      const result = await users.addUser(newTestUser);
      const expected = true;
      expect(result).to.equal(expected);
      expect(upsertBotDataFake.args[0][3].length).to.equal(mockdata.testUserList.length + 1);
    });

    it('Ok, no users exist, so function creates new array with supplied user.', async () => {
      const getBotDataFake = sinon.fake.resolves(mockdata.emptyUserBotData);
      const upsertBotDataFake = sinon.fake.resolves({});
      const bdk = {
        getBotData: getBotDataFake,
        getRoomId: () => roomId,
        upsertBotData: upsertBotDataFake
      };

      const users = new Users(bdk, botName);
      const newTestUser = { name: 'newUser', id: '5' };
      const result = await users.addUser(newTestUser);
      const expected = true;
      expect(result).to.equal(expected);
      expect(upsertBotDataFake.args[0][3]).to.deep.equal([newTestUser]);
    });

    it('Ok, user is already in list, dont update.', async () => {
      const getBotDataFake = sinon.fake.resolves(mockdata.testUserBotData);
      const upsertBotDataFake = sinon.fake.resolves({});
      const bdk = {
        getBotData: getBotDataFake,
        getRoomId: () => roomId,
        upsertBotData: upsertBotDataFake
      };

      const users = new Users(bdk, botName);
      const existingUser = { name: 'exisitingUser', id: '1' };
      const result = await users.addUser(existingUser);
      const expected = true;
      expect(result).to.equal(expected);
      expect(upsertBotDataFake.called).to.equal(false);
    });
  });
});
