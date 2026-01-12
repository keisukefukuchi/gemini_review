const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

let mainWindow;
let pythonProcess;

// Pythonバックエンドを起動（オプション: Dockerを使わない場合）
// Docker Composeを使う場合は、この関数を呼び出さない
function startBackend() {
  // Dockerを使う場合は、バックエンドはdocker-composeで起動されるため
  // この関数は呼び出さない（環境変数で制御可能）
  if (process.env.USE_DOCKER === 'true') {
    console.log('Using Docker backend, skipping local Python process');
    return;
  }

  const pythonScript = path.join(__dirname, '../../backend/start_backend.py');
  const pythonExecutable = process.platform === 'win32' ? 'python' : 'python3';

  pythonProcess = spawn(pythonExecutable, [pythonScript], {
    cwd: path.join(__dirname, '../../'),
    env: {
      ...process.env,
      DATABASE_URL: 'mysql+pymysql://taskuser:taskpassword@localhost:3306/taskdb',
    },
  });

  pythonProcess.stdout.on('data', (data) => {
    console.log(`Python: ${data}`);
  });

  pythonProcess.stderr.on('data', (data) => {
    console.error(`Python Error: ${data}`);
  });

  pythonProcess.on('close', (code) => {
    console.log(`Python process exited with code ${code}`);
  });
}

// メインウィンドウを作成
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    titleBarStyle: 'default',
  });

  // 開発環境ではViteサーバー、本番環境ではビルド済みファイルを読み込む
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// アプリケーションの準備ができたら
app.whenReady().then(() => {
  // バックエンドを起動（Dockerを使う場合はスキップ）
  startBackend();

  // Dockerを使う場合は即座に、そうでない場合は少し待ってからウィンドウを作成
  const delay = process.env.USE_DOCKER === 'true' ? 0 : 2000;
  setTimeout(() => {
    createWindow();
  }, delay);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// すべてのウィンドウが閉じられたら
app.on('window-all-closed', () => {
  // Pythonプロセスを終了
  if (pythonProcess) {
    pythonProcess.kill();
  }

  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// アプリケーション終了時
app.on('before-quit', () => {
  if (pythonProcess) {
    pythonProcess.kill();
  }
});
