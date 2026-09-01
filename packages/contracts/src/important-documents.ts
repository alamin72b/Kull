export type ImportantDocumentSortBy =
  | "name"
  | "date"
  | "type";

export type SortDirection =
  | "asc"
  | "desc";

export interface ImportantDocumentRoot {
  rootFolderId: string;
  rootFolderPath: string;
  createdFolders: string[];
}

export interface ImportantDocument {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  createdTime?: string;
  modifiedTime?: string;
  webViewLink?: string;
  folderPath: string;
}

export interface ImportantDocumentsPage {
  documents: ImportantDocument[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  truncated: boolean;
}
