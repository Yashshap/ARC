import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';

const SNAPSHOT_FILENAME = 'arc_health_backup_latest.json';
const WEB_FALLBACK_KEY = 'arc_health_snapshot_disk_fallback';

let saveTimer = null;

/**
 * Checks if running in a native Capacitor environment with filesystem support.
 */
function isNativePlatform() {
  return typeof window !== 'undefined' && window.Capacitor?.isNativePlatform?.();
}

/**
 * Debounced write of database snapshot to the app's internal files directory.
 * On Android, this directory is included in Android Auto-Backup.
 *
 * @param {string} jsonPayload - The serialized backup JSON.
 * @param {number} [delay=2000] - Debounce delay in ms.
 */
export function scheduleDiskSnapshot(jsonPayload, delay = 2000) {
  if (saveTimer) {
    clearTimeout(saveTimer);
  }

  saveTimer = setTimeout(async () => {
    try {
      if (isNativePlatform()) {
        await Filesystem.writeFile({
          path: SNAPSHOT_FILENAME,
          data: jsonPayload,
          directory: Directory.Data,
          encoding: Encoding.UTF8,
          recursive: true,
        });
      } else {
        localStorage.setItem(WEB_FALLBACK_KEY, jsonPayload);
      }
    } catch (error) {
      console.warn('Could not write disk snapshot (auto-backup file):', error);
    }
  }, delay);
}

/**
 * Checks if a previous disk snapshot file exists (e.g. restored by Android OS after reinstall).
 * @returns {Promise<boolean>}
 */
export async function hasDiskSnapshot() {
  try {
    if (isNativePlatform()) {
      const result = await Filesystem.stat({
        path: SNAPSHOT_FILENAME,
        directory: Directory.Data,
      });
      return !!result;
    }
    return !!localStorage.getItem(WEB_FALLBACK_KEY);
  } catch {
    return false;
  }
}

/**
 * Reads and parses the disk snapshot file.
 * @returns {Promise<Object|null>}
 */
export async function loadDiskSnapshot() {
  try {
    if (isNativePlatform()) {
      const fileData = await Filesystem.readFile({
        path: SNAPSHOT_FILENAME,
        directory: Directory.Data,
        encoding: Encoding.UTF8,
      });
      const content = typeof fileData.data === 'string' ? fileData.data : JSON.stringify(fileData.data);
      return JSON.parse(content);
    }

    const fallback = localStorage.getItem(WEB_FALLBACK_KEY);
    if (fallback) {
      return JSON.parse(fallback);
    }
    return null;
  } catch (error) {
    console.warn('Could not read disk snapshot:', error);
    return null;
  }
}
