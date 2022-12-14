import { useState, useEffect } from 'react';
import { ApiPromise, WsProvider } from '@polkadot/api';
import logo from './logo.svg';
import './App.css';

function App() {
  const [{ id, name, votes, capital }, setOpenGovVotersInfo] = useState({});

  const defaultAddress = 'DCZyhphXsRLcW84G9WmWEXtAA8DKGtVGSFZLJYty8Ajjyfa';
  
  async function getVotes(address) {
    const wsProvider = new WsProvider('wss://kusama-rpc.dwellir.com');
    const api = await ApiPromise.create({ provider: wsProvider });

    console.log(`Connected to node: ${(await api.rpc.system.chain()).toHuman()} [ss58: ${api.registry.chainSS58}]`)

    /// KSM Precision [kusama guide](https://guide.kusama.network/docs/kusama-parameters/#precision)
    const ksmPrecision = 1_000_000_000_000;

    let tracks = api.consts.referenda.tracks;

    const tracksInfo = tracks.map((trackInfo) => {
      let id = trackInfo[0].toNumber();
      let name = trackInfo[1].name.toHuman();

      return { id, name };
    });

    const votesPromises = tracksInfo.map(async ({ id, name }) => {
      let result = await api.query.convictionVoting.votingFor(address, id);

      let delegations = JSON.parse(result).casting.delegations;
      let votes = delegations.votes / ksmPrecision;
      let capital = delegations.capital / ksmPrecision;

      console.log(`=======================`);
      console.log(`| Track ID: \t${id}`);
      console.log(`| Track Name: \t${name}\n|`);
      console.log(`| Votes: \t${votes}`);
      console.log(`| Capital: \t${capital}`);
      console.log(`=======================\n`);

      return { id, name, votes, capital };
    });

    // TODO: display results
    const results = await Promise.all(votesPromises);

    console.log(results);

    setOpenGovVotersInfo(results);
  }



  useEffect(() => {
    if (!id && !name && !votes && !capital) {
      getVotes(defaultAddress);
    }
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload. {name}
        </p>
        <p>You clicked {name} times</p>
        <button onClick={() => getVotes(defaultAddress)}>
          Click me
        </button>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
