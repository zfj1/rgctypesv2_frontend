import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Route } from 'react-router-dom';

import App from './App';

fetch(`/api/all${window.location.pathname}`)
  .then(res => res.json())
  .then(props => {
    console.log(props);
    ReactDOM.hydrate(
      <React.StrictMode>
        <BrowserRouter>
          <Route
            path='/'
            render={(routing) => <App {...routing} {...props}/>}
          />
        </BrowserRouter>
      </React.StrictMode>,
      document.getElementById('root')
    );
    document.getElementsByClassName('spinner')[0].style.cssText = 'visibility: hidden; animation: none; z-index: -100;';
    Array.from(document.getElementsByClassName('card')).forEach(card => {
      if (card.classList[0] !== 'umap-hover-img') {
        card.style.visibility = 'visible';
      }
    });
  });