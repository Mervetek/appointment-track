const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');

// Production mu yoksa development mı?
const isDev = !app.isPackaged;

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        minWidth: 900,
        minHeight: 600,
        title: 'PsikoTakip',
        icon: path.join(__dirname, '..', 'public', 'icon.png'),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
        },
        autoHideMenuBar: true,
        show: false,
    });

    // Pencere hazır olduğunda göster (beyaz ekran flash önleme)
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    if (isDev) {
        // Development: Vite dev server'a bağlan
        mainWindow.loadURL('http://localhost:5173');
        // DevTools aç (isteğe bağlı)
        // mainWindow.webContents.openDevTools();
    } else {
        // Production: Build edilmiş dosyaları yükle
        mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
    }

    // Menü çubuğunu gizle
    Menu.setApplicationMenu(null);

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    app.quit();
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
