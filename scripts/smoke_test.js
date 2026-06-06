const BASE = `http://127.0.0.1:3001/api`;

async function get(path, token) {
  const res = await global.fetch(`${BASE}${path}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { json = text; }
  return { status: res.status, body: json };
}

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

(async function run() {
  console.log('BASE:', BASE);
  try {
    console.log('\n1) Health check');
    const health = await get('/health');
    console.log(health.status, health.body);

    console.log('\n2) Login (demo account)');
    const login = await post('/auth/login', { identifier: 'admin@helpline.local', password: 'password' });
    console.log('Login:', login.status, login.body?.error ? login.body.error : 'Success');

    const token = login.body?.token;

    console.log('\n3) GET /state');
    const state = await get('/state', token);
    console.log(state.status, Array.isArray(state.body.issues) ? `issues:${state.body.issues.length}` : JSON.stringify(state.body).slice(0,200));

    console.log('\n4) Create issue (auth)');
    const created = await post('/issues', { title: 'Smoke test issue', description: 'Automated smoke test', priority: 'Normal', department: 'Roads', area: 'Central Ward' }, token);
    console.log(created.status, JSON.stringify(created.body).slice(0,200));

    console.log('\n5) GET /bug-reports (admin)');
    const bugs = await get('/bug-reports', token);
    console.log(bugs.status, Array.isArray(bugs.body) ? `count:${bugs.body.length}` : JSON.stringify(bugs.body).slice(0,200));

    console.log('\n✓ Smoke test completed');
  } catch (err) {
    console.error('Smoke test failed:', err);
    process.exit(1);
  }
})();
