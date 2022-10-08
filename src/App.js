import React, { useEffect, useState } from 'react';
import twitterLogo from './assets/twitter-logo.svg';
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

  useEffect(() => {
    const onLoad = async () => {
      await checkIfWalletIsConnected();
    }
    window.addEventListener('load', onLoad);
    return () => window.removeEventListener('load', onLoad);
  }, [])

  return (
    <div className="App">

      <div className={walletAddress ? 'authed-container': 'container' }>

        <div className="header-container">
          <p className="header">🖼 GIF Portal</p>
          <p className="sub-text">
            View your GIF collection in the metaverse ✨
          </p>
          { !walletAddress && renderNotConnectedContainer()}
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
