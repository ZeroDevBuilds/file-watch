const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  loadConfig: () => ipcRenderer.invoke('load-config'),
  saveConfig: (config) => ipcRenderer.invoke('save-config', config),
  selectFolders: () => ipcRenderer.invoke('select-folders'),
  organizeFiles: (folderPath) => ipcRenderer.invoke('organize-files', folderPath),
  scanOldFiles: (folderPath, yearsOld) => ipcRenderer.invoke('scan-old-files', folderPath, yearsOld),
  deleteFiles: (filePaths) => ipcRenderer.invoke('delete-files', filePaths),
  startWatching: (folders, autoOrganize, intervalMinutes) => ipcRenderer.invoke('start-watching', folders, autoOrganize, intervalMinutes),
  stopWatching: () => ipcRenderer.invoke('stop-watching'),
  updateAutoOrganize: (autoOrganize, intervalMinutes) => ipcRenderer.invoke('update-auto-organize', autoOrganize, intervalMinutes)
});