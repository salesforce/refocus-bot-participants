import { expect } from 'chai';
import sinon from 'sinon';
import * as mockdata from './mocks/roleData';
import RoleManager from '../../../web/state/RoleManager';

const ZERO = 0;
const ERR_NO_ROLE_NAME = 1;
const ERR_SPACE_IN_ROLE_LABEL = 2;
const ERR_ROLE_ALREADY_EXISTS = 3;

describe('Roles.js >', () => {
  describe('createRolesBotData function >', () => {
    const roomId = '55';
    const botName = 'Test';

    it('Ok, find room is called when we call createRolesBotData', async () => {
      const findRoomFake = sinon.fake.resolves(mockdata.roomWithParticipantsRoles);
      const upsertBotDataFake = sinon.fake();
      const bdk = {
        findRoom: findRoomFake,
        getRoomId: () => roomId,
        upsertBotData: upsertBotDataFake,
      };
      const testRoles = new RoleManager(bdk, botName);
      await testRoles.createRolesBotData();
      expect(findRoomFake.called).to.equal(true);
      expect(findRoomFake.calledWith(roomId)).to.equal(true);
      expect(upsertBotDataFake.args[0]).to.deep.equal([roomId, botName, 'assignedParticipants',
        mockdata.expectedParticipantsObjectFromRoomType]);
    });

    it('Ok, creates an empty object when no roles are specified in roomType', async () => {
      const upsertBotDataFake = sinon.fake();
      const findRoomFake = sinon.fake.returns(mockdata.roomWithoutParticipantRoles);
      const bdk = {
        findRoom: findRoomFake,
        getRoomId: () => roomId,
        upsertBotData: upsertBotDataFake,
      };
      const testRoles = new RoleManager(bdk, botName);
      await testRoles.createRolesBotData();
      expect(upsertBotDataFake.args[0]).to.deep.equal([roomId, botName, 'assignedParticipants', {}]);
    });

    it('Fail, returns empty object when upsertBotData fails', async () => {
      const upsertBotDataFake = sinon.fake.throws('AHHH!');
      const findRoomFake = sinon.fake.returns(mockdata.roomWithParticipantsRoles);
      const bdk = {
        findRoom: findRoomFake,
        getRoomId: () => roomId,
        upsertBotData: upsertBotDataFake,
      };
      const testRoles = new RoleManager(bdk, botName);
      const result = await testRoles.createRolesBotData();
      const expected = {};
      expect(result).to.deep.equal(expected);
    });
  });


  describe('getRoles function >', () => {
    const roomId = '66';
    const botName = 'Test';

    it('Ok, returns correct object when called', async () => {
      const getBotDataFake = sinon.fake.returns(mockdata.rolesBotData);
      const bdk = {
        getRoomId: () => roomId,
        getBotData: getBotDataFake
      };

      const roles = new RoleManager(bdk, botName);
      const result = await roles.getRoles();
      expect(getBotDataFake.args[0]).to.deep.equal([roomId, botName, 'assignedParticipants']);
      expect(result).to.deep.equal(mockdata.expectedParticipantsObjectFromRoomType);
    });

    it('Fail, returns undefined when failing to parse botData response', async () => {
      const getBotDataFake = sinon.fake.returns(mockdata.brokenRolesBotData);
      const bdk = {
        getRoomId: () => roomId,
        getBotData: getBotDataFake
      };

      const roles = new RoleManager(bdk, botName);
      const result = await roles.getRoles();
      const expected = undefined;
      expect(result).to.deep.equal(expected);
    });

    it('Fail, returns undefined when bdk.getBotData fails', async () => {
      const getBotDataFake = sinon.fake.throws('!!!!');
      const bdk = {
        getRoomId: () => roomId,
        getBotData: getBotDataFake
      };
      const roles = new RoleManager(bdk, botName);
      const result = await roles.getRoles();
      const expected = undefined;
      expect(result).to.deep.equal(expected);
    });
  });


  describe('deleteRole function >', () => {
    const roomId = '77';
    const botName = 'TestBotName';

    it('Ok, deletes specified role and returns true', async () => {
      const getBotDataFake = sinon.fake.resolves(mockdata.rolesBotData);
      const changeBotDataFake = sinon.fake.resolves(true);
      const bdk = {
        getRoomId: () => roomId,
        getBotData: getBotDataFake,
        changeBotData: changeBotDataFake
      };
      const roles = new RoleManager(bdk, botName);
      const expected = await roles.deleteRole(mockdata.testParticipantOneLabel);
      expect(expected).to.equal(true);
      expect(changeBotDataFake.args[0]).to.deep.equal([mockdata.testBotDataId, mockdata.expectedParticipantsObjectWithParticipantRemoved]);
    });

    it('Fail, returns false when trying to delete role that doesnt exist', async () => {
      const getBotDataFake = sinon.fake.resolves(mockdata.rolesBotData);
      const changeBotDataFake = sinon.fake.resolves(true);
      const bdk = {
        getRoomId: () => roomId,
        getBotData: getBotDataFake,
        changeBotData: changeBotDataFake
      };
      const roles = new RoleManager(bdk, botName);
      const expected = await roles.deleteRole('notARoleLabel');
      expect(expected).to.equal(false);
      expect(changeBotDataFake.called).to.equal(false);
    });

    it('Fail, returns false when changeBotData fails', async () => {
      const getBotDataFake = sinon.fake.resolves(mockdata.rolesBotData);
      const changeBotDataFake = sinon.fake.throws('No change for you!');
      const bdk = {
        getRoomId: () => roomId,
        getBotData: getBotDataFake,
        changeBotData: changeBotDataFake
      };
      const roles = new RoleManager(bdk, botName);
      const expected = await roles.deleteRole(mockdata.testParticipantOneLabel);
      expect(getBotDataFake.callCount).to.equal(2);
      expect(expected).to.equal(false);
      expect(changeBotDataFake.called).to.equal(true);
    });
  });


  describe('createRole function >', () => {
    const roomId = '88';
    const botName = 'RandomBotName';

    it('Ok, adds intended role to participants object, and returns 0', async () => {
      const getBotDataFake = sinon.fake.resolves(mockdata.rolesBotData);
      const upsertBotDataFake = sinon.fake.resolves(true);
      const bdk = {
        getRoomId: () => roomId,
        getBotData: getBotDataFake,
        upsertBotData: upsertBotDataFake
      };
      const roles = new RoleManager(bdk, botName);
      const result = await roles.createRole('Quarterback', 'QB');
      expect(upsertBotDataFake.args[0])
        .to.deep.equal([roomId, botName, 'assignedParticipants', mockdata.expectedParticipantsObjectWithParticipantAdded]);
      expect(result).to.equal(ZERO);
    });

    it('Fail, returns 0 and doesnt update data when participants object cant be fetched', async () => {
      const getBotDataFake = sinon.fake.resolves(mockdata.brokenRolesBotData);
      const upsertBotDataFake = sinon.fake.resolves(true);
      const bdk = {
        getRoomId: () => roomId,
        getBotData: getBotDataFake,
        upsertBotData: upsertBotDataFake
      };
      const roles = new RoleManager(bdk, botName);
      const expected = await roles.createRole('Quarterback', 'QB');
      expect(expected).to.equal(ZERO);
      expect(upsertBotDataFake.called).to.equal(false);
    });

    it('Fail, returns 1 and doesnt update data no name is provided', async () => {
      const getBotDataFake = sinon.fake.resolves(mockdata.rolesBotData);
      const upsertBotDataFake = sinon.fake.resolves(true);
      const bdk = {
        getRoomId: () => roomId,
        getBotData: getBotDataFake,
        upsertBotData: upsertBotDataFake
      };
      const roles = new RoleManager(bdk, botName);
      const expected = await roles.createRole('', 'QB');
      expect(expected).to.equal(ERR_NO_ROLE_NAME);
      expect(upsertBotDataFake.called).to.equal(false);
    });

    it('Fail, returns 2 and doesnt update data when there is a space in provided label', async () => {
      const getBotDataFake = sinon.fake.resolves(mockdata.rolesBotData);
      const upsertBotDataFake = sinon.fake.resolves(true);
      const bdk = {
        getRoomId: () => roomId,
        getBotData: getBotDataFake,
        upsertBotData: upsertBotDataFake
      };
      const roles = new RoleManager(bdk, botName);
      const expected = await roles.createRole('Quarterback', 'Q B');
      expect(expected).to.equal(ERR_SPACE_IN_ROLE_LABEL);
      expect(upsertBotDataFake.called).to.equal(false);
    });

    it('Fail, returns 3 and doesnt update data when the new label or name are already in use', async () => {
      const getBotDataFake = sinon.fake.resolves(mockdata.rolesBotData);
      const upsertBotDataFake = sinon.fake.resolves(true);
      const bdk = {
        getRoomId: () => roomId,
        getBotData: getBotDataFake,
        upsertBotData: upsertBotDataFake
      };
      const roles = new RoleManager(bdk, botName);
      const expected = await roles.createRole('Incident Commander', 'IC');
      expect(expected).to.equal(ERR_ROLE_ALREADY_EXISTS);
      expect(upsertBotDataFake.called).to.equal(false);
    });
  });

  describe('assignUserToRole function >', () => {
    const roomId = '99';
    const botName = 'BotTestName';


    it('Ok, assigns a user object to an existing role', async () => {
      const getBotDataFake = sinon.fake.resolves(mockdata.rolesBotData);
      const upsertBotDataFake = sinon.fake.resolves(true);
      const bdk = {
        getRoomId: () => roomId,
        getBotData: getBotDataFake,
        upsertBotData: upsertBotDataFake
      };
      const roles = new RoleManager(bdk, botName);
      const result = await roles.assignUserToRole(mockdata.testParticipantOneLabel, mockdata.testUserObject);
      expect(result).to.equal(true);
      expect(upsertBotDataFake.args[0][3].ic.user).to.deep.equal(mockdata.testUserObject);
    });

    it('Ok, removes user object to an existing role when null is supplied instead of user', async () => {
      const getBotDataFake = sinon.fake.resolves(mockdata.rolesBotDataWithAssignedUser);
      const upsertBotDataFake = sinon.fake.resolves(true);
      const bdk = {
        getRoomId: () => roomId,
        getBotData: getBotDataFake,
        upsertBotData: upsertBotDataFake
      };
      const roles = new RoleManager(bdk, botName);
      const result = await roles.assignUserToRole(mockdata.testParticipantOneLabel, null);
      expect(result).to.equal(true);
      expect(upsertBotDataFake.args[0][3].ic.user).to.equal(undefined);
    });

    it('Fail, returns false and doesnt update data if roleData cannot be fetched', async () => {
      const getBotDataFake = sinon.fake.resolves(mockdata.brokenRolesBotData);
      const upsertBotDataFake = sinon.fake.resolves(true);
      const bdk = {
        getRoomId: () => roomId,
        getBotData: getBotDataFake,
        upsertBotData: upsertBotDataFake
      };
      const roles = new RoleManager(bdk, botName);
      const result = await roles.assignUserToRole(mockdata.testParticipantOneLabel, mockdata.testUserObject);
      expect(result).to.equal(false);
      expect(upsertBotDataFake.called).to.equal(false);
    });
  });
});

