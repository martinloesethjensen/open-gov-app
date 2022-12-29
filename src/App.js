import { useState, useEffect } from 'react';
import { ApiPromise, WsProvider } from '@polkadot/api';
import './App.css';

function App() {
  const [openGoveVotersInfo, setOpenGovVotersInfo] = useState([]);
  const defaultAddress = 'DCZyhphXsRLcW84G9WmWEXtAA8DKGtVGSFZLJYty8Ajjyfa';
  const [inputAddress, setInputAddress] = useState(defaultAddress);

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

    const results = await Promise.all(votesPromises);

    console.log(results);

    setOpenGovVotersInfo(results);
  }



  useEffect(() => {
    if (!openGoveVotersInfo) {
      getVotes(defaultAddress);
    }
  }, [openGoveVotersInfo]);

  const listItems = openGoveVotersInfo.map(voteInfo => {
    return <div key={voteInfo.id}>
      ------------------------
      <div>
        Track id: {voteInfo.id}
      </div>
      <div>
        Track name: {voteInfo.name}
      </div>
      <div>
        Track votes: {voteInfo.votes}
      </div>
      <div>
        Track capital: {voteInfo.capital} KSM
      </div>
      ------------------------
    </div>;
  });

  return (
    <div className="App">
      <header className="App-header">
        <div>
          A tool to get an insight into how many delegated votes and capital (in KSM) you have for each OpenGov track.
        </div>
        <div>
          <input
            value={inputAddress}
            onChange={(e) => setInputAddress(e.target.value)} />
          <button onClick={() => getVotes(inputAddress)}>
            Fetch results
          </button>
        </div>
        <div>{listItems}</div>
      </header>
    </div>
  );
}

export default App;
