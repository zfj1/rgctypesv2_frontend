import React, { Component } from 'react';
import CardItem from './CardItem';

const PLOTLY = {
  ONmean: '#2e5cb2',
  OFFmean: 'black',
  meanWeight: 3,
  ONcell: '#9eb7e6',
  OFFcell: '#d2d2d2',
  cellWeight: 1,
  smsaxes: 1,

  colorscale: 'Viridis',
  colorbarwidth: 15,
  psthslice: 'red',
  psthlines: 1,
  psthlinetype: 'dot',

  eyewire: 'black',
  schwartzlab: 'red',

  left: '#2e5cb2',
  right: 'ef553b',
};

class NoFigure extends Component {
  constructor(props) {
    super(props);
    this.legend = 'Empty legend';
  }
  //an empty card, for testing of deck behavior...
  render() {
    return (
      <CardItem
        title='Empty'
        {...this.props.style()}
        infoFn={() => this.props.infoFn(this.legend)}
        expandFn={this.props.expandFn}
        data={[]}
        layout={{}}
      />
    )
  }
}
NoFigure.defaultProps = { w: [1, 2], h: [1, 2], t: 0, l: 0 };

class SpikeCount extends Component {
  constructor(props) {
    super(props);
    this.legend = 'Spike count in one second intervals during (cyan) and after (black) a one second light step from darkness to ~200 R*/rod/s.';
  }

  render() {
    //inherited from App
    const typeData = this.props.typeData;
    const cellData = typeData.cellData;

    return (
      <CardItem //spike count
        title='Spike Count vs. Spot size'
        {...this.props.style()}
        infoFn={() => this.props.infoFn(this.legend)}
        expandFn={this.props.expandFn}
        data={[
          ...this.getSMSTraces(cellData),
          {
            x: typeData.sms_size_bins,
            y: typeData.sms_OFF_mean,
            name: 'OFF mean',
            line: {
              color: PLOTLY['OFFmean'],
              width: PLOTLY['meanWeight'],
            },
            hoverinfo: 'text+name',
          },
          {
            x: typeData.sms_size_bins,
            y: typeData.sms_ON_mean,
            name: 'ON mean',
            line: {
              color: PLOTLY['ONmean'],
              width: PLOTLY['meanWeight'],
            },
            hoverinfo: 'text+name',
          },
        ]}
        layout={{
          hovermode: 'closest',
          legend: {
            x: 0,
            y: 1,
            yanchor: 'bottom',
            orientation: 'h',
          },
          xaxis: {
            title: 'Spot size (μm)',
            range: [0, 1200],
            showgrid: false,
            zerolinewidth: PLOTLY['smsaxes'],
            ticks: 'outside',
          },
          yaxis: {
            title: 'Spikes',
            range: [0, typeData.sms_max_spikes],
            showgrid: false,
            zerolinewidth: PLOTLY['smsaxes'],
            ticks: 'inside',
            tickangle: -90,
          }
        }}
      />
    )
  }

  getSMSTraces(data) {
    let traces = [];
    for (let i = 0; i < data.cell_name.length; i++) {
      traces.push({
        x: data.sms_size_bins[i],
        y: data.sms_OFF_mean[i],
        name: data.cell_name[i] + ':OFF',
        mode: 'lines+markers',
        showlegend: false,
        line: {
          color: PLOTLY['OFFcell'],
          width: PLOTLY['cellWeight'],
        },
        hoverinfo: 'text+name',
      });
      traces.push({
        x: data.sms_size_bins[i],
        y: data.sms_ON_mean[i],
        name: data.cell_name[i] + ':ON',
        mode: 'lines+markers',
        showlegend: false,
        line: {
          color: PLOTLY['ONcell'],
          width: PLOTLY['cellWeight'],
        },
        hoverinfo: 'text+name',
      });
    }
    return traces;
  }
}
SpikeCount.defaultProps = { w: [2, 4], h: [1, 2], t: 0, l: 0 };

class PSTHMap extends Component {
  constructor(props) {
    super(props);
    this.legend='Top, mean firing rate for RGCs of this type as a heatmap over spot size and time. Stimulus is a 1 second spot of light from darkness to ~200 R*/rod/s. Bottom, slice through the top graph to show the mean peri-stimulus time histogram (PSTH) for the selected spot size.';
  }

  render() {
    //inherited from App
    const typeData = this.props.typeData;
    const Yind = this.props.initY;
    const Y = typeData.sms_size_bins[Yind];

    return (
      <CardItem
        title='PSTH vs. Spot size'
        {...this.props.style()}
        infoFn={() => this.props.infoFn(this.legend)}
        expandFn={this.props.expandFn}
        footer={`Spot size: ${Math.round(Y)}µm`}
        clickFn={this.clickFn}
        data={[
          { // heatmap
            x: typeData.smspsth_time_axis,
            y: typeData.sms_size_bins,
            z: typeData.smspsth_values,
            type: 'heatmap',
            colorscale: PLOTLY['colorscale'],
            name: 'FiringRate',
            colorbar: {
              title: 'Firing rate (Hz)',
              titleside: 'right',
              thickness: PLOTLY['colorbarwidth'],
            },
            xaxis: 'x',
            yaxis: 'y1',
          },
          { // cross section
            x: typeData.smspsth_time_axis,
            y: typeData.smspsth_values[Yind],
            name: 'PSTH',
            line: {
              color: PLOTLY['psthslice'],
            },
            xaxis: 'x',
            yaxis: 'y2',
          },
        ]}
        layout={{
          grid: { rows: 2, columns: 1 },
          showlegend: false,
          shapes: [
            { //cross-section
              type: 'line',
              line: {
                color: PLOTLY['psthslice'],
                width: PLOTLY['psthlines'],
                dash: PLOTLY['psthlinetype'],
              },
              yref: 'y1', y0: Y, y1: Y,
              xref: 'x1', x0: typeData.smspsth_time_axis[0], x1: typeData.smspsth_time_axis[typeData.smspsth_time_axis.length - 1],
            },
            { //on-line heatmap
              type: 'line',
              line: {
                color: 'white',
                width: PLOTLY['psthlines'],
                dash: PLOTLY['psthlinetype'],
              },
              yref: 'y1', y0: 0, y1: 1250,
              xref: 'x1', x0: 0, x1: 0,
            },
            { //off-line heatmap
              type: 'line',
              line: {
                color: 'white',
                width: PLOTLY['psthlines'],
                dash: PLOTLY['psthlinetype'],
              },
              yref: 'y1', y0: 0, y1: 1250,
              xref: 'x1', x0: 1, x1: 1,
            },
            { //on-line cross section
              type: 'line',
              line: {
                color: 'black',
                width: PLOTLY['psthlines'],
                dash: PLOTLY['psthlinetype'],
              },
              yref: 'y2', y0: 0, y1: 500,
              xref: 'x1', x0: 0, x1: 0,
            },
            { //off-line cross section
              type: 'line',
              line: {
                color: 'black',
                width: PLOTLY['psthlines'],
                dash: PLOTLY['psthlinetype'],
              },
              yref: 'y2', y0: 0, y1: 500,
              xref: 'x1', x0: 1, x1: 1,
            },

          ],
          xaxis: {
            range: [-1, 2],
            title: 'Time (sec)',
            showgrid: false,
            zeroline: false,
          },
          yaxis: {
            showgrid: false,
            zeroline: false,
            ticks: 'inside',
            tickcolor: 'white',
            tickangle: -90,
            dtick: 200,
            range: [typeData.sms_size_bins[0], typeData.sms_size_bins[typeData.smspsth_time_axis.length - 1]],
            title: 'Spot size (µm)',
          },
          yaxis2: {
            showgrid: false,
            // zeroline: true,
            ticks: 'inside',
            tickangle: -90,
            title: 'Firing Rate (Hz)',
          }
        }}
      />
    )
  }

  clickFn(e, card) { //not bound!!
    if (e.points[0].data.yaxis === 'y2') { //ignore clicks on the lower axis
      return;
    }
    let Y = e.points[0].y;
    let layout = { ...card.state.layout };
    let data = { ...card.state.data };
    layout.shapes[0].y0 = Y;
    layout.shapes[0].y1 = Y;

    data[1].y = data[0].z[e.points[0].pointIndex[0]];// typeData.smspsth_values[this.state.nearestY]
    card.setState({
      layout: layout,
      // data: data,
      footer: `Spot size: ${Math.round(Y)}µm`,
    });
  }
}
PSTHMap.defaultProps = { w: [2, 4], h: [2, 4], t: 0, l: 0 };

class CellImage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      interactive: false,
    }
    this.interactiveFn = this.interactiveFn.bind(this);
    this.legend = this.props.ew
      ? 'Example cell from museum.eyewire.org.'
      : 'Maximum projection from a confocal or two-photon image of a recorded cell.';
    
  }
  render() {
    const objData = this.props.objData; //should differentiate between ew and otherwise...
    const typeData = this.props.typeData;

    let props;

    if (this.state.interactive && objData) {
      props = {
        data: [{
          type: 'mesh3d',
          x: objData.vertices[0],
          y: objData.vertices[1],
          z: objData.vertices[2],
          i: objData.faces[0],
          j: objData.faces[1],
          k: objData.faces[2],
          color: '#828079',
          lighting: {
            ambient: 0.18,
            diffuse: .7,
            fresnel: .1,
            specular: .2,
            roughness: .1,
          },
          lightposition: {
            x: 0,
            y: 20,
            z: 0,
          },
        }],
        layout: {
          scene: {
            aspectmode: 'data',
            camera: {
              eye: {
                x: 0,
                y: -3.5,
                z: 0,
              },
            },
          },
        },
        interactive: '2D',
      }
    } else if (this.props.ew) {
      props = {
        source: `/static/images/eyewire_meshes/${typeData.cell_type_name}.jpg`,
        alt: 'Example cell from museum.eyewire.org',
        interactive: '3D',
      };
    } else {
      props = {
        source: `/static/images/confocal/${typeData.cell_type_name}.jpg`,
        alt: 'Maximum projection from a confocal or two-photon image of a recorded cell.',
        interactive: '3D',
      };
    }

    const title = this.props.ew
      ? `Eyewire (type ${typeData.ew_type})`
      : 'Light Microscopy';

    return (
      <CardItem
        title={title}
        {...this.props.style()}
        infoFn={() => this.props.infoFn(this.legend)}
        expandFn={this.props.expandFn}
        footer='Scale bar = 50µm'
        interactiveFn={this.interactiveFn}
        {...props}
      />
    )
  }

  interactiveFn = () => {
    this.props.interactiveFn();
    this.setState({ interactive: !this.state.interactive });
  }
}
CellImage.defaultProps = { w: [1, 2], h: [1, 2], t: 0, l: 0 };

class EyePosition extends Component {
  constructor(props) {
    super(props);
    this.legend = 'Retinal locations of recorded cells for which this information was measured. The origin is the optic nerve. Negative and positive X coordinates correspond to nasal and temporal, respectively. Negative and positive Y coordinates correspond to ventral and dorsal, respectively.';
  }

  render() {
    const cellData = this.props.typeData.cellData;
    return (
      <CardItem
        title='Cell Positions'
        {...this.props.style()}
        infoFn={() => this.props.infoFn(this.legend)}
        expandFn={this.props.expandFn}
        data={[
          {
            type: 'scatter',
            mode: 'markers',
            x: cellData.left_x,
            y: cellData.left_y,
            text: cellData.left_name,
            name: 'Left eye',
            marker: {
              color: PLOTLY['left'],
            },
            showlegend: true,
            hoverinfo: 'text+name',
          },
          {
            type: 'scatter',
            mode: 'markers',
            x: cellData.right_x,
            y: cellData.right_y,
            text: cellData.right_name,
            name: 'Right eye',
            marker: {
              color: PLOTLY['right'],
            },
            showlegend: true,
            hoverinfo: 'text+name',
          },
        ]}
        layout={{
          legend: {
            x: 0,
            y: 1,
            yanchor: 'bottom',
            orientation: 'h',
          },
          hovermode: 'closest',
          xaxis: {
            title: 'Naso-temporal position (μm)',
            range: [-2500, 2500],
            showgrid: false,
          },
          yaxis: {
            title: 'Dorso-temporal position (μm)',
            range: [-2500, 2500],
            showgrid: false,
            ticks: 'inside',
            tickangle: -90,
            scaleanchor: 'x',
            scaleratio: 1,
          },
        }}
      />
    )
  }
}
EyePosition.defaultProps = { w: [1, 2], h: [1, 2], t: 0, l: 0 };

class Stratification extends Component {
  constructor(props) {
    super(props);
    this.legend = 'Dotted lines at 0 and 1 indicate the ON and OFF ChAT bands, respectively. Stratification for EyeWire types courtesy of Sebastian Seung. SchwartzLab stratifications (red) are averaged from 1-4 confocal reconstructions in which ChAT bands were labled with an antibody. For details of ChAT flattening algorithm see Sümbül et al. (2014) Nat Comm.';
  }

  render() {
    const typeData = this.props.typeData;

    return (
      <CardItem
        title='Stratification'
        {...this.props.style()}
        infoFn={() => this.props.infoFn(this.legend)}
        expandFn={this.props.expandFn}
        data={[
          {
            x: typeData.strat_ew_depth,
            y: typeData.strat_ew_values,
            name: `EyeWire ${typeData.ew_type}`,
            line: {
              color: PLOTLY['eyewire'],
            }
          },
          {
            x: typeData.strat_sl_depth,
            y: typeData.strat_sl_values,
            name: 'SchwartzLab',
            line: {
              color: PLOTLY['schwartzlab'],
            }
          },
        ]}
        layout={{
          shapes: [
            {
              y0: 0, y1: 1,
              x0: 0, x1: 0,
              line: {
                color: 'black',
                width: 1,
                dash: 'dot',
              }
            },
            {
              y0: 0, y1: 1,
              x0: 1, x1: 1,
              line: {
                color: 'black',
                width: 1,
                dash: 'dot',
              }
            },
          ],
          legend: {
            x: 0,
            y: 1,
            yanchor: 'bottom',
            orientation: 'h',
          },
          xaxis: {
            title: 'Normalized IPL depth',
            range: [-2, 3],
            zeroline: false,
          },
          yaxis: {
            title: 'Dendritic density (norm.)',
            range: [0, 1.1],
            ticks: 'inside',
            tickangle: -90,
          },
        }}
      />
    )
  }
}
Stratification.defaultProps = { w: [1, 2], h: [1, 2], t: 0, l: 0 };

class Traces extends Component {
  constructor(props) {
    super(props);
    this.legend = 'Raw traces from 3 RGCs responding to a light step from darkness to ~200 R*/rod/s. Spot sizes are indicated.';
  }

  render() {
    return (
      <CardItem
        title='Example Light Response Traces'
        {...this.props.style()}
        infoFn={() => this.props.infoFn(this.legend)}
        expandFn={this.props.expandFn}
        source={`/static/images/traces/${this.props.typeData.cell_type_name}_traces.png`}
        alt='Raw traces from 3 RGCs responding to a light step from darkness to ~200 R*/rod/s. Spot sizes are indicated.'
      />
    )
  }
}
Traces.defaultProps = { w: [2, 3], h: [1, 2], t: 0, l: 0 };

class UMAP extends Component {
  constructor(props) {
    super(props);
    this.hoverFn = this.hoverFn.bind(this);
    this.unhoverFn = this.unhoverFn.bind(this);
    this.state = {
      source: undefined,
      style: { visibility: 'hidden' },
      text: '',
    };
    this.legend = 'UMAP and psth etc';
  }

  render() {
    const cellData = this.props.typeData.cellData;
    return (
      <>
        <CardItem
          title='UMAP Demo'
          {...this.props.style()}
          infoFn={() => this.props.infoFn(this.legend)}
          expandFn={this.props.expandFn}
          hoverFn={this.hoverFn}
          unhoverFn={this.unhoverFn}
          data={[
            {
              type: 'scatter',
              mode: 'markers',
              x: cellData.left_x,
              y: cellData.left_y,
              text: cellData.left_name,
              name: 'Left eye',
              marker: {
                color: PLOTLY['left'],
              },
              showlegend: true,
              hoverinfo: 'none',
            },
            {
              type: 'scatter',
              mode: 'markers',
              x: cellData.right_x,
              y: cellData.right_y,
              text: cellData.right_name,
              name: 'Right eye',
              marker: {
                color: PLOTLY['right'],
              },
              showlegend: true,
              hoverinfo: 'none',
            },
          ]}
          layout={{
            legend: {
              x: 0,
              y: 1,
              yanchor: 'bottom',
              orientation: 'h',
            },
            hovermode: 'closest',
            xaxis: {
              title: 'Naso-temporal position (μm)',
              range: [-2500, 2500],
              showgrid: false,
            },
            yaxis: {
              title: 'Dorso-temporal position (μm)',
              range: [-2500, 2500],
              showgrid: false,
              ticks: 'inside',
              tickangle: -90,
              scaleanchor: 'x',
              scaleratio: 1,
            },
          }}
        />
        <CardItem
          title={this.state.text}
          className='umap-hover-img'
          source={this.state.source}
          style={this.state.style}
          update={Date.now()}
        />
      </>
    );
  }

  hoverFn = (e) => {
    this.setState({
      source: '/static/images/eyewire_meshes/ONalpha.jpg',
      style: {
        WebkitTransform: `translate(${e.event.clientX + 10}px, ${e.event.clientY + 10}px)`,
        visibility: 'visible',
      },
      text: e.points[0].text,
    });
  }
  unhoverFn = (e) => {
    this.setState({ style: { visibility: 'hidden' } });
  }
}
UMAP.defaultProps = { w: [2, 4], h: [2, 4], t: 0, l: 0 }

export { NoFigure, SpikeCount, PSTHMap, CellImage, EyePosition, Stratification, Traces, UMAP };