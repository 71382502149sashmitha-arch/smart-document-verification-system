import fs from 'fs';
import path from 'path';

const API_BASE = process.env.API_BASE || 'http://localhost:5000/api';

async function runFullSystemCheck() {
  console.log('====================================================');
  console.log('🧪 SMART DOCUMENT VERIFICATION SYSTEM - SYSTEM CHECK');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      console.log(`✅ [PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`❌ [FAIL] ${name}:`, err.message);
      failed++;
    }
  }

  // 1. HEALTH CHECK
  await test('API Health Check (/api/health)', async () => {
    const res = await fetch(`${API_BASE}/health`);
    const data = await res.json();
    if (!data.success) throw new Error('Health check failed');
  });

  // 2. AUTHENTICATION (Admin, Verifier, User)
  let adminToken = '';
  let verifierToken = '';
  let userToken = '';

  await test('Admin Login (admin@sdvs.com)', async () => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@sdvs.com', password: 'Admin@123' })
    });
    const data = await res.json();
    adminToken = data.data?.token;
    if (!adminToken) throw new Error(data.message || 'No admin token');
  });

  await test('Verifier Login (verifier@sdvs.com)', async () => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'verifier@sdvs.com', password: 'Verifier@123' })
    });
    const data = await res.json();
    verifierToken = data.data?.token;
    if (!verifierToken) throw new Error(data.message || 'No verifier token');
  });

  await test('User Login (user1@sdvs.com)', async () => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'user1@sdvs.com', password: 'User@123' })
    });
    const data = await res.json();
    userToken = data.data?.token;
    if (!userToken) throw new Error(data.message || 'No user token');
  });

  // 3. USER REGISTRATION (Unique email per run)
  const testEmail = `testuser_${Date.now()}_${Math.floor(Math.random() * 1000)}@example.com`;
  let newlyRegToken = '';
  await test('User Registration (/api/auth/register)', async () => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'TestPassword@123',
        fullName: 'Integration Test User',
        phone: '+1888888888'
      })
    });
    const data = await res.json();
    newlyRegToken = data.data?.token;
    if (!newlyRegToken) throw new Error(data.message || 'Registration failed');
  });

  // 4. GET ME PROFILE
  await test('Fetch User Profile (/api/auth/me)', async () => {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    const data = await res.json();
    if (!data.data?.user) throw new Error(data.message || 'Failed to get profile');
  });

  // 5. UPDATE PROFILE DETAILS
  await test('Update Profile Details (/api/auth/profile)', async () => {
    const res = await fetch(`${API_BASE}/auth/profile`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`
      },
      body: JSON.stringify({
        fullName: 'John Doe Fully Tested',
        phone: '+1777777777'
      })
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Update profile failed');
  });

  // 6. UPDATE PASSWORD & RE-LOGIN (on dedicated temporary test account)
  await test('Update Password & Re-login Verification', async () => {
    const tempEmail = `pass_test_${Date.now()}@example.com`;
    const resReg = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: tempEmail,
        password: 'OriginalPass@123',
        fullName: 'Password Test User',
        phone: '+1999888777'
      })
    });
    const dataReg = await resReg.json();
    const tempToken = dataReg.data?.token;
    if (!tempToken) throw new Error('Temp user registration failed');

    const resPass = await fetch(`${API_BASE}/auth/profile`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tempToken}`
      },
      body: JSON.stringify({
        currentPassword: 'OriginalPass@123',
        newPassword: 'UpdatedPass@456'
      })
    });
    const dataPass = await resPass.json();
    if (!dataPass.success) throw new Error(dataPass.message || 'Update password failed');

    const resLoginNew = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: tempEmail, password: 'UpdatedPass@456' })
    });
    const dataLoginNew = await resLoginNew.json();
    if (!dataLoginNew.success) throw new Error(dataLoginNew.message || 'Failed to login with new password');
  });

  // 7. GET USER DOCUMENTS LIST (/api/documents/my)
  let sampleDocId = null;
  await test('Get User Documents List (/api/documents/my)', async () => {
    const res = await fetch(`${API_BASE}/documents/my`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    const data = await res.json();
    if (!Array.isArray(data.data?.documents)) throw new Error('Invalid documents list format');
    if (data.data.documents.length > 0) {
      sampleDocId = data.data.documents[0].id;
    }
  });

  // 8. GET DOCUMENT DETAIL
  await test('Get Document Detail (/api/documents/:id)', async () => {
    if (sampleDocId) {
      const res = await fetch(`${API_BASE}/documents/${sampleDocId}`, {
        headers: { Authorization: `Bearer ${userToken}` }
      });
      const data = await res.json();
      if (!data.data?.document) throw new Error('Document detail missing');
    }
  });

  // 9. VERIFICATION QUEUE (VERIFIER)
  await test('Get Verifier Queue (/api/verification/queue)', async () => {
    const res = await fetch(`${API_BASE}/verification/queue`, {
      headers: { Authorization: `Bearer ${verifierToken}` }
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Failed to get verification queue');
  });

  // 10. ADMIN ANALYTICS
  await test('Fetch Admin Analytics (/api/admin/analytics)', async () => {
    const res = await fetch(`${API_BASE}/admin/analytics`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const data = await res.json();
    if (!data.data?.docStats && !data.data?.userStats) throw new Error('Admin analytics missing stats');
  });

  // 11. ADMIN USERS LIST
  await test('Fetch Admin Users List (/api/admin/users)', async () => {
    const res = await fetch(`${API_BASE}/admin/users`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const data = await res.json();
    if (!Array.isArray(data.data?.users)) throw new Error('Admin users list invalid');
  });

  // 12. ADMIN AUDIT LOGS
  await test('Fetch Admin Audit Logs (/api/admin/audit-logs)', async () => {
    const res = await fetch(`${API_BASE}/admin/audit-logs`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const data = await res.json();
    if (!Array.isArray(data.data?.logs)) throw new Error('Admin audit logs invalid');
  });

  // 13. ADMIN VALIDATION RULES (/api/admin/validation-rules)
  await test('Fetch Admin Validation Rules (/api/admin/validation-rules)', async () => {
    const res = await fetch(`${API_BASE}/admin/validation-rules`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const data = await res.json();
    if (!Array.isArray(data.data?.rules)) throw new Error('Admin rules invalid');
  });

  // 14. FRONTEND ROOT SPA PAGE SERVING
  await test('Frontend Root Page Serving (http://localhost:5000/)', async () => {
    const res = await fetch('http://localhost:5000/');
    const html = await res.text();
    if (!html.includes('<title>') && !html.includes('<div id="root">')) {
      throw new Error('Frontend SPA root failed to serve index.html');
    }
  });

  console.log('\n====================================================');
  console.log(`🎉 SYSTEM CHECK COMPLETE: ${passed} PASSED | ${failed} FAILED`);
  console.log('====================================================');

  if (failed > 0) process.exit(1);
}

runFullSystemCheck();
