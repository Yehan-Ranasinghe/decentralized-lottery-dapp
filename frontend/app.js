const contractAddress = '0x03fc314e1a083de2c17a5c2dc7d1c64ef5e65734';
const abi = [
  'function manager() view returns (address)',
  'function getPlayers() view returns (address[])',
  'function getBalance() view returns (uint)',
  'function enter() payable',
  'function pickWinner()',
  'function lastWinner() view returns (address)',
];

let provider, signer, contract, currentAccount;

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
    currentAccount = await signer.getAddress();

    await checkNetwork();
    document.getElementById('enter').disabled = false;
    await updateUI();
  } catch (error) {
    console.error('Error during init:', error);
    alert('Connection failed.');
  }
}

async function checkNetwork() {
  const network = await provider.getNetwork();
  const expectedChainId = 11155111; // Sepolia

  if (network.chainId !== expectedChainId) {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0xaa36a7' }],
      });
    } catch (err) {
      alert('Please switch to Sepolia network manually.');
      throw new Error('Wrong network');
    }
  }
}

async function updateUI() {
  try {
    const manager = await contract.manager();
    const players = await contract.getPlayers();
    const balance = await contract.getBalance();
    const winner = await contract.lastWinner();

    document.getElementById('manager').innerText = manager;
    document.getElementById('players-count').innerText = players.length;
    document.getElementById('balance').innerText =
      ethers.formatEther(balance) + ' ETH';
    document.getElementById('winner').innerText = winner;

    const playersList = document.getElementById('players-list');
    playersList.innerHTML = '';
    players.forEach((player, index) => {
      const li = document.createElement('li');
      li.innerText = `${index + 1}. ${player}`;
      playersList.appendChild(li);
    });

    if (currentAccount.toLowerCase() === manager.toLowerCase()) {
      document.getElementById('role-message').innerText =
        '🧑‍💼 You are the Manager!';
      document.getElementById('pick-container').style.display = 'block';
    } else {
      document.getElementById('role-message').innerText =
        '👤 You are a Player.';
      document.getElementById('pick-container').style.display = 'none';
    }
  } catch (error) {
    console.error('Error updating UI:', error);
  }
}

document.getElementById('connect').onclick = init;

document.getElementById('enter').onclick = async () => {
  if (!contract) return;

  try {
    const tx = await contract.enter({ value: ethers.parseEther('0.01') });
    await tx.wait();
    alert('🎟️ Successfully entered the lottery!');
    await updateUI();
  } catch (error) {
    console.error('Enter failed:', error);
    alert(
      '❌ Enter failed. Maybe you rejected the transaction or sent wrong amount.'
    );
  }
};

document.getElementById('pick').onclick = async () => {
  if (!contract) return;

  try {
    const manager = await contract.manager();
    if (currentAccount.toLowerCase() !== manager.toLowerCase()) {
      alert('❌ Only the manager can pick a winner.');
      return;
    }

    const tx = await contract.pickWinner();
    await tx.wait();
    alert('🏆 Winner picked!');
    await updateUI();
  } catch (error) {
    console.error('Pick winner failed:', error);
    alert(
      '❌ Error picking winner. Maybe already picked or insufficient players.'
    );
  }
};
