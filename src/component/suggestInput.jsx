import React, { Component } from 'react';
import { Icon, Input, AutoComplete, Spin } from 'antd';
import axios from 'axios';

const Option = AutoComplete.Option;

class SuggestInput extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            dataSource: [],
        }
    }

    handleSearch = (value) => {
        if (!value) {
            this.props.packageName(value);
        }
        this.setState({ loading: true });
        //{"autocomplete_suggest":{"text":"vue","completion":{"field":"suggest"}}}:
        let params = {
            autocomplete_suggest: {
                text: value,
                completion: {
                    field: 'suggest',
                }
            }
        };
        this.getNpmSuggest(params);
    }
    onSelect = (value) => {
        this.props.packageName(value);
    }
    getNpmSuggest = (params) => {
        const that = this;
        const url = "http://search-npm-registry-4654ri5rsc4mybfyhytyfu225m.us-east-1.es.amazonaws.com/npm/_suggest";
        axios.post(
            url,
            params,
            {
                headers: { 'content-type': 'application/x-www-form-urlencoded' },
            }
        ).then(function (response) {
            console.log(response);
            let optionsData = [];
            if (response.status == 200) {
                if (response.data && response.data.autocomplete_suggest) {
                    optionsData = response.data.autocomplete_suggest[0].options;
                }
            }
            that.generateOptions(optionsData);
            that.setState({ loading: false });

        }).catch(function (error) {
            console.log(error);
            that.setState({ loading: false });
        });
    }
    generateOptions = (data) => {
        const options = data.map(group => (
            <Option key={group.text} value={group.text}>
                {group.text}
                <br />
                <span className="">{group.payload.description}</span>
            </Option>
        ))
        this.setState({ dataSource: options });
    }
    render() {
        const { dataSource } = this.state;
        return (
            <Spin spinning={this.state.loading} tip="加载中...">
                <AutoComplete
                    dropdownMatchSelectWidth={true}
                    size="large"
                    style={{ width: '100%' }}
                    onSelect={this.onSelect.bind(this)}
                    onSearch={this.handleSearch.bind(this)}
                    dataSource={dataSource}
                    placeholder="请输入npm包名称"
                    optionLabelProp="value"
                >
                    <Input suffix={<Icon type="search" className="certain-category-icon" />} />
                </AutoComplete>
            </Spin>
        );
    }
}

export default SuggestInput;