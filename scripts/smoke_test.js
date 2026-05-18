const BASE = `http://127.0.0.1:5000/api`;

async function post(path, body, token) {
  const res = await global.fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { json = text; }
  return { status: res.status, body: json };
}

async function get(path, token) {
  const res = await global.fetch(`${BASE}${path}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { json = text; }
  return { status: res.status, body: json };
}

(async function run() {
  console.log('BASE:', BASE);
  try {
    console.log('\n1) Login');
    const login = await post('/auth/login', { identifier: 'aayush12@gmail.com', password: '1234567' });
    console.log(login.status, login.body && (login.body.error || login.body.message || JSON.stringify(login.body)));

    const token = login.body && login.body.token ? login.body.token : null;

    console.log('\n2) GET /state');
    const state = await get('/state', token);
    console.log(state.status, Array.isArray(state.body.issues) ? `issues:${state.body.issues.length}` : JSON.stringify(state.body).slice(0,200));

    console.log('\n3) Create issue (auth)');
    const created = await post('/issues', { title: 'smoke test', description: 'smoke', priority: 'Normal', department: 'Roads', area: 'Central Ward' }, token);
    console.log(created.status, JSON.stringify(created.body).slice(0,200));

    console.log('\n4) Send message (should fail or succeed depending)');
    const messages = await post('/messages/1', { message: 'hi from smoke' }, token);
    console.log(messages.status, JSON.stringify(messages.body).slice(0,200));

    console.log('\n5) GET /bug-reports (admin)');
    const bugs = await get('/bug-reports', token);
    console.log(bugs.status, Array.isArray(bugs.body) ? `count:${bugs.body.length}` : JSON.stringify(bugs.body).slice(0,200));

  } catch (err) {
    console.error('Smoke test failed:', err);
    process.exit(1);
  }
})();
