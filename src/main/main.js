const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const FileManager = require('./fileManager');
const FolderWatcher = require('./folderWatcher');

let mainWindow;
let fileManager;
let folderWatcher;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  
  // Initialize managers
  fileManager = new FileManager();
  folderWatcher = new FolderWatcher(fileManager);
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC Handlers
ipcMain.handle('select-folders', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory', 'multiSelections']
  });
  return result.filePaths;
});

ipcMain.handle('organize-files', async (event, folderPath) => {
  try {
    const result = await fileManager.organizeByExtension(folderPath);
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('scan-old-files', async (event, folderPath, yearsOld) => {
  try {
    const files = await fileManager.findOldFiles(folderPath, yearsOld);
    return { success: true, data: files };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('delete-files', async (event, filePaths) => {
  try {
    await fileManager.deleteFiles(filePaths);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('start-watching', async (event, folders, autoOrganize, intervalMinutes) => {
  try {
    folderWatcher.watch(folders, autoOrganize, intervalMinutes);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('stop-watching', async () => {
  folderWatcher.stopWatching();
  return { success: true };
});

ipcMain.handle('update-auto-organize', async (event, autoOrganize, intervalMinutes) => {
  try {
    folderWatcher.updateSettings(autoOrganize, intervalMinutes);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});