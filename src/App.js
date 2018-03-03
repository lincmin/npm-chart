import React, { Component } from 'react'
import './App.css'

import { Layout, Form, Radio, Spin, Tag, Tooltip, message, Col } from 'antd'
import axios from 'axios'
import moment from 'moment'
import SuggestInput from './component/suggestInput'
import echarts from 'echarts'
import('echarts/lib/chart/line')
import('echarts/lib/component/tooltip')
import('echarts/lib/component/title')
import('echarts/lib/component/legend')
const { Header, Content, Footer } = Layout
const FormItem = Form.Item
let trendChart

class App extends Component {
  state = {
    loading: false,
    period: 'last-month',
    dateRange: 'oneMonth',
    tags: [],
    legendData: [],
    xAxisData: [],
    seriesList: []
  }
  componentDidMount() {
    trendChart = echarts.init(document.getElementById('trendChart'))
    trendChart.setOption({
      title: {
        show: false,
        text: '趋势图'
      },
      tooltip: {
        trigger: 'axis'
      },
      legend: {
        left: 'right'
      },
      grid: {
        top: '30%',
        left: '2%',
        right: '4%',
        bottom: '5%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        name: '日期',
        boundaryGap: true,
        axisLine: {
          show: true,
          lineStyle: {
            color: '#CCCCCC'
          }
        },
        axisTick: {
          show: false
        },
        axisLabel: {
          rotate: '20'
        },
        data: []
      },
      yAxis: {
        type: 'value',
        name: '下载量',
        axisTick: {
          show: false
        },
        axisLine: {
          show: true,
          lineStyle: {
            color: '#CCCCCC'
          }
        }
      },
      series: []
    })
  }
  handleRangeChange = e => {
    const dateFormat = 'YYYY-MM-DD'
    let dateRange = e.target.value
    let period
    console.log(e.target.value)
    switch (dateRange) {
      case 'oneMonth':
        period = 'last-month'
        break
      case 'threeMonth':
        period = `${moment()
          .subtract(3, 'months')
          .format(dateFormat)}:${moment().format(dateFormat)}`
        break
      case 'sixMonth':
        period = `${moment()
          .subtract(6, 'months')
          .format(dateFormat)}:${moment().format(dateFormat)}`
        break
      case 'oneYear':
        period = `${moment()
          .subtract(1, 'year')
          .format(dateFormat)}:${moment().format(dateFormat)}`
        break
    }

    this.setState({ period, dateRange }, () => {
      this.getTrendDataSync()
    })
  }
  getPackageName = value => {
    let tags = this.state.tags
    if (value) {
      if (tags.length > 0 && tags.indexOf(value) >= 0) return
      tags.push(value)
      this.getTrendDataSync()
    }
    console.log(value)
    this.setState({ packageName: value, tags })
  }
  async getTrendDataSync() {
    try {
      let { tags, period } = this.state
      let paramsObj = {}
      let promises = tags.map(tag => {
        paramsObj = {
          period,
          package: tag
        }
        return this.getTrendDataAsync(paramsObj)
      })
      // let results = await Promise.all(promises);
      // console.log('results', results);
      Promise.all(promises).then(values => {
        this.handleChartData(values)
      })
    } catch (err) {
      console.log(err)
    }
  }
  handleChartData = values => {
    let xAxisData = []
    let seriesList = []
    let legendData = []
    values.map((item, i) => {
      legendData.push(item.packageName)
      seriesList.push(item.seriesObj)
      xAxisData = item.dayList
    })
    this.setState({
      xAxisData,
      seriesList,
      legendData
    })
  }
  getTrendDataAsync = params => {
    const that = this
    that.setState({ loading: true })
    const baseURL = 'https://api.npmjs.org/downloads/range'
    const url = `${baseURL}/${params.period}/${params.package}`
    return new Promise(function(resolve, reject) {
      axios
        .get(url, {
          headers: { 'content-type': 'application/x-www-form-urlencoded' }
        })
        .then(function(response) {
          console.log(response)
          if (response.status == 200) {
            if (response.data) {
              resolve(that.handleTrendData(response.data))
            }
          }
          that.setState({ loading: false })
        })
        .catch(function(error) {
          message.error('出现异常，请稍候再试')
          reject(error)
          console.log(error)
          that.setState({ loading: false })
        })
    })
  }
  handleTrendData = data => {
    let dayList = []
    let downloadsList = []
    if (data.downloads.length > 0) {
      data.downloads.map((item, i) => {
        dayList.push(item.day)
        downloadsList.push(item.downloads)
      })
    }
    let seriesObj = {
      smooth: true,
      type: 'line',
      symbol: 'circle',
      symbolSize: '5',
      name: data.package,
      data: downloadsList
    }
    let packageObj = {
      dayList: dayList,
      seriesObj: seriesObj,
      packageName: data.package
    }
    return packageObj
  }
  handleTagClose = removedTag => {
    const tags = this.state.tags.filter(tag => tag !== removedTag)
    this.setState({ tags }, () => {
      this.getTrendDataSync()
    })
  }
  render() {
    const {
      dateRange,
      tags,
      legendData,
      xAxisData,
      seriesList,
      loading
    } = this.state
    if (trendChart) {
      let trendChartOption = trendChart.getOption()
      trendChartOption.legend[0].data = legendData
      trendChartOption.xAxis[0].data = xAxisData
      trendChartOption.series = seriesList
      trendChart.setOption(trendChartOption, true)
    }
    return (
      <Layout>
        <Header>
          <Col span={24} style={{ textAlign: 'center' }}>
            <span style={{ color: '#fff', fontSize: 22 }}>Npm Chart</span>
            <span style={{ color: '#fff', marginLeft: 20 }}>
              package download trend
            </span>
          </Col>
        </Header>
        <Spin spinning={loading} tip="加载中...">
          <Content style={{ padding: '20px' }}>
            <Form>
              {tags.length > 0 ? (
                <FormItem label="查询范围">
                  <Radio.Group
                    defaultValue={dateRange}
                    onChange={this.handleRangeChange.bind(this)}
                  >
                    <Radio.Button value="oneMonth">一个月</Radio.Button>
                    <Radio.Button value="threeMonth">三个月</Radio.Button>
                    <Radio.Button value="sixMonth">六个月</Radio.Button>
                    <Radio.Button value="oneYear">一年</Radio.Button>
                  </Radio.Group>
                </FormItem>
              ) : null}
              <FormItem label="名称">
                <SuggestInput packageName={this.getPackageName.bind(this)} />
              </FormItem>
            </Form>
            {tags.map((tag, index) => {
              const isLongTag = tag.length > 10
              const tagElem = (
                <Tag
                  color="#2db7f5"
                  key={tag}
                  closable
                  afterClose={() => this.handleTagClose(tag)}
                >
                  {isLongTag ? `${tag.slice(0, 10)}...` : tag}
                </Tag>
              )
              return isLongTag ? (
                <Tooltip title={tag} key={tag}>
                  {tagElem}
                </Tooltip>
              ) : (
                tagElem
              )
            })}
            <div style={{ background: '#fff', padding: 24, minHeight: 280 }}>
              <div id="trendChart" style={{ width: '100%', height: 280 }} />
            </div>
          </Content>
        </Spin>
        <Footer style={{ textAlign: 'center' }}>Created by lincmin</Footer>
      </Layout>
    )
  }
}
export default App
