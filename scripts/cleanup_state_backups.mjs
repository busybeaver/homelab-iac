#!/usr/bin/env zx

import 'zx/globals';
import { join } from 'node:path';

// the number of latest backups that should be preserved
const keepLastBackups = Number(argv.keepBackups) || 5;
// days before a backup get deleted
const daysBeforeDelete = Number(argv.daysBeforeDelete) || 90;

const backupsDir = join(process.cwd(), 'state', '.pulumi', 'backups');
const environments = await glob('*', { cwd: backupsDir, onlyDirectories: true });

// delete all backups that are older than X days (excluding the latest backups)
const date = new Date();
date.setDate(date.getDate() - daysBeforeDelete);
echo(`Going to delete all backups older than: ${date.toISOString()}`);
echo(`Going to keep the last ${keepLastBackups} backups`);
const dateInMilliSec = date.getTime();

/**
 * This filter function includes files older than X days, and excludes newer files.
 * @param filename {string}
 * @return {boolean}
 */
const filterOldBackups = (filename) => {
  // filenames have a structure like <env>.<timestamp>.<ext>
  const timestamp = Number(filename.split('.')[1]) / 1000 / 1000;
  return timestamp < dateInMilliSec;
};

/**
 * Deletes backups older than X days but make sure at least Y backups are kept.
 * @param environment {string}
 * @return {Promise<void>}
 */
const cleanupBackups = (environment) =>
  within(async () => {
    cd(join(backupsDir, environment));

    const files = await glob([join('*.json'), join('*.json.attrs')]);
    // keep the last backup (a backup consists of two files)
    const filesToDelete = files.sort().slice(0, -1 * keepLastBackups * 2).filter(filterOldBackups);
    if (filesToDelete.length > 0) await $`rm ${filesToDelete}`;
    echo(`Deleted ${filesToDelete.length} files in the ${environment} environment`);
  });

await Promise.all(environments.map(cleanupBackups));
