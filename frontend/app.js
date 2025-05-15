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

    updateUI();
  } catch (error) {
    console.error('Error during init:', error);
    alert('Connection failed.');
  }
}

async function updateUI() {
  try {
    const manager = await contract.manager();
    const players = await contract.getPlayers();
    const balance = await contract.getBalance();
    const winner = await contract.lastWinner();

    document.getElementById('manager').innerText = manager;
    document.getElementById('players').innerText = players.length;
    document.getElementById('balance').innerText =
      ethers.formatEther(balance) + ' ETH';
    document.getElementById('winner').innerText = winner;

    const userAddress = await signer.getAddress();
    document.getElementById('pick').style.display =
      userAddress.toLowerCase() === manager.toLowerCase() ? 'block' : 'none';
  } catch (error) {
    console.error('Error updating UI:', error);
  }
}

document.getElementById('connect').onclick = init;

document.getElementById('enter').onclick = async () => {
  try {
    const tx = await contract.enter({ value: ethers.parseEther('0.01') });
    await tx.wait();
    alert('🎟️ Ticket purchased!');
    updateUI();
  } catch (error) {
    console.error('Enter failed:', error);
    alert('❌ Failed to enter. Check your wallet.');
  }
};

document.getElementById('pick').onclick = async () => {
  try {
    const tx = await contract.pickWinner();
    await tx.wait();
    alert('🏆 Winner picked!');
    updateUI();
  } catch (error) {
    console.error('Pick winner failed:', error);
    alert('❌ Only the manager can pick a winner.');
  }
};
