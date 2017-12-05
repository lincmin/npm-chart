import React, { Component } from 'react';
import './App.css';

import { Layout, Input, Form, Radio } from 'antd';
import axios from 'axios';
import SuggestInput from './component/suggestInput';
const { Header, Content, Footer } = Layout;
const FormItem = Form.Item;

function onSelect(value) {
  console.log('onSelect', value);
}
class App extends Component {
  state = {
    dataSource: [],
  };
  toggle = () => {
    this.setState({
      collapsed: !this.state.collapsed,
    });
  }
  handleRangeChange = () => {

  }
  getPackageName = (value) => {
    console.log(value);
  }

  render() {
    const { dataSource } = this.state;
    const { getFieldDecorator } = this.props.form;
    return (
      <Layout>
        <Header></Header>
        <Content style={{ padding: '20px' }}>
          <Form>
            <FormItem
              label="查询范围"
            >
              {getFieldDecorator('dateRange', { initialValue: 'oneMonth' })(
                <Radio.Group onChange={this.handleRangeChange}>
                  <Radio.Button value="oneMonth">一个月</Radio.Button>
                  <Radio.Button value="twoMonth">三个月</Radio.Button>
                  <Radio.Button value="sixMonth">六个月</Radio.Button>
                  <Radio.Button value="oneYear">一年</Radio.Button>
                  <Radio.Button value="twoYear">二年</Radio.Button>
                </Radio.Group>
              )}
            </FormItem>
            <FormItem
              label="包名"
            >
              <SuggestInput packageName={this.getPackageName.bind(this)} />
            </FormItem>
          </Form>
          <div style={{ background: '#fff', padding: 24, minHeight: 280 }}>Content</div>
        </Content>
        <Footer style={{ textAlign: 'center' }}>
          footer
      </Footer>
      </Layout>
    );
  }
}
const AppForm = Form.create()(App);
export default AppForm;
