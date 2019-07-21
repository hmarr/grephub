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

  const resultsByFile = results.
    reduce((grouped, r) => {
      if (!grouped[r.file]) {
        grouped[r.file] = [];
      }
      grouped[r.file].push(r);
      return grouped;
    }, {});

    //map(r => `${r.file}:${r.lineNumber} ${r.line}`).
    //join('\n');

  const resultLine = (result) => {
    return (
      <div>
        <style jsx>{`
        span {
          font-family: monospace;
        }
        span.lineNumber {
          text-align: right;
          width: 40px;
        }
        `}</style>
        <span class="lineNumber">{result.lineNumber}</span>
        <span>{result.line}</span>
      </div>
    )
  }

  const fileResults = (file) => {
    const results = resultsByFile[file];
    return (
      <div key={file}>
        <strong>{file}</strong>
        {results.map(resultLine)}
      </div>
    );
    //map(r => `${r.file}:${r.lineNumber} ${r.line}`).
    //join('\n');
  }

  return (
    <div>
      <h1>{account}/{repo}</h1>
      <SearchForm onSubmit={search} />
      {Object.keys(resultsByFile).map((file) => fileResults(file))}
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
