import React, { Component } from 'react';

class Deck extends Component {
  constructor(props) {
    super(props)
    this.getColumnCount = this.getColumnCount.bind(this);
    this.getCardProps = this.getCardProps.bind(this);
    this.expand = this.expand.bind(this);

    this.nCards = React.Children.count(props.children);
    this.state = {
      nCols: props.maxCols,
      cards: props.children.map((child, i) => {
        return {
          w: child.props.w,
          h: child.props.h,
          t: child.props.t,
          l: child.props.l,
          o: i,
        }
      }),
      expanded: null,
    };

    this.rem2pix = props.rem2pix;
    this.gridpix = props.grid * this.rem2pix;
    this.gutterpix = props.gutter * this.rem2pix;
  }

  componentDidMount() {
    this.rem2pix = parseFloat(getComputedStyle(document.documentElement).fontSize);
    this.gridpix = this.props.grid * this.rem2pix;
    this.gutterpix = this.props.gutter * this.rem2pix;
    this.getColumnCount();
    window.addEventListener('resize', this.getColumnCount);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.getColumnCount);
  }

  componentDidUpdate() {
    this.getColumnCount();
  }

  render() {
    return (
      <div className='card-deck'>
        {React.Children.map(this.props.children, (child, i) => {
          return React.cloneElement(child, {
            expandFn: () => this.expand(i),
            style: () => this.getCardProps(i),
            infoFn: (text) => {
              console.log([i, text]);
              return child.props.infoFn([i, text]);
            },
          });
        })}
        <div className="spinner" />
      </div>
    );
  }


  getColumnCount() { //determine whether the number of columns has changed
    let width = window.innerWidth;
    let nCols = Math.min(Math.floor(width / this.rem2pix / this.props.grid), this.props.maxCols);
    if (nCols !== this.state.nCols) {
      if (window.cancelAnimationFrame) {
        window.cancelAnimationFrame(this.lastAnimation); //cancel any pending animation
      }

      this.lastAnimation = window.requestAnimationFrame(() => {
        let cards = this.getCardGrid(Math.max(nCols, 1)); // update the card positions
        this.setState({
          cards: cards,
          nCols: nCols,
        });
      });
    }
  }

  getCardGrid(nCols, expanded = this.state.expanded) { //create a new grid of cards
    let grid = { //initialize the grid
      pos: new Array(this.props.startRows).fill(new Array(this.props.maxCols).fill(false)), //array of arrays
      t: 0,
      l: 0,
    }

    let cards = [...this.state.cards];
    for (let i = 0; i < this.nCards; i++) {
      const j = expanded === i ? 1 : 0;
      const ar = cards[i].h[j] / cards[i].w[j];
      const w = Math.min(nCols, cards[i].w[j]);
      const h = Math.ceil(w * ar);

      grid = this.placeCard(grid.pos, 0, grid.l, h, w, nCols);
      cards[i].t = grid.t;
      cards[i].l = grid.l;
      grid.l += w;
    }

    return cards;
  }

  placeCard(pos, t, l, h, w, nCols) { //place the card on the grid
    const excess = t + h - pos.length;
    if (excess > 0) { //append rows to pos
      pos.push(...new Array(excess).fill(new Array(this.props.maxCols).fill(false)));
    }

    if (l + w > nCols) {
      if (l === 0) {//the card won't fit anywhere!!
        for (let i = t; i < t + h; i++) {
          pos[i][0] = true
        }
        return { pos: pos, t: t, l: l }
      }
      return this.placeCard(pos, t + 1, 0, h, w, nCols);
    }

    if (pos[t][l]) {
      return this.placeCard(pos, t, l + 1, h, w, nCols);
    }

    let newPos = new Array(pos.length);

    for (let i = 0; i < pos.length; i++) {
      newPos[i] = pos[i].slice(0); //make a shallow copy of the row

      if (i >= t && i < t + h) { //start checking if we can fill the card here
        for (let j = l; j < l + w; j++) {
          if (pos[i][j]) { //the fill is invalid, so try the next index
            return this.placeCard(pos, t, l + 1, h, w, nCols);
          }
          newPos[i][j] = true; //update the copy
        }
      }
    }
    //assign the card to this position and update the fill
    return { pos: newPos, t: t, l: l };
  }

  expand(i) {
    let expanded;
    if (this.state.expanded === i) {
      expanded = null;
    } else {
      expanded = i;
    }
    const cards = this.getCardGrid(Math.max(this.state.nCols, 1), expanded); // update the card positions
    this.setState({ cards: cards, expanded: expanded });
  }

  getCardProps(i) { //convert the unit coordinates to screen coordinates
    const context = this.state.cards[i];
    const exp = this.state.expanded === i ? 1 : 0;

    if (this.state.nCols > 1) {
      const vws = 100 / this.state.nCols;
      const ar = context.h[exp] / context.w[exp];
      const w = Math.min(this.state.nCols, context.w[exp]);
      const h = Math.ceil(w * ar);
      return {
        style: {
          WebkitTransform: `translate(calc(${context.l * vws}vw + ${this.gutterpix / 2}px), calc(${context.t * vws}vw + ${this.gutterpix / 2}px))`,
          height: `calc(${h * vws}vw - ${this.gutterpix}px)`,
          width: `calc(${w * vws}vw - ${this.gutterpix}px)`,
          zIndex: -context.o,
        },
        expandable: true,
        update: Date.now(),
      }
    } else if (this.state.nCols === 1) {
      const vws = 100 / this.state.nCols;
      return {
        style: {
          WebkitTransform: `translate(${this.gutterpix / 2}px, calc(${context.o * vws}vw + ${this.gutterpix / 2}px)`,
          height: `calc(100vw - ${this.gutterpix}px)`,
          width: `calc(100vw - ${this.gutterpix}px)`,
          zIndex: -context.o,
        },
        expandable: false,
        update: Date.now(),
      }
    } else { //enforce minimum size
      return {
        style: {
          WebkitTransform: `translate(${this.gutterpix / 2}px, ${context.o * this.gridpix + this.gutterpix / 2})`,
          height: this.gridpix - this.gutterpix,
          width: this.gridpix - this.gutterpix,
          zIndex: -context.o,
        },
        expandable: false,
        update: Date.now(),
      }
    }
  }

}

export default Deck;