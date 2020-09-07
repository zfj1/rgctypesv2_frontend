import React, { Component } from 'react';
import Deck from './Deck';
import Header from './Header';
import Footer from './Footer';
import TypesTable from './TypesTable';
import * as Figures from './Figures';

const CHILDREN = [
  <Figures.CellImage t={0} l={0} />,
  <Figures.CellImage ew t={0} l={1} />,
  <Figures.Traces t={0} l={2} />,
  <Figures.PSTHMap t={0} l={4} />,
  <Figures.Stratification t={1} l={0} />,
  <Figures.EyePosition t={1} l={1} />,
  <Figures.SpikeCount t={1} l={2} />,
  <Figures.UMAP t={2} l={0} />,
  <Figures.NoFigure t={2} l={2} />,
  <Figures.NoFigure t={2} l={3} />,
  <Figures.NoFigure t={2} l={4} />,
];

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ...props,
      pause: false,
      figure: [undefined, undefined],
    }; //copy the initial props into state
    this.getObj = this.getObj.bind(this);
    this.pauseFn = this.pauseFn.bind(this);
    this.infoFn = this.infoFn.bind(this);
  }

  shouldComponentUpdate(nextProps, nextState) {
    let nextType = nextProps.location.pathname.slice(1);
    if (Object.keys(this.state.types).length) {
      if (nextProps.location.state) {
        let eyewire = nextProps.location.state.redir;
        if (eyewire) { //did we click an eyewire link?
          nextProps.history.replace({ state: { redir: null } }); //clear the redirect flag
          let win = window.open(eyewire, '_blank'); //open eyewire in a new tab
          if (win) { //make sure the tab wasn't blocked by browser
            win.focus(); //switch tabs
          }
        }
      }
      if (this.state.selectedType !== nextType) { // we've requested a new type but not ready to update yet
        this.updateSelected(nextType); // request the update to selectedType
        return false; // decline update
      }
    }
    if (nextState.pause) { //temporarily pausing updates
      return false;
    } else {
      return true; // the URL and the selected type match, so we're ready to update 
    }
  }

  updateSelected(currType) {
    if (this.state.typeData[currType]) { //we've already fetched this cell!!
      this.setState({
        selectedType: currType,
      }); //update the state once the data is received
      return;
    }

    let allTypeData = { ...this.state.typeData }; //copy the type data

    //fetch the data for this type from the server
    fetch(`/api/${currType}`)
      .then(res => res.json())
      .then(data => {
        let typeData = data.shift();
        let cellData = this.repackageCellData(data);

        typeData.cellData = cellData;
        allTypeData[currType] = typeData; //add the data into the copy (mutability)

        this.setState({
          selectedType: currType,
          typeData: allTypeData,
        }); //update the state once the data is received
      });
  }

  render() {
    const type = this.state.typeData[this.state.selectedType];
    
    return (
      <div className='App'>
        <Header />
        <Deck
          maxCols={6} // number of horizontal elements in grid
          gutter={1.5} // gutter size in rem
          grid={17} // 2*gutter + minSize of a card
          startRows={5} // allows for up to 5 rows of cards before additional memory is allocated...
          rem2pix={16} //this gets overwritten when the dom loads
        >
          {React.Children.map(CHILDREN, child => {
            return React.cloneElement(child, {
              typeData: this.state.typeData[type.cell_type_name],
              objData: this.state.objData[type.cell_type_name],
              interactiveFn: this.getObj,
              initY: 40, //should come from database!!
              infoFn: this.infoFn,
            });
          })}
        </Deck>
        <Footer
          type={this.props.types.findIndex(i => i.cell_type_name === type.cell_type_name)}
          types={this.props.types}
          pauseFn={this.pauseFn}
          lastUpdate={this.props.lastUpdate}
          figure={this.state.figure}
        // note={this.state.types}
        >
          <TypesTable
            data={this.state.types}
            history={this.props.history}
          />
        </Footer>
      </div>
    );
  }

  repackageCellData = (data) => {
    const nCells = data.length; //get the cell count
    let cellData = {};
    // let keys = Object.keys(data[0]); //get the keys from the cell data
    const keys = ["cell_name", "sms_OFF_mean", "sms_ON_mean", "sms_size_bins"];
    keys.forEach(key => {
      cellData[key] = new Array(nCells); //initialize an array for each key
      cellData.left_x = [];
      cellData.left_y = [];
      cellData.left_name = [];
      cellData.right_x = [];
      cellData.right_y = [];
      cellData.right_name = [];
    });

    data.forEach((cell, ind) => {
      keys.forEach(key => {
        cellData[key][ind] = cell[key]; //map the array of cell objects into an object of property arrays
      });
      if (cell['position_eye'] === 'L') {
        cellData.left_name.push(cell['cell_name']);
        cellData.left_x.push(cell['position_x']);
        cellData.left_y.push(cell['position_y']);
      } else {
        cellData.right_name.push(cell['cell_name']);
        cellData.right_x.push(cell['position_x']);
        cellData.right_y.push(cell['position_y']);
      }
    });

    return cellData;
  }

  getObj = () => {
    const currType = this.state.selectedType;
    if (this.state.objData[currType]) {
      return;
    }
    let objData = { ...this.state.objData };

    fetch('/static/images/TestMesh.obj') //placeholder
      .then(res => res.text())
      .then(res => {

        let vertices = res
          .match(/^v( -?\d+(\.\d+)?){3}$/gm)
          .map(v => {
            return v
              .split(" ")
              .slice(1, 4)
              .map(parseFloat); //split the string by spaces, discard the initial v, and convert to numbers
          }); //parse the obj file for vertices using regexp and map to [x,y,z]
        vertices = vertices[0].map((_, c) => vertices.map(r => r[c])); //transpose the matrix

        let faces = res
          .match(/^f( \d+\/\/\d+){3}$/gm)
          .map(f => {
            return f
              .split(" ")
              .slice(1, 4)
              .map(i => parseInt(i) - 1);
          });
        faces = faces[0].map((_, c) => faces.map(r => r[c])); //transpose the matrix

        objData[currType] = { vertices: vertices, faces: faces };
        this.setState({ objData: objData });
      });
  }

  pauseFn = () => {
    this.setState({ pause: !this.state.pause });
  }

  infoFn = (legend) => {
    console.log('registered info in app');
    this.setState({ figure: legend.concat(Date.now()) });
  }
}

export default App;