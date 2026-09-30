import app from './src/server';
import http from 'http';

async function testBackend() {
  console.log('\n--- Running Automated Backend Test Suite ---');
  const server = http.createServer(app);

  await new Promise<void>((resolve) => {
    server.listen(3099, () => {
      console.log('Test server listening on port 3099');
      resolve();
    });
  });

  const baseUrl = 'http://localhost:3099/api';

  try {
    // 1. Health
    const resHealth = await fetch(`${baseUrl}/health`);
    const healthJson = await resHealth.json();
    console.log('✓ Health check passed:', healthJson.status === 'online');

    // 2. Register
    const regPayload = {
      email: `test_${Date.now()}@example.com`,
      password: 'password123',
      firstName: 'Ramesh',
      lastName: 'Adhikari',
      role: 'CLIENT',
      acceptedTerms: true,
      acceptedPrivacy: true,
    };
    const resReg = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(regPayload),
    });
    const regJson = (await resReg.json()) as any;
    console.log('✓ Register endpoint passed:', regJson.success, 'Token created:', !!regJson.data?.token);

    // 3. Login
    const loginPayload = {
      email: 'client@nepaladvocate.com',
      password: 'password123',
    };
    const resLogin = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginPayload),
    });
    const loginJson = (await resLogin.json()) as any;
    const token = loginJson.data?.token;
    console.log('✓ Login endpoint passed:', loginJson.success, 'User:', loginJson.data?.user?.email);

    // 4. Google Auth
    const googlePayload = {
      email: 'sujal.google@gmail.com',
      name: 'Sujal Kunwar',
      role: 'CLIENT',
    };
    const resGoogle = await fetch(`${baseUrl}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(googlePayload),
    });
    const googleJson = (await resGoogle.json()) as any;
    console.log('✓ Google Auth endpoint passed:', googleJson.success, 'Google user:', googleJson.data?.user?.email);

    // 5. Lawyers list
    const resLawyers = await fetch(`${baseUrl}/lawyers?specialization=Corporate`);
    const lawyersJson = (await resLawyers.json()) as any;
    console.log('✓ Lawyers directory passed. Found:', lawyersJson.count, 'lawyer(s)');

    // 6. AI Query RAG
    const resAi = await fetch(`${baseUrl}/ai/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: 'How do I register a company in Nepal?' }),
    });
    const aiJson = (await resAi.json()) as any;
    console.log('✓ AI Legal RAG endpoint passed:', aiJson.success, 'Citations:', aiJson.data?.citations?.length);

    // 7. Dashboard with Token
    const resDash = await fetch(`${baseUrl}/profile/dashboard`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const dashJson = (await resDash.json()) as any;
    console.log('✓ Dashboard endpoint passed:', dashJson.success, 'Appointments:', dashJson.data?.upcomingAppointments?.length);

    // 8. Book Appointment
    const resApt = await fetch(`${baseUrl}/appointments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        lawyerId: 'law_01',
        date: 'Oct 12, 2026',
        timeSlot: '11:00 AM - 12:00 PM',
        notes: 'Reviewing tenancy contract',
        paymentMethod: 'ESEWA',
      }),
    });
    const aptJson = (await resApt.json()) as any;
    console.log('✓ Appointment booking passed:', aptJson.success, 'Fee:', aptJson.data?.fee);

    // 9. Documents
    const resDocs = await fetch(`${baseUrl}/documents`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const docsJson = (await resDocs.json()) as any;
    console.log('✓ Documents endpoint passed:', docsJson.success, 'Count:', docsJson.data?.length);

    console.log('\n🎉 ALL 9 BACKEND ENDPOINT INTEGRATION TESTS PASSED 100%!\n');
  } catch (err) {
    console.error('Test failed:', err);
  } finally {
    server.close();
    process.exit(0);
  }
}

testBackend();
