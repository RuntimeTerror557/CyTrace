const { parseEmail } = require('./utils/emailParser');
const { analyzeAuthentication } = require('./utils/authAnalyzer');

const testEmail = `From: attacker@fake-bank.com
To: victim@company.com
Subject: Urgent: Verify Your Account Now
Date: Mon, 26 Aug 2026 10:00:00 +0000
Message-ID: <123456789@fake-bank.com>
Return-Path: <attacker@fake-bank.com>
Reply-To: attacker@fake-bank.com
Received: from suspicious-server.example (192.0.2.50)
    by mail.company.com with ESMTP;
    Mon, 26 Aug 2026 10:00:00 +0000
Authentication-Results: mail.company.com;
    spf=fail smtp.mailfrom=fake-bank.com;
    dkim=fail;
    dmarc=fail header.from=fake-bank.com
Received-SPF: fail (mail.company.com: domain of fake-bank.com does not designate 192.0.2.50 as permitted sender)
DKIM-Signature: v=1; a=rsa-sha256; d=fake-bank.com; s=mail;

Content-Type: text/html; charset=UTF-8

<html>
<body>
<p>Dear Customer,</p>
<p>Your account has been suspended. Click here immediately to verify:
<a href="http://bit.ly/fake-verify-link">Verify Account</a></p>
</body>
</html>`;

async function testAuthentication() {
    try {
        const parsedEmail = await parseEmail(testEmail);

        const analysis = analyzeAuthentication(parsedEmail);

        console.log('✅ Authentication analysis successful');
        console.log(JSON.stringify(analysis, null, 2));
    } catch (error) {
        console.error('❌ Authentication analysis failed');
        console.error(error);
    }
}

testAuthentication();