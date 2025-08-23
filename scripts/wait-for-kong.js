const http = require('http');

const KONG_ADMIN_URL = 'http://localhost:8002';
const MAX_RETRIES = 30;
const RETRY_INTERVAL = 2000; // 2 seconds

function checkKongHealth() {
  return new Promise((resolve, reject) => {
    const req = http.get(KONG_ADMIN_URL, (res) => {
      if (res.statusCode === 200) {
        resolve(true);
      } else {
        reject(new Error(`Kong returned status code: ${res.statusCode}`));
      }
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

async function waitForKong() {
  console.log('Waiting for Kong Gateway to be ready...');
  
  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      await checkKongHealth();
      console.log('✅ Kong Gateway is ready!');
      return;
    } catch (error) {
      console.log(`⏳ Attempt ${i + 1}/${MAX_RETRIES}: Kong not ready yet (${error.message})`);
      
      if (i < MAX_RETRIES - 1) {
        await new Promise(resolve => setTimeout(resolve, RETRY_INTERVAL));
      }
    }
  }
  
  console.error('❌ Kong Gateway failed to start within the expected time');
  process.exit(1);
}

waitForKong();