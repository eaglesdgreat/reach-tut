const backend = require('./build/index.main.mjs');

const loadStdlib = require('@reach-sh/stdlib').loadStdlib;
// This connect the site to use https://wallet.myalgo.com wallet and use
// https://bank.testnet.algorand.network/ to get 10ALGO for testing app
const MyAlgoConnect = require('@reach-sh/stdlib').ALGO_MyAlgoConnect

const stdlib = loadStdlib('ALGO');

async function ExecuteGame() {
  stdlib.setWalletFallback(
    stdlib.walletFallback(
      {
        providerEnv: {
          ALGO_TOKEN: '',
          ALGO_SERVER: 'https://testnet-api.algonode.cloud',
          ALGO_PORT: '',
          ALGO_INDEXER_TOKEN: '',
          ALGO_INDEXER_SERVER: 'https://testnet-idx.algonode.cloud',
          ALGO_INDEXER_PORT: ''
        },
        MyAlgoConnect
      }
    )
  );

  // const startingBalance = stdlib.parseCurrency(100);
  // const accAlice = await stdlib.newTestAccount(startingBalance);
  // const accBob = await stdlib.newTestAccount(startingBalance);

  const accAlice = await stdlib.getDefaultAccount();
  const accBob = await stdlib.getDefaultAccount();

  const fmt = (x) => stdlib.formatCurrency(x, 4);
  const getBalance = async (who) => fmt(await stdlib.balanceOf(who));
  const beforeAlice = await getBalance(accAlice);
  const beforeBob = await getBalance(accBob);

  const ctcAlice = accAlice.contract(backend);
  const ctcBob = accBob.contract(backend, ctcAlice.getInfo());

  const HAND = ['Rock', 'Paper', 'Scissors'];
  const OUTCOME = ['Bob wins', 'Draw', 'Alice wins'];

  const Player = (who) => ({
    getHand: () => {
      const hand = Math.floor(Math.random() * 3);
      console.log(`${who} played ${HAND[hand]}.`);

      return hand;
    },
    seeOutCome: (outcome) => {
      console.log(`${who} saw ${OUTCOME[outcome]}`);
    } 
  })

  await Promise.all([
    ctcAlice.p.Alice({
      ...Player('Alice'),
      wager: stdlib.parseCurrency(5),
    }),
    ctcBob.p.Bob({
      ...Player('Bob'),
      acceptWager: (amt) => {
        console.log(`Bob accept the wager of ${fmt(amt)}`);
      },
    })
  ]);

  const afterAlice = await getBalance(accAlice);
  const afterBob = await getBalance(accBob);

  console.log(`Alice went from ${beforeAlice} to ${afterAlice}.`);
  console.log(`Bob went from ${beforeBob} to ${afterBob}.`);
}

module.exports.ExecuteGame = ExecuteGame;
