import React, { Component } from 'react';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import Collapse from 'react-bootstrap/Collapse';
import Button from 'react-bootstrap/Button';
// import { DataTable } from 'dash-table';
// import { NavLink } from 'react-router-dom';

class Header extends Component {
  constructor(props) {
    super(props);
    this.state = {
      expanded: false,
      open: false,
      text: null,
    }
    this.toggleNavbar = this.toggleNavbar.bind(this);
    this.toggleMenuItem = this.toggleMenuItem.bind(this);

    this.scrollRef = null;

    this.text = [
      <>
        <p>Welcome to the Retinal Ganglion Cell (RGC) Typology Project established by the lab of Greg Schwartz at Northwestern University</p>
        <p>Our goal is to provide a unified typology of mouse RGCs based on measurements of light responses, morphology, and gene expression.</p>
        <p>We will also collect information on RGC projection patterns in the brain and species homology.</p>
        <p>Browse and download our database of mouse RGC data, updated in real time, and submit your own data to grow the database. Match your data to these types by eye or using our machine learning classifier.</p>
        <p>All data on this site will always be freely available regardless of publication status. Please cite us.</p>
      </>
    ];

    this.footer = <>
      <p>Direct questions and comments to:</p>
      <p>Greg.Schwartz@northwestern.edu</p>
    </>
  }

  toggleNavbar = () => {
    console.log('toggle button');
    this.setState({ open: false, expanded: !this.state.expanded });
  }

  toggleMenuItem = (i) => {
    console.log(i, 'about button', this.state);
    this.scrollRef.scrollTop = 0;
    if (i !== undefined) {
      this.setState({ open: !this.state.open, expanded: false, text: this.text[i] });
    } else {
      this.setState({ open: !this.state.open, expanded: false });
    }
  }

  render() {
    return (
      <div className='header'>
        <Navbar expand="custom" collapseOnSelect={true} expanded={this.state.expanded}>
          <Navbar.Brand>Retinal Ganglion Cell Typology Project</Navbar.Brand>
          <Navbar.Toggle aria-controls='basic-navbar-nav' onClick={this.toggleNavbar} />
          <Navbar.Collapse id='basic-navbar-nav'>
            <Nav className='mr-auto'>
              <Nav.Link onClick={() => this.toggleMenuItem(0)}>About</Nav.Link>
              <Nav.Link>Download Data</Nav.Link>
              <Nav.Link>Read the paper</Nav.Link>
              <Nav.Link>RGC classifier</Nav.Link>
              <Nav.Link>Central projections</Nav.Link>
              <Nav.Link>Species homology</Nav.Link>
              <Nav.Link>SchwartzLab @ Northwestern</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Navbar>
        <Collapse in={this.state.open}>
          <div>
            <div className='collapse-flex'>
              <div ref={ (ref) => this.scrollRef=ref } className='main-menu'>
                {this.state.text}
              </div>
              <div className='header-footer'>
                {this.footer}
                <Button onClick={() => this.toggleMenuItem(undefined)} variant='secondary'>Dismiss</Button>
              </div>
            </div>
          </div>
        </Collapse>
        {this.props.children}
      </div>
    )
  }
}
export default Header;