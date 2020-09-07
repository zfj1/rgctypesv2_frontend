//creates a minimal plotly bundle
import createPlotlyComponent from 'react-plotly.js/factory';
var Plotly = require('plotly.js/lib/core');

Plotly.register([
  require('plotly.js/lib/scatter'),
  require('plotly.js/lib/heatmap'),
  require('plotly.js/lib/mesh3d'),
]); //import the required plot types

const Plot = createPlotlyComponent(Plotly); //make the react component from the minified bundle

export default Plot;