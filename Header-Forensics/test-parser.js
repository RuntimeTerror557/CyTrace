const { parseEmail } = require('./utils/emailParser');

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

async function testParser() {
    try {
        const result = await parseEmail(testEmail);

        console.log('✅ Email parsed successfully');
        console.log(JSON.stringify(result, null, 2));
    } catch (error) {
        console.error('❌ Email parsing failed');
        console.error(error);
    }
}

testParser();