import React, { Component } from 'react';
// import Collapse from 'react-bootstrap/Collapse';
// import Accordion from 'react-bootstrap/Accordion';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';


class Footer extends Component {
  constructor(props) {
    super(props);
    this.hoverRow = this.hoverRow.bind(this);
    this.toggleFull = this.toggleFull.bind(this);
    this.togglePartial = this.togglePartial.bind(this);
    this.linkFn = this.linkFn.bind(this);
    this.state = {
      class: 'closed',
      // type: this.props.type,
      hovered: this.props.type,
      figure: [undefined, undefined, undefined],
    };
  }

  static getDerivedStateFromProps(props, state) {
    if (props.figure[2] !== state.figure[2]) {
      if (props.figure[0] !== state.figure[0]) {
        //we want to partially open...
        //update state.figure...
        return {
          class: 'partial',
          hovered: props.type,
          figure: props.figure,
        };
      } else if (state.class === 'partial') {
        //we want to clear state.figure and close panel
        return {
          class: 'closed',
          hovered: props.type,
          figure: [undefined, undefined, props.figure[2]],
        };
      }
    } else {
      return null;
    }
  }


  render() {
    const type = this.props.types[this.state.class === 'full' ? this.state.hovered : this.props.type];
    return (
      <div className={`footer ${this.state.class}`}>
        <Row className='footer-top'>
          <Col>
            {type.cell_type_name_verbose}
            {this.state.class === 'full'
              ? null
              : <a onClick={this.togglePartial}> (More info)</a>
            }
          </Col>
          <Col>
            <Button onClick={this.toggleFull} size='sm' variant='light'>Change Type</Button>
          </Col>
          <Col>
            Last updated: {this.props.lastUpdate}
          </Col>
        </Row>
        <Row className='footer-bottom'>
          <Col className='footer-left'>
            {this.props.types[this.state.hovered].note_text}
          </Col>
          <Col className='footer-right'>
            <div className={'legend-panel ' + (this.state.class === 'full' ? 'hide' : 'show')}>
              {this.state.figure[1]}
            </div>
            <div className='table-panel'>
              {React.cloneElement(this.props.children, { onClick: this.linkFn, onHover: this.hoverRow })}
            </div>
          </Col>
        </Row>
      </div >
    )
  }

  hoverRow = (row) => {
    this.setState({ hovered: row });
  }

  toggleFull = () => {
    if (this.state.class === 'full') {
      const last = this.state.figure[2];
      this.setState({ class: 'closed', figure: [undefined, undefined, last] });
    } else {
      this.setState({ class: 'full' });
    }
  }

  togglePartial = () => {
    if (this.state.class === 'partial') {
      this.setState({ class: 'closed' });
    } else {
      this.setState({ class: 'partial' });
    }
  }

  linkFn() {
    this.toggleFull();
    this.props.pauseFn(); //pause updates to the parent app
    setTimeout(this.props.pauseFn, 350); //wait .35 seconds for animation to finish before allowing updates again
  }
}

export default Footer;