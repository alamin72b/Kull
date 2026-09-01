import type {
  ImportantDocument,
  ImportantDocumentRoot,
  ImportantDocumentsPage,
  ImportantDocumentSortBy,
  SortDirection,
} from "@kull/contracts";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:4000/api";

async function errorMessage(
  response: Response,
) {
  const body = await response
    .json()
    .catch(() => null) as {
      message?: string | string[];
    } | null;

  if (Array.isArray(body?.message)) {
    return body.message.join(" ");
  }

  return body?.message ?? "Something went wrong.";
}

async function checkResponse(
  response: Response,
) {
  if (response.status === 401) {
    window.location.href = "/activities/login";
    throw new Error("Please log in first.");
  }

  if (!response.ok) {
    throw new Error(
      await errorMessage(response),
    );
  }
}

export async function prepareImportantDocumentsRoot(
  rootFolderPath: string,
): Promise<ImportantDocumentRoot> {
  const response = await fetch(
    API_URL + "/important-documents/root",
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        rootFolderPath,
      }),
    },
  );

  await checkResponse(response);

  return response.json();
}

export async function getImportantDocuments(input: {
  rootFolderPath: string;
  query: string;
  sortBy: ImportantDocumentSortBy;
  sortDirection: SortDirection;
  page: number;
  pageSize: number;
}): Promise<ImportantDocumentsPage> {
  const params = new URLSearchParams({
    rootFolderPath: input.rootFolderPath,
    query: input.query,
    sortBy: input.sortBy,
    sortDirection: input.sortDirection,
    page: String(input.page),
    pageSize: String(input.pageSize),
  });

  const response = await fetch(
    API_URL + "/important-documents?" + params.toString(),
    {
      credentials: "include",
      cache: "no-store",
    },
  );

  await checkResponse(response);

  return response.json();
}

export async function uploadImportantDocument(
  file: File,
  input: {
    rootFolderPath: string;
    folderPath: string;
    fileName: string;
  },
): Promise<ImportantDocument> {
  const formData = new FormData();

  formData.append("file", file);
  formData.append(
    "rootFolderPath",
    input.rootFolderPath,
  );
  formData.append("folderPath", input.folderPath);
  formData.append("fileName", input.fileName);
  formData.append("confirmed", "true");

  const response = await fetch(
    API_URL + "/important-documents/upload",
    {
      method: "POST",
      credentials: "include",
      body: formData,
    },
  );

  await checkResponse(response);

  return response.json();
}

export async function updateImportantDocument(
  documentId: string,
  input: {
    rootFolderPath: string;
    fileName?: string;
    folderPath?: string;
  },
): Promise<ImportantDocument> {
  const response = await fetch(
    API_URL + "/important-documents/" + documentId,
    {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    },
  );

  await checkResponse(response);

  return response.json();
}

export async function deleteImportantDocument(
  documentId: string,
  rootFolderPath: string,
) {
  const params = new URLSearchParams({
    rootFolderPath,
  });

  const response = await fetch(
    API_URL +
      "/important-documents/" +
      documentId +
      "?" +
      params.toString(),
    {
      method: "DELETE",
      credentials: "include",
    },
  );

  await checkResponse(response);
}
