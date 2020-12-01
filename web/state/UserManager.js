/* eslint-disable no-console */
class UserManager {
  constructor(bdk, botName) {
    this.roomId = bdk.getRoomId();
    this.botName = botName;
    this.bdk = bdk;
    this.USERS_BOTDATA_NAME = 'listOfRoomUsers';
  }

  /**
   * Retrieve users from botData
   * @returns {array|undefined} - list of user objects.
   */
  async getUsers() {
    try {
      const usersBotData = await this.bdk.getBotData(this.roomId, this.botName, this.USERS_BOTDATA_NAME);
      const parsed = JSON.parse(usersBotData.body[0].value);
      return parsed;
    } catch (e) {
      console.error(e);
      return undefined;
    }
  }

  /**
   * Add a user object to the list.
   * @param {object} user - user object to add to list.
   * @returns {boolean} - whether or not the user has been added to the list.
   */
  async addUser(user) {
    const userData = await this.getUsers();

    if (userData === undefined) {
      await this.bdk.upsertBotData(this.roomId, this.botName, this.USERS_BOTDATA_NAME, [user]);
      return true;
    }

    const userIsAlreadyStored = userData.some((existingUser) => user.id === existingUser.id);
    if (userIsAlreadyStored) return true;

    userData.push(user);
    await this.bdk.upsertBotData(this.roomId, this.botName, this.USERS_BOTDATA_NAME, userData);
    return true;
  }
}


export default UserManager;
