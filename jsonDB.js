import fs from 'fs';
const DATA_FILE = './data.json';

// Load JSON
export function loadData() {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ users: {} }, null, 2));
  }
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}

// Save JSON
export function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// Add / Update user
export function updateUser(userId, joined=false, lastMedia="") {
  const data = loadData();
  data.users[userId] = { joined, lastMedia };
  saveData(data);
}

// Get user
export function getUser(userId) {
  const data = loadData();
  return data.users[userId] || null;
}
