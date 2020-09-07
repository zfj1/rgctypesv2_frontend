import React, { Component } from 'react';

class SortIcon extends Component {
  constructor(props) {
    super(props);
    this.strings = ['△▽', '△▼', '▲▽', '△▽'];
    this.hovermode = this.hovermode.bind(this);
    this.state = {
      o: 0,
    };
  }

  render() {
    let sort = this.props.sort || 0;
    return (
      <a
        className='sort-icon'
        onMouseEnter={() => this.hovermode(true)}
        onMouseLeave={() => this.hovermode(false)}
        onClick = {() => {this.hovermode(false); this.props.resort();}}
      >
        {this.strings[sort + this.state.o]}
      </a>
    )
  }

  hovermode = e => {
    this.setState({ o: e ? 1 : 0 });
  }
}

export default SortIcon;