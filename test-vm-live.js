#!/usr/bin/env node

/**
 * Live VM Testing Script
 * Tests the deployed Ignition Sandbox VM at GitHub Pages
 */

const puppeteer = require('puppeteer');

async function testVM() {
    console.log('🚀 Starting VM Live Testing');
    console.log('=' .repeat(50));

    const browser = await puppeteer.launch({
        headless: false, // Show browser for debugging
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
        const page = await browser.newPage();

        // Set viewport
        await page.setViewport({ width: 1280, height: 800 });

        // Enable console logging
        page.on('console', msg => {
            if (msg.type() === 'log') {
                console.log('Browser:', msg.text());
            }
        });

        page.on('pageerror', error => {
            console.error('Page Error:', error.message);
        });

        console.log('\n📍 Navigating to VM page...');
        await page.goto('https://teslasolar.github.io/ignition-sandbox/vm/', {
            waitUntil: 'networkidle2',
            timeout: 30000
        });

        console.log('✅ Page loaded\n');

        // Wait a bit for v86 to load
        await page.waitForTimeout(3000);

        // Check if V86 loaded
        const v86Status = await page.evaluate(() => {
            return {
                v86Defined: typeof V86Starter !== 'undefined',
                v86Type: typeof V86Starter,
                vmReady: typeof VM !== 'undefined' && VM.isV86Ready(),
                bootOverlayVisible: !document.getElementById('bootOverlay').classList.contains('hidden')
            };
        });

        console.log('🔍 V86 Status:');
        console.log('  V86Starter defined:', v86Status.v86Defined);
        console.log('  V86Starter type:', v86Status.v86Type);
        console.log('  VM ready:', v86Status.vmReady);
        console.log('  Boot menu visible:', v86Status.bootOverlayVisible);
        console.log('');

        if (!v86Status.vmReady) {
            console.log('⚠️  V86 not ready, waiting longer...');
            await page.waitForTimeout(5000);
        }

        // Test 1: Boot Alpine Linux
        console.log('🐧 Test 1: Booting Alpine Linux...');

        await page.evaluate(() => {
            VM.bootLinux('alpine');
        });

        // Wait for boot to start
        await page.waitForTimeout(2000);

        // Check boot status
        const bootStatus = await page.evaluate(() => {
            return {
                running: VM.running,
                emulator: !!VM.emulator,
                status: document.getElementById('vmStatus').textContent,
                bootLog: document.getElementById('bootLog').innerText
            };
        });

        console.log('  VM Running:', bootStatus.running);
        console.log('  Emulator created:', bootStatus.emulator);
        console.log('  Status:', bootStatus.status);
        console.log('  Boot log preview:', bootStatus.bootLog.slice(0, 200));
        console.log('');

        // Wait for VM to fully boot
        console.log('⏳ Waiting for Alpine to boot (30 seconds)...');
        await page.waitForTimeout(30000);

        // Test 2: Send keyboard command
        console.log('⌨️  Test 2: Sending keyboard command...');

        await page.evaluate(() => {
            if (VM.running && VM.emulator) {
                VM.type('uname -a\n');
                return true;
            }
            return false;
        });

        await page.waitForTimeout(2000);

        // Test 3: Check if commands work
        console.log('📝 Test 3: Testing more commands...');

        const commands = [
            'echo "Hello from Ignition VM"\n',
            'ls /\n',
            'free -h\n'
        ];

        for (const cmd of commands) {
            console.log(`  Sending: ${cmd.trim()}`);
            await page.evaluate((command) => {
                VM.type(command);
            }, cmd);
            await page.waitForTimeout(1500);
        }

        // Take screenshot
        console.log('\n📸 Taking screenshot...');
        await page.screenshot({
            path: 'vm-test-alpine.png',
            fullPage: true
        });
        console.log('  Screenshot saved: vm-test-alpine.png');

        // Test 4: Stop and restart
        console.log('\n🔄 Test 4: Stop and restart VM...');

        await page.evaluate(() => {
            VM.stop();
        });

        await page.waitForTimeout(2000);

        // Boot TinyCore
        console.log('🐧 Test 5: Booting TinyCore Linux...');

        await page.evaluate(() => {
            VM.bootLinux('tinycore');
        });

        await page.waitForTimeout(2000);

        const tinycoreStatus = await page.evaluate(() => {
            return {
                running: VM.running,
                status: document.getElementById('vmStatus').textContent
            };
        });

        console.log('  TinyCore Status:', tinycoreStatus.status);
        console.log('  VM Running:', tinycoreStatus.running);

        // Final summary
        console.log('\n' + '=' .repeat(50));
        console.log('✅ VM Testing Complete!');
        console.log('');
        console.log('Summary:');
        console.log('  - V86 emulator loaded:', v86Status.v86Defined);
        console.log('  - Alpine Linux boot:', bootStatus.running ? '✅' : '❌');
        console.log('  - Keyboard input:', 'Tested');
        console.log('  - VM restart:', 'Tested');
        console.log('  - TinyCore boot:', tinycoreStatus.running ? '✅' : '❌');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    } finally {
        // Keep browser open for manual inspection
        console.log('\n📌 Browser will remain open for manual inspection.');
        console.log('Press Ctrl+C to close.');

        // Wait indefinitely
        await new Promise(() => {});
    }
}

// Check if puppeteer is installed
try {
    require.resolve('puppeteer');
    testVM().catch(console.error);
} catch(e) {
    console.log('Puppeteer not installed. Installing...');
    const { exec } = require('child_process');
    exec('npm install puppeteer', (error, stdout, stderr) => {
        if (error) {
            console.error('Failed to install puppeteer:', error);
            console.log('\nAlternatively, test manually at:');
            console.log('https://teslasolar.github.io/ignition-sandbox/vm/');
        } else {
            console.log('Puppeteer installed. Run this script again.');
        }
    });
}