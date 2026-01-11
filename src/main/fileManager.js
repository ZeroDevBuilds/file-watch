const fs = require('fs-extra');
const path = require('path');
const { subYears } = require('date-fns');

class FileManager {
  async organizeByExtension(folderPath) {
    const files = await this.getAllFiles(folderPath);
    const organized = {};

    for (const file of files) {
      const ext = path.extname(file).toLowerCase() || 'no-extension';
      const extFolder = path.join(folderPath, ext.replace('.', ''));
      
      await fs.ensureDir(extFolder);
      const fileName = path.basename(file);
      const newPath = path.join(extFolder, fileName);
      
      await fs.move(file, newPath, { overwrite: false });
      
      if (!organized[ext]) organized[ext] = 0;
      organized[ext]++;
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