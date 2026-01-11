const chokidar = require('chokidar');

class FolderWatcher {
  constructor(fileManager) {
    this.fileManager = fileManager;
    this.watcher = null;
    this.watchedFolders = [];
    this.autoOrganize = false;
    this.checkInterval = null;
    this.intervalMinutes = 60; // Default: 1 hour
  }

  watch(folders, autoOrganize = false, intervalMinutes = 60) {
    this.stopWatching();
    this.watchedFolders = folders;
    this.autoOrganize = autoOrganize;
    this.intervalMinutes = intervalMinutes;

    this.watcher = chokidar.watch(folders, {
      persistent: true,
      ignoreInitial: true,
      awaitWriteFinish: {
        stabilityThreshold: 2000,
        pollInterval: 100
      }
    });

    this.watcher.on('add', (filePath) => {
      console.log(`File added: ${filePath}`);
    });

    this.watcher.on('error', (error) => {
      console.error('Watcher error:', error);
    });

    // Start periodic auto-organization if enabled
    if (this.autoOrganize) {
      this.startAutoOrganize();
    }
  }

  startAutoOrganize() {
    this.stopAutoOrganize();
    
    console.log(`Auto-organize enabled: checking every ${this.intervalMinutes} minutes`);
    
    // Convert minutes to milliseconds
    const intervalMs = this.intervalMinutes * 60 * 1000;
    
    this.checkInterval = setInterval(async () => {
      console.log('Running scheduled auto-organization...');
      for (const folder of this.watchedFolders) {
        try {
          await this.fileManager.organizeByExtension(folder);
          console.log(`Auto-organized: ${folder}`);
        } catch (error) {
          console.error(`Error auto-organizing ${folder}:`, error);
        }
      }
    }, intervalMs);
  }

  stopAutoOrganize() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  updateSettings(autoOrganize, intervalMinutes) {
    this.autoOrganize = autoOrganize;
    this.intervalMinutes = intervalMinutes;

    if (this.autoOrganize && this.watchedFolders.length > 0) {
      this.startAutoOrganize();
    } else {
      this.stopAutoOrganize();
    }
  }

  stopWatching() {
    if (this.watcher) {
      this.watcher.close();
      this.watcher = null;
    }
    this.stopAutoOrganize();
  }
}

module.exports = FolderWatcher;