import React, { Component } from 'react';
import './App.css';

import { Layout, Input, Form, Radio, Spin } from 'antd';
import axios from 'axios';
import moment from 'moment';
import SuggestInput from './component/suggestInput';
const { Header, Content, Footer } = Layout;
const FormItem = Form.Item;

function onSelect(value) {
  console.log('onSelect', value);
}
class App extends Component {
  state = {
    loading: false,
    period: 'last-month',
    packageName: '',
  };
  toggle = () => {
    this.setState({
      collapsed: !this.state.collapsed,
    });
  }
  handleRangeChange = (e) => {
    const dateFormat = 'YYYY-MM-DD';
    let value = e.target.value;
    let period;
    console.log(e.target.value);
    switch (value) {
      case 'oneMonth':
        period = 'last-month';
        break;
      case 'threeMonth':
        period = `${moment().subtract(3, 'months').format(dateFormat)}:${moment().format(dateFormat)}`;
        break;
      case 'sixMonth':
        period = `${moment().subtract(6, 'months').format(dateFormat)}:${moment().format(dateFormat)}`;
        break;
      case 'oneYear':
        period = `${moment().subtract(1, 'year').format(dateFormat)}:${moment().format(dateFormat)}`;
        break;
    }
    this.setState({ period: period });
    let packageName = this.state.packageName;
    let params = {
      period: period,
      package: packageName,
    }
    this.getTrendData(params);
  }
  getPackageName = (value) => {
    if (value) {
      let period = this.state.period;
      let params = {
        period: period,
        package: value,
      }
      this.getTrendData(params);
    }
    console.log(value);
    this.setState({ packageName: value });
  }
  getTrendData = (params) => {
    const that = this;
    that.setState({ loading: true });
    const baseURL = "https://api.npmjs.org/downloads/range";
    const url = `${baseURL}/${params.period}/${params.package}`;
    axios.get(
      url,
      {
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
      }
    ).then(function (response) {
      console.log(response);
      let downloadsData = [];
      if (response.status == 200) {
        if (response.data && response.data.downloads) {
          downloadsData = response.data.downloads;
        }
      }
      that.setState({ loading: false });

    }).catch(function (error) {
      console.log(error);
      that.setState({ loading: false });
    });
  }
  render() {
    const { packageName } = this.state;
    const { getFieldDecorator } = this.props.form;
    return (
      <Layout>
        <Header></Header>
        <Spin spinning={this.state.loading} tip="加载中...">
          <Content style={{ padding: '20px' }}>
            <Form>
              {
                packageName ? (
                  <FormItem
                    label="查询范围"
                  >
                    {getFieldDecorator('dateRange', { initialValue: 'oneMonth' })(
                      <Radio.Group onChange={this.handleRangeChange.bind(this)}>
                        <Radio.Button value="oneMonth">一个月</Radio.Button>
                        <Radio.Button value="threeMonth">三个月</Radio.Button>
                        <Radio.Button value="sixMonth">六个月</Radio.Button>
                        <Radio.Button value="oneYear">一年</Radio.Button>
                      </Radio.Group>
                    )}
                  </FormItem>) : (null)
              }
              <FormItem
                label="包名"
              >
                <SuggestInput packageName={this.getPackageName.bind(this)} />
              </FormItem>
            </Form>
            <div style={{ background: '#fff', padding: 24, minHeight: 280 }}>Content</div>
          </Content>
        </Spin>
        <Footer style={{ textAlign: 'center' }}>
          footer
      </Footer>
      </Layout>
    );
  }
}
const AppForm = Form.create()(App);
export default AppForm;
