import React, { useEffect, useState } from 'react';
import twitterLogo from './assets/twitter-logo.svg';
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { Program, Anchorprovider, web3 } from '@project-serum/anchor';
import './App.css';

// Constants
const TWITTER_HANDLE = '_buildspace';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const TEST_GIFS = [
  'https://media.giphy.com/media/wJ8QGSXasDvPy/giphy.gif',
  'https://media.giphy.com/media/3ohzdI8r7iWMLCvTYk/giphy.gif',
  'https://media.giphy.com/media/UTek0q3N8osh8agH4Y/giphy.gif',
  'https://media.giphy.com/media/SJXzadwbexJEAZ9S1B/giphy.gif',
  'https://media.giphy.com/media/SgMZCcCv8Thm0/giphy.gif',
]

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
    const provider = new Anchorprovider(
      connection, window.solana, opts.preflightCommitment
    );
    return provider;
  }

  //render this UI when user hasn't connected their
  //wallet to our app
  const renderNotConnectedContainer = () => (
    <button
      className='cta-button connect-wallet-button'
      onClick={connectWallet}
    >
      connect to Wallet
    </button>
  )

  const renderConnectedContainer = () => (
    <div className='connected-container'>
      <form 
         onSubmit={(event) => {
          event.preventDefault()
          sendGif();
        }}
      >
        <input 
          type="text" 
          placeholder="Enter GIF link!"
          value={inputValue}
          onChange={onInputChange}
          />
        <button type="submit" className="cta-button submit-gif-button">Submit</button>
      </form>
      <div className='gif-grid'>
        {gifList.map(gif => (
          <div className='gif-item' key={gif}>
            <img src={gif} alt={gif} />
          </div>
        ))}
      </div>
    </div>
  )

  useEffect(() => {
    const onLoad = async () => {
      await checkIfWalletIsConnected();
    }
    window.addEventListener('load', onLoad);
    return () => window.removeEventListener('load', onLoad);
  }, [])

  useEffect(() => {
    if (walletAddress) {
      console.log('Fetching gif list...');

      //call Solana program here

      //set state
      setGifList(TEST_GIFS);

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
