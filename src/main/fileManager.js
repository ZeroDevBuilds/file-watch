const fs = require('fs-extra');
const path = require('path');
const { subYears } = require('date-fns');

class FileManager {
  async organizeByExtension(folderPath) {
    // Only get files at the root level, not in subdirectories
    const items = await fs.readdir(folderPath);
    const organized = {};

    for (const item of items) {
      const itemPath = path.join(folderPath, item);
      const stat = await fs.stat(itemPath);

      // Skip directories - only process files
      if (stat.isDirectory()) {
        continue;
      }

      const ext = path.extname(item).toLowerCase() || 'no-extension';
      const extFolderName = ext.replace('.', '') || 'no-extension';
      const extFolder = path.join(folderPath, extFolderName);
      
      await fs.ensureDir(extFolder);
      const fileName = path.basename(itemPath);
      const newPath = path.join(extFolder, fileName);
      
      try {
        await fs.move(itemPath, newPath, { overwrite: false });
        
        if (!organized[ext]) organized[ext] = 0;
        organized[ext]++;
      } catch (error) {
        console.log(`Skipped ${fileName}: ${error.message}`);
      }
    }

    return organized;
  }

  async findOldFiles(folderPath, yearsOld = 3) {
    const files = await this.getAllFiles(folderPath);
    const cutoffDate = subYears(new Date(), yearsOld);
    const oldFiles = [];

    for (const file of files) {
      const stats = await fs.stat(file);
      if (stats.mtime < cutoffDate) {
        oldFiles.push({
          path: file,
          name: path.basename(file),
          size: stats.size,
          modified: stats.mtime
        });
      }
    }

    return oldFiles.sort((a, b) => b.size - a.size);
  }

  async deleteFiles(filePaths) {
    for (const file of filePaths) {
      await fs.remove(file);
    }
  }

  async getAllFiles(dirPath, arrayOfFiles = []) {
    const files = await fs.readdir(dirPath);

    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stat = await fs.stat(filePath);

      if (stat.isDirectory()) {
        arrayOfFiles = await this.getAllFiles(filePath, arrayOfFiles);
      } else {
        arrayOfFiles.push(filePath);
      }
    }

    return arrayOfFiles;
  }
}

module.exports = FileManager;