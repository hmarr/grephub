import { useState } from 'react';
import { useRouter } from 'next/router';
import fetch from 'isomorphic-unfetch';

const Search = () => {
  const router = useRouter();
  const { account, repo, query } = router.query;

  const [results, setResults] = useState([]);
  async function search(query) {
    const url = new URL(`${window.location.origin.toString()}/api/search`);
    url.searchParams.append('account', account);
    url.searchParams.append('repo', repo);
    url.searchParams.append('query', query);

    const rsp = await fetch(url);
    const json = await rsp.json();
    setResults(json.results);
  }

  const textResults = results.
    map(r => `${r.file}:${r.lineNumber} ${r.line}`).
    join('\n');

  return (
    <div>
      <h1>{account}/{repo}</h1>
      <SearchForm onSubmit={search} />
      <pre>{textResults}</pre>
    </div>
  )
};

class SearchForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = { query: '' }
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
        <label>
          Query:
          {' '}
          <input
            name="query"
            type="text"
            value={this.query}
            onChange={this.handleInputChange} />
        </label>
        {' '}
        <button type="submit">Search</button>
      </form>
    )
  }
}

//class RepoSearch extends React.Component {
//  render() {
//  }
//}

export default Search;
