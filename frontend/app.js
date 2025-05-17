const contractAddress = '0x03fc314e1a083de2c17a5c2dc7d1c64ef5e65734';
const abi = [
  'function manager() view returns (address)',
  'function getPlayers() view returns (address[])',
  'function getBalance() view returns (uint)',
  'function enter() payable',
  'function pickWinner()',
  'function lastWinner() view returns (address)',
];

let provider, signer, contract;

async function init() {
  if (typeof window.ethereum === 'undefined') {
    alert('Please install MetaMask to use this app.');
    return;
  }

  try {
    provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send('eth_requestAccounts', []);
    signer = await provider.getSigner();
    contract = new ethers.Contract(contractAddress, abi, signer);

    await checkNetwork();
    await updateUI();
  } catch (error) {
    console.error('Error during init:', error);
    alert('Connection failed. See console for details.');
  }
}

async function checkNetwork() {
  const network = await provider.getNetwork();
  const expectedChainId = 5; // Goerli testnet

  if (network.chainId !== expectedChainId) {
    alert(
      `Please switch MetaMask to the Goerli testnet (chainId: ${expectedChainId}). Currently connected to chainId: ${network.chainId}.`
    );
    throw new Error('Wrong network');
  }
}

async function updateUI() {
  if (!contract) {
    console.warn('Contract is not initialized');
    return;
  }

  try {
    const manager = await contract.manager();
    const players = await contract.getPlayers();
    const balance = await contract.getBalance();
    const winner = await contract.lastWinner();

    console.log('Manager:', manager);
    console.log('Players:', players);
    console.log('Balance (wei):', balance.toString());
    console.log('Winner:', winner);

    document.getElementById('manager').innerText = manager;
    document.getElementById('players').innerText = players.length;
    document.getElementById('balance').innerText =
      ethers.formatEther(balance) + ' ETH';
    document.getElementById('winner').innerText = winner;
  } catch (error) {
    console.error('Error updating UI:', error);
    alert('Failed to load contract data. Check console for details.');
  }
}

document.getElementById('connect').onclick = init;

document.getElementById('enter').onclick = async () => {
  if (!contract) {
    alert('Please connect your wallet first.');
    return;
  }

  try {
    const tx = await contract.enter({ value: ethers.parseEther('0.01') });
    await tx.wait();
    alert('🎟️ Ticket purchased!');
    await updateUI();
  } catch (error) {
    console.error('Enter failed:', error);
    alert('❌ Failed to enter. Check your wallet and try again.');
  }
};

document.getElementById('pick').onclick = async () => {
  if (!contract) {
    alert('Please connect your wallet first.');
    return;
  }

  try {
    const tx = await contract.pickWinner();
    await tx.wait();
    alert('🏆 Winner picked!');
    await updateUI();
  } catch (error) {
    console.error('Pick winner failed:', error);
    alert('❌ Only the manager can pick a winner.');
  }
};
