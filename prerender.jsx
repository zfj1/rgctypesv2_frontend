const path = require('path');
const fs = require('fs');
const db = require(path.resolve(__dirname, 'queries'));

const React = require('react');
const ReactDOMServer = require('react-dom/server');
import { StaticRouter, Route } from 'react-router-dom';
import App from './src/App';

///////////////////////////////
///////////////////////////////
fs.mkdir(path.resolve(__dirname, 'build', 'types'), ()=>{});

const doPrerender = async () => {
  const types = await db.getTypes();
  const index = await new Promise((resolve, reject) => {
    return fs.readFile(path.resolve(__dirname, 'build', 'index.html'), 'utf8', (err, data) => {
      if (err) {
        return reject(err);
      } else {
        return resolve(data);
      }
    }); //opens the html template to which the react string will be added
  });

  types.forEach(async type => {
    const props = await db.getAll(type.cell_type_name);

    const reaction = ReactDOMServer.renderToString(
      <StaticRouter location={`/${type.cell_type_name}`} context={{}}>
        <Route
          path='/'
          render={() => <App {...props}/>}
        />
      </StaticRouter>
    );

    const html = index.replace(
      '<div id="root"></div>',
      `<div id="root">${reaction}</div>`
    );

    fs.writeFile(path.resolve(__dirname, 'build', 'types', `${type.cell_type_name}.html`), html, 'utf8', () => {});
  });
};

doPrerender();

