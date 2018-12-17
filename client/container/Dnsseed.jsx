
import Actions from '../core/Actions';
import Component from '../core/Component';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import React from 'react';
import sortBy from 'lodash/sortBy';
import numeral from 'numeral';
import { Chart } from "react-google-charts";

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
        { key: 'ip', title: 'Node Address' },
        { key: 'status', title: 'Node Status' },
        { key: 'blockheight', title: 'Block Height' },
        { key: 'lastScanned', title: 'Last Success' },
        { key: 'last_2_hours', title: 'Online 2 hours' },
        { key: 'last_8_hours', title: 'Online 8 hours' },
        { key: 'last_1_day', title: 'Online 1 day' },
        { key: 'last_7_days', title: 'Online 7 days' },
        { key: 'last_30_days', title: 'Online 30 days' },
        { key: 'protocol_version', title: 'Protocol' },
        { key: 'wallet_version', title: 'Wallet Version' },
      ],
      error: null,
      loading: true,
      seeds: [],
      stats: [],
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
          .then(({ seeds,stats, pages }) => {
            if (this.debounce) {
              this.setState({ seeds, pages, stats, loading: false });
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
        onChange={value => this.handleSize(value)}
        selectedValue={this.state.size}
        options={selectOptions} />
    );

    let data  = this.state.stats.map(     
      obj =>{ 
        return [obj._id,obj.count];
      });
    data.unshift(["Country", "Popularity"])


    return (
      <div>
        <HorizontalRule
          select={select}
          title="Dnsseeds" />
        <Chart
          chartEvents={[
            {
              eventName: "select",
              callback: ({ chartWrapper }) => {
                const chart = chartWrapper.getChart();
                const selection = chart.getSelection();
                if (selection.length === 0) return;
                const region = data[selection[0].row + 1];
              }
            }
          ]}
          chartType="GeoChart"
          width="100%"
          height="400px"
          data={data}
          options={{
            //region: '002', // Africa
            colorAxis: { colors: ['#fff60a', '#ffb109', '#ff630a'] },
            //backgroundColor: '#81d4fa',
            datalessRegionColor: '#e1e7f2',
            defaultColor: '#f5f5f5'
          }}
        />

        <center><a href="/ext/downloadseeds">Download Current Seeds</a></center>

        <Table
          cols={this.state.cols}
          data={sortBy(this.state.seeds.map((seed) => {
            return {
              ...seed,
              ip: (
                <div>
                  <img
                    className="flag"
                    src={`/img/flag/${seed.countryCode ? seed.countryCode.toLowerCase() : 'xx'}.gif`}
                    title={seed.country} /> {seed.ip}:{seed.port}
                </div>
              ),
              status: (seed.status === 1) ? "OK" : "NOK",
              last_2_hours: numeral(seed.last_2_hours).format('0,0.00')+" %",
              last_8_hours: numeral(seed.last_8_hours).format('0,0.00')+" %",
              last_1_day: numeral(seed.last_1_day).format('0,0.00')+" %",
              last_7_days: numeral(seed.last_7_days).format('0,0.00')+" %",
              last_30_days: numeral(seed.last_30_days).format('0,0.00')+" %"
            };
          }), ['status'])} />
        <Pagination
          current={this.state.page}
          className="float-right"
          onPage={this.handlePage}
          total={this.state.pages} />
        <div className="clearfix" />
      </div>
    );
  };
}

const mapDispatch = dispatch => ({
  getDnsseeds: query => Actions.getDnsseeds(query)
});

export default connect(null, mapDispatch)(Dnsseed);
