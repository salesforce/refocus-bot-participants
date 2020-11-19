/* eslint-disable no-console */
const ZERO = 0;
const ERR_NO_ROLE_NAME = 1;
const ERR_SPACE_IN_ROLE_LABEL = 2;
const ERR_ROLE_ALREADY_EXISTS = 3;

class Roles {
  constructor (bdk, botName) {
    this.roomId = bdk.getRoomId();
    this.botName = botName;
    this.bdk = bdk;
    this.ROLES_BOTDATA_NAME = 'assignedParticipants';
  }

  /**
   * Instantiates the botData for participant roles
   * @returns {object} - Created botData object
   */
  async createRolesBotData() {
    const room = await this.bdk.findRoom(this.roomId);
    const rolesFromRoomType = room.body?.settings?.participantsRoles || [];
    const rolesData = {};

    rolesFromRoomType.map(({ name, label }) => {
      rolesData[label.toLowerCase()] = {
        name,
        label
      };
    });

    try {
      await this.bdk.upsertBotData(this.roomId, this.botName, this.ROLES_BOTDATA_NAME, rolesData);
    } catch (e) {
      console.error('Failed to create roles botData', e);
      return {};
    }
    return rolesData;
  }

  /**
   * Gets and parses participants roles from botData
   * @returns {object|undefined} - roles object
   */
  async getRoles() {
    try {
      const rolesBotData = await this.bdk.getBotData(this.roomId, this.botName, this.ROLES_BOTDATA_NAME);
      const parsed = JSON.parse(rolesBotData.body[0].value);
      return parsed;
    } catch (e) {
      console.error(e);
      return undefined;
    }
  }

  /**
   * Deletes a role in the participants object.
   * @param {string} label - label of role to delete
   * @returns {boolean} - whether or not role was successfully deleted
   */
  async deleteRole(label) {
    const currentRoleData = await this.getRoles();
    if (currentRoleData === undefined || currentRoleData[label.toLowerCase()] === undefined) {
      console.error(`Tried to delete undefined role, ${label}`);
      return false;
    }
    delete currentRoleData[label.toLowerCase()];
    try {
      const botData = await this.bdk.getBotData(this.roomId, this.botName, this.ROLES_BOTDATA_NAME);
      await this.bdk.changeBotData(botData.body[0].id, currentRoleData);
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  /**
   * Creates a new Role in the participants object.
   * @param {string} name - name of new role
   * @param {string} label - label of new role
   * @returns {number} - number corresponding to error code
   */
  async createRole(name, label) {
    const currentRoles = await this.getRoles();
    if (currentRoles === undefined) return ZERO;
    const isValid = this.isValidRole(name, label, currentRoles);
    if (isValid === ZERO) {
      currentRoles[label.toLowerCase()] = { name, label };
      try {
        await this.bdk.upsertBotData(this.roomId, this.botName, this.ROLES_BOTDATA_NAME, currentRoles);
      } catch (e) {
        console.error(e);
      }
    }
    return isValid;
  }

  /**
   *
   * @param {string} roleLabel - label of role to assign user to.
   * @param {object} user - user object to assign to role.
   * @returns {boolean} - whether or not the assignment was successful.
   */
  async assignUserToRole(roleLabel, user) {
    const currentRoleData = await this.getRoles();

    if (currentRoleData === undefined || currentRoleData[roleLabel.toLowerCase()] === undefined) {
      console.error(`Tried to assign user to undefined role: ${roleLabel.toLowerCase()}`);
      return false;
    }

    if (user === null) {
      delete currentRoleData[roleLabel.toLowerCase()].user;
    } else {
      currentRoleData[roleLabel.toLowerCase()].user = user;
    }

    try {
      await this.bdk.upsertBotData(this.roomId, this.botName, this.ROLES_BOTDATA_NAME, currentRoleData);
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  /**
   * Check if role name and label are valid.
   * @param {string} roleName - name of new role
   * @param {string} roleLabel - label of new role
   * @param {string} currentRoles - object of existing roles
   * @returns {number}
   */
  isValidRole(roleName, roleLabel, currentRoles) {
    if (!roleName.length || !roleLabel.length) {
      return ERR_NO_ROLE_NAME;
    } else if (/\s/.test(roleLabel)) {
      return ERR_SPACE_IN_ROLE_LABEL;
    }

    let valid = ZERO;
    Object.keys(currentRoles).forEach((label) => {
      const role = currentRoles[label];
      if (role.name.toLowerCase() === roleName.toLowerCase() || role.label.toLowerCase() === roleLabel.toLowerCase()) {
        valid = ERR_ROLE_ALREADY_EXISTS;
      }
    });

    return valid;
  }
}


export default Roles;
