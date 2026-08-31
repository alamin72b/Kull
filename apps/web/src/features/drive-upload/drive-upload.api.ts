import type {
  DrivePathCheckResult,
  DriveStatus,
  DriveUploadResult,
} from '@kull/contracts';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

/*
 * ---------------------------------------------------------
 * HELPER
 * ---------------------------------------------------------
 *
 * Reads the error returned by NestJS.
 */
async function getErrorMessage(response: Response): Promise<string> {
  const data = (await response.json().catch(() => null)) as {
    message?: string | string[];
  } | null;

  if (Array.isArray(data?.message)) {
    return data.message.join(' ');
  }

  if (typeof data?.message === 'string') {
    return data.message;
  }

  return 'Something went wrong.';
}

/*
 * ---------------------------------------------------------
 * HELPER
 * ---------------------------------------------------------
 *
 * Handles 401 and normal errors.
 */
async function checkResponse(response: Response) {
  if (response.status === 401) {
    window.location.href = '/activities/login';

    throw new Error('Please log in first.');
  }

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }
}

/*
 * ---------------------------------------------------------
 * CHECK GOOGLE DRIVE CONNECTION
 * ---------------------------------------------------------
 */
export async function getDriveStatus(): Promise<DriveStatus> {
  const response = await fetch(`${API_URL}/drive/status`, {
    credentials: 'include',
    cache: 'no-store',
  });

  await checkResponse(response);

  return response.json();
}

/*
 * ---------------------------------------------------------
 * CONNECT GOOGLE DRIVE
 * ---------------------------------------------------------
 */
export async function connectGoogleDrive() {
  const response = await fetch(`${API_URL}/drive/connect`, {
    credentials: 'include',
    cache: 'no-store',
  });

  await checkResponse(response);

  const data = await response.json();

  /*
   * Send the browser to Google.
   */
  window.location.href = data.url;
}

/*
 * ---------------------------------------------------------
 * CHECK FOLDER PATH
 * ---------------------------------------------------------
 */
export async function checkDrivePath(
  folderPath: string,
): Promise<DrivePathCheckResult> {
  const response = await fetch(`${API_URL}/drive/check-path`, {
    method: 'POST',

    credentials: 'include',

    headers: {
      'Content-Type': 'application/json',
    },

    body: JSON.stringify({
      folderPath,
    }),
  });

  await checkResponse(response);

  return response.json();
}

/*
 * ---------------------------------------------------------
 * UPLOAD FILE
 * ---------------------------------------------------------
 */
export async function uploadToDrive(
  file: File,
  folderPath: string,
): Promise<DriveUploadResult> {
  const formData = new FormData();

  formData.append('file', file);

  formData.append('folderPath', folderPath);

  /*
   * The user has already
   * confirmed the path in the UI.
   */
  formData.append('confirmed', 'true');

  const response = await fetch(`${API_URL}/drive/upload`, {
    method: 'POST',

    credentials: 'include',

    body: formData,
  });

  await checkResponse(response);

  return response.json();
}
