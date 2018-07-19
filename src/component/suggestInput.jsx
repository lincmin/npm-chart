import React, { Component } from 'react'
import { Icon, Input, AutoComplete, Spin } from 'antd'
import axios from 'axios'

const Option = AutoComplete.Option

class SuggestInput extends Component {
  constructor(props) {
    super(props)
    this.state = {
      loading: false,
      dataSource: []
    }
  }

  handleSearch = value => {
    if (!value) {
      this.props.packageName(value)
    }
    this.setState({ loading: true })
    this.getNpmSuggest(value)
  }
  onSelect = value => {
    this.props.packageName(value)
  }
  getNpmSuggest = param => {
    const that = this
    const url =
      `https://api.npms.io/v2/search/suggestions?q=${param}`
    axios
      .get(url, {
        headers: { 'content-type': 'application/x-www-form-urlencoded' }
      })
      .then(function (response) {
        console.log(response)
        let optionsData = []
        if (response.status === 200) {
          if (response.data && response.data.length > 0) {
            optionsData = response.data
          }
        }
        that.generateOptions(optionsData)
        that.setState({ loading: false })
      })
      .catch(function (error) {
        console.log(error)
        that.setState({ loading: false })
      })
  }
  generateOptions = data => {
    const options = data.map(group => (
      <Option key={group.package.name} value={group.package.name}>
        {group.package.name}
        <br />
        <span className="">{group.package.description}</span>
      </Option>
    ))
    this.setState({ dataSource: options })
  }
  render() {
    const { dataSource } = this.state
    return (
      <Spin spinning={this.state.loading} tip="loading...">
        <AutoComplete
          dropdownMatchSelectWidth={true}
          size="large"
          style={{ width: '100%' }}
          onSelect={this.onSelect.bind(this)}
          onSearch={this.handleSearch.bind(this)}
          dataSource={dataSource}
          placeholder="Please enter the name of the package"
          optionLabelProp="value"
        >
          <Input
            suffix={<Icon type="search" className="certain-category-icon" />}
          />
        </AutoComplete>
      </Spin>
    )
  }
}

export default SuggestInput
