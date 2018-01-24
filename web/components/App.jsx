import PropTypes from 'prop-types';
import Select from 'react-select';
import 'react-select/dist/react-select.css';
const React=require('react');
// const env = process.env.NODE_ENV || 'dev';
// const config = require('../../config.js')[env];
// const bdk = require('@salesforce/refocus-bdk')(config);

class App extends React.Component{
  constructor(props){
    super(props);
    this.state= {
      roomId: this.props.roomId,
      users: this.props.users,
      roles: this.props.roles,
      value: [],
    };

    this.handleSelectChange = this.handleSelectChange.bind(this);
    this.toggleRtl = this.toggleRtl.bind(this);
  }

  // componentWillReceiveProps(nextProps) {
  // }

  handleSelectChange (values) {
    this.setState({ value: values });
  }

  toggleRtl (e) {
    const rtl = e.target.checked;
    this.setState({ rtl });
  }

  render() {
    const { users, value, roles } = this.state;
    const options = [];
    Object.keys(users).forEach((id) => {
      options.push({
        label: users[id].name,
        value: users[id].id,
      });
    });

    const divider = 'slds-m-horizontal_x-small ' +
      'slds-m-vertical_small ' +
      'slds-border_bottom';

    return (
      <div>
        {roles.map((role) => {
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
                simpleValue
                value={value}
              />
            </div>
          );
        })}
        <div className={divider}></div>
        {Object.keys(users).map((id) => {
          return (
            <div
              className="slds-m-horizontal_small slds-m-bottom_x-small slds-text-color_inverse"
              key={id}>
              {users[id].name}
            </div>
          );
        })}
      </div>
    );
  }
}

App.propTypes={
  roomId: PropTypes.number,
  users: PropTypes.object,
  roles: PropTypes.array,
};

module.exports=App;
