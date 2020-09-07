import React, { Component } from 'react';
import{ Table } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Dropdown from 'react-bootstrap/Dropdown';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import SortIcon from './SortIcon';

const FUNC_CLASS = {
  SbCO: 'Suppressed-by-Contrast / Other',
  ONOS: 'ON Orientation-Selective',
  OOSmRF: 'ON-OFF Small Receptive Field',
  OFFsus: 'OFF Sustained',
  ONsus: 'ON Sustained',
  OFFtrans: 'OFF Transient',
  ONtrans: 'ON Transient',
  DS: 'Direction-Selective',
}

const FUNC_CLASS_LIST = Object.entries(FUNC_CLASS).map(([key, name]) => {
  return { key: key, name: name }
});


class TypesTable extends Component {
  constructor(props) {
    super(props);
    this.filter = this.filter.bind(this);
    this.unfilter = this.unfilter.bind(this);
    this.sort = this.sort.bind(this);
    this.columns = [
      {
        title: () => 'Cell Type',
        selector: 'cell_type_name_verbose',
        cell: row => <Link to={{ pathname: row.cell_type_name, state: { redir: null } }} onClick={this.props.onClick}>{row.cell_type_name_verbose}</Link>,
      },
      {
        title: () => 'EyeWire Type',
        selector: 'ew_type',
        cell: row => <Link to={{ pathname: row.cell_type_name, state: { redir: row.ew_url } }} onClick={this.props.onClick}>{row.ew_type}</Link>,
      },
      {
        title: (state) => <>
          <div>Functional Class</div>
          <DropdownButton
            title='filter'
            size='sm'
            className='filter-button'
            variant='secondary'
            onClick={(e) => { e.stopPropagation(); e.preventDefault(); }}
          >
            {FUNC_CLASS_LIST.map((fc, i) => {
              return (
                <Dropdown.Item as={ButtonGroup} key={fc.key}>
                  <Button variant='light' onClick={() => this.unfilter(i)}>{state.filtered[i] ? 'X' : ''}</Button>
                  <Button variant='light' onClick={() => this.filter(i)}>{fc.name}</Button>
                </Dropdown.Item>
              )
            })}
            <Dropdown.Divider />
            <Dropdown.Item onSelect={this.unfilter}>Clear Filters</Dropdown.Item>
          </DropdownButton>
        </>,
        selector: 'functional_class',
        cell: row => FUNC_CLASS[row.functional_class],
      },
      {
        title: () => '# Cells',
        selector: 'n_sms',
        cell: row => row.n_sms,
      },
    ];
    this.state = {
      filteredData: props.data,
      filtered: Array(8).fill(false),
      sorted: Array(4).fill(0),
      sortFn: undefined,
    };
  }

  render() {
    return (
      <>
        <Table bordered className='table-header' size='sm'>
          <thead>
            <tr>
              {this.columns.map((c, i) => {
                return (
                  <th key={c.selector}>
                    <div className='column-header'>
                      <SortIcon sort={this.state.sorted[i]} resort={() => this.sort(i)} />
                      {c.title(this.state)}
                    </div>
                  </th>
                )
              })}
            </tr>
          </thead>
        </Table>
        <Table bordered hover className='table-data' size='sm'>
          <tbody>
            {this.state.filteredData.map((d,i) => {
              return (
                <tr key={i} onMouseEnter={() => this.props.onHover(i)}>
                  {this.columns.map(c => {
                    return (
                      <td key={c.selector}>
                        {c.cell(d)}
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </Table>
      </>
    )
  }

  filter = (i) => {
    let filtered = [...this.state.filtered];
    filtered[i] = true;

    let func = FUNC_CLASS_LIST.filter((_, j) => filtered[j]);
    let data = [...this.props.data].filter(row => func.some((fc) => row.functional_class === fc.key)).sort(this.state.sortFn);

    this.setState({
      filteredData: data,
      filtered: filtered,
    });
  }

  unfilter = (i) => {
    let data;
    let filtered;
    if (i) {
      filtered = [...this.state.filtered];
      filtered[i] = false;

      if (filtered.some(j => j)) {
        let func = FUNC_CLASS_LIST.filter((_, j) => filtered[j]);
        data = [...this.props.data].filter(row => func.some((fc) => row.functional_class === fc.key)).sort(this.state.sortFn);
        this.setState({
          filteredData: data,
          filtered: filtered,
        });
        return;
      }
    } else {
      filtered = new Array(8).fill(false);
    }

    data = [...this.props.data].sort(this.state.sortFn);
    this.setState({
      filteredData: data,
      filtered: filtered,
    });
  }

  sort = (i) => {
    let data;
    let sorted = Array(4).fill(0);
    let currSort = (this.state.sorted[i] + 1) % 3;
    sorted[i] = currSort;

    if (currSort === 0) { //unsort the data
      let filtered = [...this.state.filtered];
      if (filtered.some(j => j)) {
        let func = FUNC_CLASS_LIST.filter((_, j) => filtered[j]);
        data = [...this.props.data].filter(row => func.some((fc) => row.functional_class === fc.key));
        this.setState({
          sorted: sorted,
          sortFn: undefined,
          filteredData: data,
        });
        return;
      } else {
        data = [...this.props.data];
        this.setState({
          sorted: sorted,
          sortFn: undefined,
          filteredData: data,
        })
        return;
      }
    }

    let currFn;
    if (currSort === 1) {
      currFn = (a, b) => a < b ? -1 : 1; //descending order
    } else {
      currFn = (a, b) => a > b ? -1 : 1; //ascending order
    }

    let selector = this.columns[i].selector;
    let sortFn;
    if (selector === 'n_sms') { //numeric sort
      sortFn = (a, b) => currFn(parseInt(a[selector]), parseInt(b[selector]));
    } else if (selector === 'ew_type') { //numeric sort followed by alphabetic sort...
      sortFn = (a, b) => {
        let as = a[selector];
        let bs = b[selector];
        let pas = parseInt(as);
        let pbs = parseInt(bs);
        if (pas === pbs) {
          return currFn(as.match(/([a-z]+)/), bs.match(/([a-z]+)/));
        } else {
          return currFn(pas, pbs);
        }
      }
    } else { //alphabetical sort
      sortFn = (a, b) => currFn(a[selector], b[selector]);
    }

    data = [...this.state.filteredData].sort(sortFn);

    this.setState({ sorted: sorted, sortFn: sortFn, filteredData: data });
  }
}

export default TypesTable;