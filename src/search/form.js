import React from "react";
import { Button, Flex, TextInput } from "@primer/components";
import styled from "styled-components";

const SearchBox = styled(TextInput)`
  flex: 1;
`;

const SearchOption = styled.label`
  display: inline-block;
  font-size: 13px;
  margin-right: 15px;
  margin-top: 15px;
`;

class Form extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      query: props.initialQuery ?? "",
      regex: true,
      caseSensitive: false,
    };
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleInputChange(event) {
    const target = event.target;
    let value = target.value;
    if (target.type === "checkbox") {
      value = target.checked;
    }
    this.setState({ [target.name]: value });
  }

  handleSubmit(event) {
    this.props.onSubmit(this.state);
    event.preventDefault();
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <Flex>
          <SearchBox
            autocomplete="false"
            name="query"
            flex={1}
            size="large"
            placeholder={this.props.placeholder}
            value={this.state.query}
            onChange={this.handleInputChange}
          />
          <Button disabled={!this.props.active} type="submit" ml={2}>
            Search
          </Button>
        </Flex>
        <SearchOption>
          <input
            name="regex"
            type="checkbox"
            checked={this.state.regex}
            onChange={this.handleInputChange}
          />{" "}
          Regex (RE2 syntax)
        </SearchOption>
        <SearchOption>
          <input
            name="caseSensitive"
            type="checkbox"
            checked={this.state.caseSensitive}
            onChange={this.handleInputChange}
          />{" "}
          Case sensitive
        </SearchOption>
      </form>
    );
  }
}

export default Form;
