import React, { Component } from 'react';
import Card from 'react-bootstrap/Card';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Button from 'react-bootstrap/Button';
import dynamic from 'next/dynamic';
const Plot = dynamic(import('./custom-plotly.js'), { ssr: false });

class CardItem extends Component {
  constructor(props) {
    super(props);
    this.state = {
      update: -1,
    }
  }

  static getDerivedStateFromProps(props, state) {
    //when the selected type changes, we want to update the state to reflect the new props
    if (props.update !== state.update) {
      return {
        data: props.data,
        layout: {
          ...props.layout,
          margin: { t: 10, l: 30, r: 15, b: 37 },
          autosize: true,
        },
        config: { responsive: true },
        footer: props.footer,
        style: props.style,
        update: props.update,
      };
    } else {
      return null;
    }
  }

  render() {
    return (
      <Card className={this.props.className} style={this.state.style} bg='light'>
        <Card.Header>
          <Row className='justify-content-between'>
            <Col className='col-auto'>{this.props.title}</Col>
            <Col className='col-auto'><ButtonGroup>
              {this.props.expandable
                ? <Button variant='light' onClick={this.props.expandFn}>+</Button>
                : null
              }
              {this.props.interactive
                ? <Button variant='light' onClick={this.props.interactiveFn}>{this.props.interactive}</Button>
                : null
              }
              <Button variant='light' onClick={this.props.infoFn}>𝓲</Button>
            </ButtonGroup></Col>
          </Row>
        </Card.Header>
        <Card.Body>
          {this.props.source
            ? <img src={this.props.source} alt={this.props.alt} />
            : <Plot
              className='plot-object'
              data={this.state.data}
              layout={this.state.layout}
              config={this.state.config}
              onClick={this.props.clickFn ? (e) => this.props.clickFn(e,this) : null}
              onHover={this.props.hoverFn}
              onUnhover={this.props.unhoverFn}
              onInitialized={(fig) => this.setState(fig)}
              onUpdate={(fig) => this.setState(fig)}
              useResizeHandler={true}
            />
          }
        </Card.Body>
        {this.props.footer //does this card have a footer?
          ? <Card.Footer>
            {this.state.footer}
          </Card.Footer>
          : null
        }
      </Card>
    );
  }
}

export default CardItem;