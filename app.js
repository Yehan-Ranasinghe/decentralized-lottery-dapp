const contractAddress = '0x8d75d042db4cd44f6a547c010757ab87e60b2954';

const abi = [
  {
    inputs: [],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    inputs: [{ internalType: 'uint256', name: '_price', type: 'uint256' }],
    name: 'setTicketPrice',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'enter',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getBalance',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getPlayers',
    outputs: [{ internalType: 'address[]', name: '', type: 'address[]' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'manager',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'pickWinner',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'lastWinner',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'ticketPrice',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
];

let provider, signer, lottery;

const connectBtn = document.getElementById('connect');
const enterBtn = document.getElementById('enter');
const pickBtn = document.getElementById('pick');
const pickContainer = document.getElementById('pick-container');
const updatePriceBtn = document.getElementById('update-price-btn');
const priceUpdateContainer = document.getElementById('price-update-container');
const ticketPriceDisplay = document.getElementById('ticket-price'); // New element

async function updateUI(
  manager,
  players,
  balance,
  winner,
  currentUser,
  ticketPrice
) {
  // Hide manager address from UI for privacy
  document.getElementById('manager').innerText = '🔒 Hidden';
  document.getElementById('players-count').innerText = players.length;
  document.getElementById('balance').innerText = `${ethers.formatEther(
    balance
  )} ETH`;
  document.getElementById('winner').innerText =
    winner === ethers.ZeroAddress ? 'N/A' : winner;
  ticketPriceDisplay.innerText = `${ethers.formatEther(ticketPrice)} ETH`; // Show ticket price

  const list = document.getElementById('players-list');
  list.innerHTML = '';
  players.forEach((p) => {
    const li = document.createElement('li');
    li.textContent = p;
    list.appendChild(li);
  });

  const isManager = currentUser.toLowerCase() === manager.toLowerCase();
  document.getElementById('role-message').innerText = isManager
    ? '👑 You are the manager'
    : '🙋 You are a participant';

  pickContainer.style.display = isManager ? 'block' : 'none';
  priceUpdateContainer.style.display = isManager ? 'block' : 'none';
  enterBtn.disabled = false;
}

async function refreshData() {
  const currentUser = await signer.getAddress();
  const [manager, players, balance, winner, ticketPrice] = await Promise.all([
    lottery.manager(),
    lottery.getPlayers(),
    lottery.getBalance(),
    lottery.lastWinner(),
    lottery.ticketPrice(),
  ]);
  await updateUI(manager, players, balance, winner, currentUser, ticketPrice);
}

async function loadContract() {
  provider = new ethers.BrowserProvider(window.ethereum);
  signer = await provider.getSigner();
  lottery = new ethers.Contract(contractAddress, abi, signer);

  await refreshData();

  // Set up Enter button
  enterBtn.onclick = async () => {
    enterBtn.disabled = true;
    try {
      const ticketPrice = await lottery.ticketPrice();
      const tx = await lottery.enter({ value: ticketPrice });
      await tx.wait();
      alert('🎟️ Successfully entered the lottery!');
      await refreshData();
    } catch (err) {
      alert(`❌ Failed to enter: ${err.reason || err.message}`);
    } finally {
      enterBtn.disabled = false;
    }
  };

  // Set up Pick Winner button
  pickBtn.onclick = async () => {
    pickBtn.disabled = true;
    try {
      const tx = await lottery.pickWinner();
      await tx.wait();
      alert('🏆 Winner picked!');
      await refreshData();
    } catch (err) {
      alert(`❌ Failed to pick winner: ${err.reason || err.message}`);
    } finally {
      pickBtn.disabled = false;
    }
  };

  // Set up Update Ticket Price button
  updatePriceBtn.onclick = async () => {
    updatePriceBtn.disabled = true;
    try {
      const newPriceEth = document.getElementById('new-ticket-price').value;
      if (!newPriceEth || isNaN(newPriceEth) || Number(newPriceEth) <= 0) {
        alert('❗ Please enter a valid ticket price in ETH.');
        updatePriceBtn.disabled = false;
        return;
      }

      const newPriceWei = ethers.parseEther(newPriceEth);
      const tx = await lottery.setTicketPrice(newPriceWei);
      await tx.wait();
      alert(`✅ Ticket price updated to ${newPriceEth} ETH!`);
      await refreshData();
    } catch (err) {
      alert(`❌ Failed to update price: ${err.reason || err.message}`);
    } finally {
      updatePriceBtn.disabled = false;
    }
  };
}

connectBtn.onclick = async () => {
  if (!window.ethereum) {
    alert('⚠️ Please install MetaMask to use this DApp.');
    return;
  }

  try {
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    await loadContract();
    connectBtn.innerText = '✅ Connected';
    connectBtn.disabled = true;
  } catch (err) {
    alert(`Connection Error: ${err.reason || err.message}`);
  }
};
