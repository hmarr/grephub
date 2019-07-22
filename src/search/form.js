import React from "react";
import { Button, Flex, TextInput } from "@primer/components";
import styled from "styled-components";

const SearchBox = styled(TextInput)`
  flex: 1;
`;

class Form extends React.Component {
  constructor(props) {
    super(props);

    this.state = { query: "" };
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleInputChange(event) {
    const target = event.target;
    this.setState({ [target.name]: target.value });
  }

  handleSubmit(event) {
    this.props.onSubmit(this.state.query);
    event.preventDefault();
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <Flex>
          <SearchBox
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
      </form>
    );
  }
}

export default Form;
