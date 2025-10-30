#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

console.log('🚀 Setting up Klarna Payment Demo...\n');

// Function to run shell commands
function runCommand(command, cwd = process.cwd()) {
  return new Promise((resolve, reject) => {
    exec(command, { cwd }, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        resolve(stdout);
      }
    });
  });
}

// Function to copy environment files
function setupEnvFiles() {
  console.log('📄 Setting up environment files...');

  const backendEnvExample = path.join(__dirname, 'backend', '.env.example');
  const backendEnv = path.join(__dirname, 'backend', '.env');

  const frontendEnvExample = path.join(__dirname, 'frontend', '.env.example');
  const frontendEnv = path.join(__dirname, 'frontend', '.env');

  // Copy backend .env if it doesn't exist
  if (!fs.existsSync(backendEnv) && fs.existsSync(backendEnvExample)) {
    fs.copyFileSync(backendEnvExample, backendEnv);
    console.log('✅ Created backend/.env from template');
  }

  // Copy frontend .env if it doesn't exist
  if (!fs.existsSync(frontendEnv) && fs.existsSync(frontendEnvExample)) {
    fs.copyFileSync(frontendEnvExample, frontendEnv);
    console.log('✅ Created frontend/.env from template');
  }
}

// Main setup function
async function setup() {
  try {
    // Setup environment files
    setupEnvFiles();

    console.log('\n📦 Installing backend dependencies...');
    await runCommand('npm install', path.join(__dirname, 'backend'));
    console.log('✅ Backend dependencies installed');

    console.log('\n📦 Installing frontend dependencies...');
    await runCommand('npm install', path.join(__dirname, 'frontend'));
    console.log('✅ Frontend dependencies installed');

    console.log('\n🎉 Setup complete!');
    console.log('\n📋 Next steps:');
    console.log('1. Get your Klarna Playground credentials from: https://playground.eu.portal.klarna.com/');
    console.log('2. Update backend/.env with your Klarna credentials');
    console.log('3. Run the backend: cd backend && npm run dev');
    console.log('4. Run the frontend: cd frontend && npm run dev');
    console.log('5. Open http://localhost:3000 in your browser');
    console.log('\n📚 Check README.md for detailed instructions!');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    console.log('\n💡 Try running the commands manually:');
    console.log('   cd backend && npm install');
    console.log('   cd frontend && npm install');
    process.exit(1);
  }
}

// Run setup
setup();