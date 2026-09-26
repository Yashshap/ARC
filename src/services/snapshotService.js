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

function getUserSnapshotFilename(userId) {
  if (!userId || userId === 'guest') return SNAPSHOT_FILENAME;
  const sanitized = String(userId).replace(/[^a-zA-Z0-9_-]/g, '_');
  return `arc_health_backup_${sanitized}.json`;
}

/**
 * Debounced write of database snapshot to the app's internal files directory.
 * On Android, this directory is included in Android Auto-Backup.
 *
 * @param {string} jsonPayload - The serialized backup JSON.
 * @param {string|null} [userId=null] - Current authenticated user ID.
 * @param {number} [delay=2000] - Debounce delay in ms.
 */
export function scheduleDiskSnapshot(jsonPayload, userId = null, delay = 2000) {
  if (saveTimer) {
    clearTimeout(saveTimer);
  }

  saveTimer = setTimeout(async () => {
    try {
      const userFile = getUserSnapshotFilename(userId);
      if (isNativePlatform()) {
        await Filesystem.writeFile({
          path: userFile,
          data: jsonPayload,
          directory: Directory.Data,
          encoding: Encoding.UTF8,
          recursive: true,
        });
        // Also write to canonical latest filename for Android Auto-Backup compatibility
        if (userFile !== SNAPSHOT_FILENAME) {
          await Filesystem.writeFile({
            path: SNAPSHOT_FILENAME,
            data: jsonPayload,
            directory: Directory.Data,
            encoding: Encoding.UTF8,
            recursive: true,
          });
        }
      } else {
        localStorage.setItem(`${WEB_FALLBACK_KEY}_${userFile}`, jsonPayload);
        localStorage.setItem(WEB_FALLBACK_KEY, jsonPayload);
      }
    } catch (error) {
      console.warn('Could not write disk snapshot (auto-backup file):', error);
    }
  }, delay);
}

/**
 * Checks if a previous disk snapshot file exists (e.g. restored by Android OS after reinstall).
 * @param {string|null} [userId=null]
 * @returns {Promise<boolean>}
 */
export async function hasDiskSnapshot(userId = null) {
  try {
    const userFile = getUserSnapshotFilename(userId);
    if (isNativePlatform()) {
      try {
        const res = await Filesystem.stat({ path: userFile, directory: Directory.Data });
        if (res) return true;
      } catch {
        // Fallback to canonical filename
      }
      const result = await Filesystem.stat({
        path: SNAPSHOT_FILENAME,
        directory: Directory.Data,
      });
      return !!result;
    }
    return !!(localStorage.getItem(`${WEB_FALLBACK_KEY}_${userFile}`) || localStorage.getItem(WEB_FALLBACK_KEY));
  } catch {
    return false;
  }
}

/**
 * Reads and parses the disk snapshot file for the given user.
 * @param {string|null} [userId=null]
 * @returns {Promise<Object|null>}
 */
export async function loadDiskSnapshot(userId = null) {
  try {
    const userFile = getUserSnapshotFilename(userId);
    if (isNativePlatform()) {
      for (const candidatePath of [userFile, SNAPSHOT_FILENAME]) {
        try {
          const fileData = await Filesystem.readFile({
            path: candidatePath,
            directory: Directory.Data,
            encoding: Encoding.UTF8,
          });
          const content = typeof fileData.data === 'string' ? fileData.data : JSON.stringify(fileData.data);
          const parsed = JSON.parse(content);
          if (parsed && (!userId || !parsed.userId || String(parsed.userId) === String(userId))) {
            return parsed;
          }
        } catch {
          // Try next candidate
        }
      }
      return null;
    }

    const fallback = localStorage.getItem(`${WEB_FALLBACK_KEY}_${userFile}`) || localStorage.getItem(WEB_FALLBACK_KEY);
    if (fallback) {
      const parsed = JSON.parse(fallback);
      if (parsed && (!userId || !parsed.userId || String(parsed.userId) === String(userId))) {
        return parsed;
      }
    }
    return null;
  } catch (error) {
    console.warn('Could not read disk snapshot:', error);
    return null;
  }
}
