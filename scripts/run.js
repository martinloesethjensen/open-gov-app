const { ApiPromise, WsProvider } = require("@polkadot/api");

async function main() {
  const wsProvider = new WsProvider('wss://kusama-rpc.dwellir.com');
  const api = await ApiPromise.create({ provider: wsProvider });

  console.log(`Connected to node: ${(await api.rpc.system.chain()).toHuman()} [ss58: ${api.registry.chainSS58}]`)

  /// KSM Precision [kusama guide](https://guide.kusama.network/docs/kusama-parameters/#precision)
  const ksmPrecision = 1_000_000_000_000;

  const address = 'DCZyhphXsRLcW84G9WmWEXtAA8DKGtVGSFZLJYty8Ajjyfa';

  let tracks = api.consts.referenda.tracks;

  const tracksInfo = tracks.map((trackInfo) => {
    let id = trackInfo[0];
    let name = trackInfo[1].name;

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
}

main()
  .catch(console.error)
  .finally(() => process.exit())
