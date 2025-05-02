const contractAddress = 'YOUR_CONTRACT_ADDRESS_HERE';
const abi = [
  // Only needed functions
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

  provider = new ethers.BrowserProvider(window.ethereum);
  await provider.send('eth_requestAccounts', []);
  signer = await provider.getSigner();
  contract = new ethers.Contract(contractAddress, abi, signer);

  updateUI();
}

async function updateUI() {
  const manager = await contract.manager();
  const players = await contract.getPlayers();
  const balance = await contract.getBalance();
  const winner = await contract.lastWinner();

  document.getElementById('manager').innerText = manager;
  document.getElementById('players').innerText = players.length;
  document.getElementById('balance').innerText =
    ethers.formatEther(balance) + ' ETH';
  document.getElementById('winner').innerText = winner;
}

document.getElementById('connect').onclick = init;

document.getElementById('enter').onclick = async () => {
  const tx = await contract.enter({ value: ethers.parseEther('0.01') });
  await tx.wait();
  alert('Ticket purchased!');
  updateUI();
};

document.getElementById('pick').onclick = async () => {
  const tx = await contract.pickWinner();
  await tx.wait();
  alert('Winner picked!');
  updateUI();
};
