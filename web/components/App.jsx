import PropTypes from 'prop-types';
import Select from 'react-select';
import 'react-select/dist/react-select.css';
const React=require('react');
const _ = require('lodash');
const env = process.env.NODE_ENV || 'dev';
const config = require('../../config.js')[env];
const bdk = require('@salesforce/refocus-bdk')(config);
const botName = require('../../package.json').name;

class App extends React.Component{
  constructor(props){
    super(props);
    this.state= {
      roomId: this.props.roomId,
      users: this.props.users,
      roles: this.props.roles,
      currentRole: this.props.currentRole,
      value: {},
    };

    this.handleSelectChange = this.handleSelectChange.bind(this);
    this.toggleRtl = this.toggleRtl.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    const newUsers = _.extend(this.state.users, nextProps.users);
    this.setState({ users: newUsers });
    this.setState({ roles: nextProps.roles });
    this.setState({ currentRole: nextProps.currentRole });
  }

  handleSelectChange (values) {
    const newValue = this.state.value;
    newValue[values.role] = values;
    this.setState({ value: newValue });
    const currentRole = this.state.currentRole;
    if (currentRole[values.role]) {
      bdk.changeBotData(currentRole[values.role].id,
        JSON.stringify(values));
    } else {
      bdk.createBotData(
        this.props.roomId,
        botName,
        'participants' + values.role,
        JSON.stringify(values)
      );
    }
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
              label: users[id].name,
              value: users[id].id,
              role: role.label,
            });
            if (!value[role.label]) {
              value[role.label] = JSON.parse(currentRole[role.label].value);
            }
          });
          return (
            <div className="slds-m-around_small" key={role.label}>
              <div
                className="slds-text-body_small slds-m-bottom_xx-small"
                style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                {role.name}
              </div>
              <Select
                onChange={this.handleSelectChange}
                options={options}
                placeholder={ 'Choose ' + role.label }
                rtl={this.state.rtl}
                value={value[role.label]}
              />
            </div>
          );
        })}
        <div className={divider}></div>
        {Object.keys(users).map((id) => {
          const usernameCSS =
            'slds-m-horizontal_small ' +
            'slds-m-bottom_x-small ' +
            'slds-text-color_inverse';
          if (users[id].isActive) {
            return (
              <div
                className={usernameCSS}
                key={id}>
                {users[id].name}
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
};

module.exports=App;
