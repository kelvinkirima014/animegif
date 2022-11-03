import React, { useEffect, useState } from 'react';
import twitterLogo from './assets/twitter-logo.svg';
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import './App.css';
import {
  Program, AnchorProvider
} from '@project-serum/anchor';
import {web3} from '@project-serum/anchor';
import kp from './keypair.json'


// Constants
const TWITTER_HANDLE = '_buildspace';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

/*
const TEST_GIFS = [
  'https://media.giphy.com/media/wJ8QGSXasDvPy/giphy.gif',
  'https://media.giphy.com/media/3ohzdI8r7iWMLCvTYk/giphy.gif',
  'https://media.giphy.com/media/UTek0q3N8osh8agH4Y/giphy.gif',
  'https://media.giphy.com/media/SJXzadwbexJEAZ9S1B/giphy.gif',
  '',
]
*/

//reference to solana runtime
const { SystemProgram } = web3;

const arr = Object.values(kp._keypair.secretKey)
const secret = new Uint8Array(arr)
const baseAccount = web3.Keypair.fromSecretKey(secret)


const programID = new PublicKey("2amGSCnMV6RzJothNXnskJLcJoEykXNfgNssFbtwRkVL");

const network = clusterApiUrl('devnet');

const opts= {
  preflightCommitment: "processed"
}


const App = () => {

  const [ walletAddress, setWalletAddress ] = useState(null);
  const [ inputValue, setInputValue ] = useState('');
  const [ gifList, setGifList ] = useState([]);

  // check if phantom is connected or not
  const checkIfWalletIsConnected = async () => {
    if (window?.solana?.isPhantom) {
      console.log('Phantom wallet available');

      const response = await window.solana.connect({ onlyIfTrusted: true });
      console.log(
        'Connected with Public Key:',
        response.publicKey.toString()
      );

      //set user's public key to state in order to use later
      setWalletAddress(response.publicKey.toString());

    } else {
      console.log('Please connect a wallet');
    }
  }

  const connectWallet = async () => {

    const { solana } = window;
    if (solana) {
      const response = await solana.connect();
      console.log(' Connected with Public Key: ',
        response.publicKey.toString()
      );

      setWalletAddress(response.publicKey.toString());
    }

  }

  const sendGif = async() => {
    if (inputValue.length > 0) {
      console.log('Gif link: ', inputValue);
      setGifList([ ...gifList, inputValue ]);
      setInputValue('');
    } else {
      console.log('Empty input. Please try again');
    }
  }

  const onInputChange = (event) => {
    const { value } = event.target;
    setInputValue(value);
  }

  const getProvider = () => {
    const connection = new Connection(network, opts.preflightCommitment);
    const provider = new AnchorProvider(
      connection, window.solana, opts.preflightCommitment
    );
    return provider;
  }

  const getProgram = async() => {
    const idl = await Program.fetchIdl(programID, getProvider());
    return new Program(idl, programID, getProvider());
  }

  const createGifAccount = async() => {
    try {
      const provider = getProvider();
      const program = await getProgram();
      console.log("Ping");
      await program.methods.initialize({
        accounts: {
          baseAccount: baseAccount.publicKey,
          signer: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        },
        signers: [baseAccount]
      });

      console.log("Created a new BaseAccount w/address: ", baseAccount.publicKey.toString());
      await getGifList();
       
    } catch(error) {
      console.log("Error creating baseAccount: ", error);
    }
  }

  //render this UI when user hasn't connected their
  //wallet to our app
  const renderNotConnectedContainer = () => (
    <button
      className='cta-button connect-wallet-button'
      onClick={connectWallet}
    >
      Connect to Wallet
    </button>
  )
  const renderConnectedContainer = () => {
    // If we hit this, it means the program account hasn't been initialized.
      if (gifList === null) {
        return (
          <div className="connected-container">
            <button className="cta-button submit-gif-button" onClick={createGifAccount}>
              Do One-Time Initialization For GIF Program Account
            </button>
          </div>
        )
      } 
      // Otherwise, we're good! Account exists. User can submit GIFs.
      else {
        return(
          <div className="connected-container">
            <form
              onSubmit={(event) => {
                event.preventDefault();
                sendGif();
              }}
            >
              <input
                type="text"
                placeholder="Enter gif link!"
                value={inputValue}
                onChange={onInputChange}
              />
              <button type="submit" className="cta-button submit-gif-button">
                Submit
              </button>
            </form>
            <div className="gif-grid">
              {/* We use index as the key instead, also, the src is now item.gifLink */}
              {gifList.map((item, index) => (
                <div className="gif-item" key={index}>
                  <img src={item.gifLink} alt='gif img' />
                </div>
              ))}
            </div>
          </div>
        )
      }
    }
    
  useEffect(() => {
    const onLoad = async () => {
      await checkIfWalletIsConnected();
    }
    window.addEventListener('load', onLoad);
    return () => window.removeEventListener('load', onLoad);
  }, [])

  // const getProgram = async() => {
  //   const idl = await Program.fetchIdl(programID, getProvider());
  //   return new Program(idl, programID, getProvider());
  // };

  const getGifList = async() => {
    try{
      const program = await getProgram();
      const account = await program.account.baseAccount.fetch(baseAccount.publicKey);

      console.log("Got the account: ", account);

      setGifList(account.gifList);

    } catch(error){
        console.log("Error getting gif list: ", error);
        setGifList(null);
    }
  }

  useEffect(() => {
    if (walletAddress){
      console.log("Fetchin gif list...");
      getGifList();
    }
  }, [walletAddress]);



  return (
    <div className="App">

      <div className={walletAddress ? 'authed-container': 'container' }>

        <div className="header-container">
          <p className="header">🖼 Otaku Portal</p>
          <p className="sub-text">
            View your  Fav Anime GIF collection in the metaverse ✨
          </p>
          { !walletAddress && renderNotConnectedContainer() }
          { walletAddress && renderConnectedContainer() }
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built on @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
