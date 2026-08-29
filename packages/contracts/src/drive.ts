export interface DrivePathPart {
  name: string;
  exists: boolean;
}

export interface DrivePathCheckResult {
  folderPath: string;
  folderExists: boolean;
  missingFolders: string[];
  parts: DrivePathPart[];
}

export interface DriveUploadResult {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  webViewLink?: string;
  folderPath: string;
}

export interface DriveStatus {
  connected: boolean;
}
