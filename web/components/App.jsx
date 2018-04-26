import PropTypes from 'prop-types';
import Select from 'react-select';
import 'react-select/dist/react-select.css';
import moment from 'moment';
const React=require('react');
const _ = require('lodash');
const env = require('../../config.js').env;
const config = require('../../config.js')[env];
const bdk = require('@salesforce/refocus-bdk')(config);
const botName = require('../../package.json').name;
const MIN_HATS = 0;

class App extends React.Component{
  constructor(props){
    super(props);
    this.state= {
      roomId: this.props.roomId,
      users: this.props.users,
      roles: this.props.roles,
      currentRole: this.props.currentRole,
      currentUser: this.props.currentUser,
      value: {},
    };

    this.handleSelectChange = this.handleSelectChange.bind(this);
    this.toggleRtl = this.toggleRtl.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.users !== null) {
      const newUsers = _.extend(this.state.users, nextProps.users);
      this.setState({ users: newUsers });
    }
    this.setState({ roles: nextProps.roles });
    this.setState({ currentRole: nextProps.currentRole });
    const currentValues = this.state.value;
    Object.keys(nextProps.currentRole).forEach((role) => {
      if (nextProps.currentRole[role] !== undefined) {
        currentValues[role] = JSON.parse(nextProps.currentRole[role].value);
      }
    });
    this.setState({ value: currentValues });
  }

  handleSelectChange (role) {
    return (inputValue) => {
      const values = inputValue || null;
      const { roomId, currentUser } = this.state;
      const newValue = this.state.value;
      newValue[role.label] = values;
      this.setState({ value: newValue });
      const currentRole = this.state.currentRole;
      const eventType = {
        'type': 'Event',
        'newUser': values,
      };
      if (currentRole[role.label]) {
        bdk.changeBotData(currentRole[role.label].id,
          JSON.stringify(values))
          .then((o) => {
            if (o.ok) {
              bdk.createEvents(
                roomId,
                currentUser.fullName ? currentUser.fullName : currentUser.name +
                ' has changed ' + role.label +
                ' to ' + values.label + ' at ' +
                moment().format('YYYY-MM-DD HH:mm Z'),
                eventType
              );
            }
          });
      } else {
        bdk.createBotData(
          this.props.roomId,
          botName,
          'participants' + role.label,
          JSON.stringify(values)
        )
          .then((o) => {
            if (o.ok) {
              bdk.createEvents(
                roomId,
                currentUser.fullName ? currentUser.fullName : currentUser.name +
                ' has added ' + values.label +
                ' to ' + role.label + ' at ' +
                moment().format('YYYY-MM-DD HH:mm Z'),
                eventType
              );
            }
          });
      }
    };
  }

  toggleRtl (e) {
    const rtl = e.target.checked;
    this.setState({ rtl });
  }

  render() {
    const { users, value, roles, currentRole } = this.state;

    const divider = 'slds-m-horizontal_x-small ' +
      'slds-m-vertical_small ' +
      'slds-border_bottom';

    return (
      <div>
        {roles.map((role) => {
          const options = [];
          Object.keys(users).forEach((id) => {
            options.push({
              label: users[id].fullName ? users[id].fullName : users[id].name,
              email: users[id].name,
              value: users[id].id,
              role: role.label,
            });
            if (!value[role.label]) {
              value[role.label] = currentRole[role.label] === undefined ? '' :
                JSON.parse(currentRole[role.label].value);
            }
          });
          return (
            <div className="slds-m-horizontal_small slds-m-bottom_small"
              key={role.label}>
              <div
                className="slds-text-body_small slds-m-bottom_xx-small">
                {role.name}
              </div>
              <Select
                onChange={this.handleSelectChange(role)}
                options={options}
                placeholder={ 'Choose ' + role.label }
                rtl={this.state.rtl}
                value={value[role.label]}
                clearable={true}
              />
            </div>
          );
        })}
        <div className={divider}></div>
        {Object.keys(users).map((id) => {
          const usernameCSS =
            'slds-m-horizontal_x-small ' +
            'slds-m-bottom_x-small';
          const hats = JSON.stringify(value).indexOf(id);
          if (users[id].isActive) {
            return (
              <div
                className={usernameCSS}
                style={{ wordBreak: 'break-all' }}
                key={id}>
                <span style={{
                  float: 'left',
                  width: '20px',
                  display: 'inline-block'
                }}>
                  {hats > MIN_HATS ?
                    '\u{1F3A9}':
                    '\u00A0'}
                </span>
                {users[id].fullName ? users[id].fullName : users[id].name}
              </div>
            );
          }

          return (null);
        })}
      </div>
    );
  }
}

App.propTypes={
  roomId: PropTypes.number,
  users: PropTypes.object,
  roles: PropTypes.array,
  currentRole: PropTypes.object,
  currentUser: PropTypes.object,
};

module.exports=App;
