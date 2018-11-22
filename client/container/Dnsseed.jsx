
import Actions from '../core/Actions';
import Component from '../core/Component';
import { connect } from 'react-redux';
import { dateFormat } from '../../lib/date';
import { Link } from 'react-router-dom';
import moment from 'moment';
import PropTypes from 'prop-types';
import React from 'react';
import sortBy from 'lodash/sortBy';

import HorizontalRule from '../component/HorizontalRule';
import Pagination from '../component/Pagination';
import Table from '../component/Table';
import Select from '../component/Select';

import { PAGINATION_PAGE_SIZE } from '../constants';

class Dnsseed extends Component {
  static propTypes = {
    getDnsseeds: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);
    this.debounce = null;
    this.state = {
      cols: [
        { key: 'ipAddress', title: 'Node Address' },
        { key: 'good', title: 'Node Status' },
        { key: 'blockHeight', title: 'Block Height' },
        { key: 'lastSuccess', title: 'Last Success' },
        { key: 'last_2_hours', title: 'Online 2 hours' },
        { key: 'last_8_hours', title: 'Online 8 hours' },
        { key: 'last_1_day', title: 'Online 1 day' },
        { key: 'last_7_days', title: 'Online 7 days' },
        { key: 'last_30_days', title: 'Online 30 days' },
        { key: 'protocoll_version', title: 'Protocol' },
        { key: 'version', title: 'Wallet Version' },
      ],
      error: null,
      loading: true,
      seeds: [] ,
      pages: 0,
      page: 1,
      size: 10
    };
  };

  componentDidMount() {
    this.getDnsseeds();
  };

  componentWillUnmount() {
    if (this.debounce) {
      clearTimeout(this.debounce);
      this.debounce = null;
    }
  };


  getDnsseeds = () => {
    this.setState({ loading: true }, () => {
      if (this.debounce) {
        clearTimeout(this.debounce);
      }

      this.debounce = setTimeout(() => {
        this.props
          .getDnsseeds({
            limit: this.state.size,
            skip: (this.state.page - 1) * this.state.size
          })
          .then(({ seeds, pages }) => {
            if (this.debounce) {
              this.setState({ seeds, pages, loading: false });
            }
          })
          .catch(error => this.setState({ error, loading: false }));
      }, 800);
    });
  };

  handlePage = page => this.setState({ page }, this.getDnsseeds);

  handleSize = size => this.setState({ size, page: 1 }, this.getDnsseeds);

  render() {
    if (!!this.state.error) {
      return this.renderError(this.state.error);
    } else if (this.state.loading) {
      return this.renderLoading();
    }
    const selectOptions = PAGINATION_PAGE_SIZE;

    const select = (
      <Select
        onChange={ value => this.handleSize(value) }
        selectedValue={ this.state.size }
        options={ selectOptions } />
    );


    return (
      <div>
        <HorizontalRule
          select={ select }
          title="Dnsseeds" />
        <Table
          cols={ this.state.cols }
          data={ sortBy(this.state.seeds.map((seed) => {
            //const lastPaidAt = moment(seed.lastPaidAt).utc();
            //const isEpoch = lastPaidAt.unix() === 0;

            return {
              ...seed,
              // ip: seed.ip + ": PORT",
              // status: seed.status
              //active: moment().subtract(seed.active, 'seconds').utc().fromNow(),
              // addr: (
              //   <Link to={ `/address/${ seed.addr }` }>
              //     { `${ seed.addr.substr(0, 20) }...` }
              //   </Link>
              // ),
              //lastPaidAt: isEpoch ? 'N/A' : dateFormat(seed.lastPaidAt),
              // txHash: (
              //   <Link to={ `/tx/${ seed.txHash }` }>
              //     { `${ seed.txHash.substr(0, 20) }...` }
              //   </Link>
              // )
            };
          }), ['status']) } />
        <Pagination
          current={ this.state.page }
          className="float-right"
          onPage={ this.handlePage }
          total={ this.state.pages } />
        <div className="clearfix" />
      </div>
    );
  };
}

const mapDispatch = dispatch => ({
  getDnsseeds: query => Actions.getDnsseeds(query)
});

export default connect(null, mapDispatch)(Dnsseed);
