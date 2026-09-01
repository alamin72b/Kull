"use client";

import type {
  ImportantDocument,
  ImportantDocumentSortBy,
  ImportantDocumentsPage,
  SortDirection,
} from "@kull/contracts";
import Link from "next/link";
import {
  ChangeEvent,
  useEffect,
  useState,
} from "react";

import {
  connectGoogleDrive,
  getDriveStatus,
} from "../../features/drive-upload/drive-upload.api";
import {
  deleteImportantDocument,
  getImportantDocuments,
  prepareImportantDocumentsRoot,
  updateImportantDocument,
  uploadImportantDocument,
} from "../../features/important-documents/important-documents.api";
import styles from "../../features/important-documents/important-documents.module.css";

const DEFAULT_ROOT = "Kull Important Documents";

function displayDate(value?: string) {
  if (!value) return "Unknown date";
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(value));
}

function displaySize(value?: string) {
  if (!value) return "";
  const bytes = Number(value);
  if (!Number.isFinite(bytes)) return "";
  return (bytes / 1024 / 1024).toFixed(2) + " MB";
}

export default function ImportantDocumentsPage() {
  const [connected, setConnected] = useState(false);
  const [loadingConnection, setLoadingConnection] = useState(true);
  const [rootFolderPath, setRootFolderPath] = useState(DEFAULT_ROOT);
  const [folderPath, setFolderPath] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const [documentsPage, setDocumentsPage] = useState<ImportantDocumentsPage | null>(null);
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<ImportantDocumentSortBy>("date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [page, setPage] = useState(1);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<ImportantDocument | null>(null);
  const [editName, setEditName] = useState("");
  const [editFolderPath, setEditFolderPath] = useState("");

  useEffect(() => {
    async function loadConnection() {
      try {
        const status = await getDriveStatus();
        setConnected(status.connected);
      } catch (caughtError) {
        setError(caughtError instanceof Error ? caughtError.message : "Could not check Google Drive connection.");
      } finally {
        setLoadingConnection(false);
      }
    }
    void loadConnection();
  }, []);

  async function loadDocuments(nextPage = page) {
    if (!rootFolderPath.trim()) {
      setError("Enter the root folder path first.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const result = await getImportantDocuments({ rootFolderPath, query, sortBy, sortDirection, page: nextPage, pageSize: 20 });
      setDocumentsPage(result);
      setPage(nextPage);
    } catch (caughtError) {
      setDocumentsPage(null);
      setError(caughtError instanceof Error ? caughtError.message : "Could not load documents.");
    } finally {
      setLoading(false);
    }
  }

  async function prepareRoot() {
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const result = await prepareImportantDocumentsRoot(rootFolderPath);
      setMessage(result.createdFolders.length ? "Root folder prepared: " + result.rootFolderPath : "Root folder is ready: " + result.rootFolderPath);
      await loadDocuments(1);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Could not prepare the root folder.");
    } finally {
      setLoading(false);
    }
  }

  function chooseFile(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0] ?? null;
    setFile(selected);
    setFileName(selected?.name ?? "");
    setMessage("");
    setError("");
  }

  async function upload() {
    if (!file) {
      setError("Choose a document first.");
      return;
    }
    if (!rootFolderPath.trim() || !fileName.trim()) {
      setError("Enter the root folder and a document name.");
      return;
    }
    const confirmed = window.confirm("Upload " + fileName + " to My Drive / " + rootFolderPath + (folderPath ? " / " + folderPath : "") + "?");
    if (!confirmed) return;
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const uploaded = await uploadImportantDocument(file, { rootFolderPath, folderPath, fileName });
      setMessage("Uploaded " + uploaded.name + ".");
      setFile(null);
      setFileName("");
      setFolderPath("");
      await loadDocuments(1);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Could not upload the document.");
    } finally {
      setLoading(false);
    }
  }

  async function saveEdit() {
    if (!editing) return;
    setLoading(true);
    setError("");
    try {
      const result = await updateImportantDocument(editing.id, { rootFolderPath, fileName: editName.trim() || undefined, folderPath: editFolderPath.trim() || undefined });
      setMessage("Updated " + result.name + ".");
      setEditing(null);
      await loadDocuments(page);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Could not update the document.");
    } finally {
      setLoading(false);
    }
  }

  async function remove(document: ImportantDocument) {
    const confirmed = window.confirm("Move " + document.name + " to Google Drive trash?");
    if (!confirmed) return;
    setLoading(true);
    setError("");
    try {
      await deleteImportantDocument(document.id, rootFolderPath);
      setMessage(document.name + " was moved to Drive trash.");
      await loadDocuments(page);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Could not delete the document.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <Link className={styles.backLink} href="/">← Kull home</Link>
          <p className={styles.eyebrow}>Kull / Important documents</p>
          <h1>Documents that stay organised.</h1>
          <p className={styles.intro}>Keep important files in a root folder you choose, organise them into subfolders, and manage them without leaving Kull.</p>
        </div>
      </header>
      {error && <p className={styles.error} role="alert">{error}</p>}
      {message && <p className={styles.notice} role="status">{message}</p>}
      <div className={styles.grid}>
        <section className={styles.card}>
          <h2>Document setup</h2>
          <p className={styles.muted}>Your root exists only in your own Google Drive. Kull cannot see another user&apos;s documents.</p>
          {loadingConnection ? <p className={styles.muted}>Checking Google Drive…</p> : connected ? <p className={styles.notice}>Google Drive is connected.</p> : <div className={styles.buttonRow}><button className={styles.primaryButton} onClick={connectGoogleDrive} type="button">Connect Google Drive</button></div>}
          <label className={styles.field}>Root folder path<input onChange={(event) => { setRootFolderPath(event.target.value); setDocumentsPage(null); }} placeholder={DEFAULT_ROOT} value={rootFolderPath} /></label>
          <div className={styles.buttonRow}><button className={styles.secondaryButton} disabled={!connected || loading} onClick={() => { void prepareRoot(); }} type="button">Prepare root folder</button></div>
          <label className={styles.field}>Document subfolder path<input onChange={(event) => { setFolderPath(event.target.value); }} placeholder="Identity/Passport" value={folderPath} /></label>
          <label className={styles.fileInput}><span>{file ? "Selected: " + file.name : "Choose a document (max 20 MB)"}</span><input onChange={chooseFile} type="file" /></label>
          <label className={styles.field}>File name in Google Drive<input onChange={(event) => { setFileName(event.target.value); }} placeholder="passport-2026.pdf" value={fileName} /></label>
          <div className={styles.buttonRow}><button className={styles.primaryButton} disabled={!connected || !file || loading} onClick={() => { void upload(); }} type="button">Upload document</button></div>
        </section>
        <section className={styles.card}>
          <h2>Search and clean up</h2>
          <p className={styles.muted}>Search matches file names inside the selected root folder. Rename, move, or remove documents here.</p>
          <div className={styles.toolbar}>
            <input aria-label="Search documents" onChange={(event) => { setQuery(event.target.value); }} placeholder="Search file names" value={query} />
            <select aria-label="Sort documents" onChange={(event) => { setSortBy(event.target.value as ImportantDocumentSortBy); }} value={sortBy}><option value="date">Date</option><option value="name">Name</option><option value="type">Type</option></select>
            <select aria-label="Sort direction" onChange={(event) => { setSortDirection(event.target.value as SortDirection); }} value={sortDirection}><option value="desc">Descending</option><option value="asc">Ascending</option></select>
          </div>
          <div className={styles.buttonRow}><button className={styles.secondaryButton} disabled={!connected || loading} onClick={() => { void loadDocuments(1); }} type="button">Search documents</button></div>
          {documentsPage?.truncated && <p className={styles.notice}>Showing the first 1,000 matching documents. Narrow the search to refine the result.</p>}
          {loading && <p className={styles.muted}>Loading…</p>}
          {!loading && documentsPage && documentsPage.documents.length === 0 && <p className={styles.empty}>No documents match this search.</p>}
          <div className={styles.documentList}>{documentsPage?.documents.map((document) => <article className={styles.document} key={document.id}><div><p className={styles.documentName}>{document.name}</p><p className={styles.documentMeta}>{document.folderPath || rootFolderPath}{" · "}{document.mimeType}{" · "}{displayDate(document.modifiedTime)}{document.size ? " · " + displaySize(document.size) : ""}</p>{document.webViewLink && <a className={styles.link} href={document.webViewLink} rel="noreferrer" target="_blank">Open in Google Drive</a>}{editing?.id === document.id && <div className={styles.editForm}><input aria-label="New document name" onChange={(event) => { setEditName(event.target.value); }} placeholder={document.name} value={editName} /><input aria-label="New document folder" onChange={(event) => { setEditFolderPath(event.target.value); }} placeholder="New subfolder path" value={editFolderPath} /><div className={styles.buttonRow}><button className={styles.primaryButton} disabled={loading} onClick={() => { void saveEdit(); }} type="button">Save changes</button><button className={styles.secondaryButton} onClick={() => { setEditing(null); }} type="button">Cancel</button></div></div>}</div><div className={styles.documentActions}><button className={styles.secondaryButton} onClick={() => { setEditing(document); setEditName(document.name); setEditFolderPath(""); }} type="button">Rename or move</button><button className={styles.dangerButton} onClick={() => { void remove(document); }} type="button">Delete</button></div></article>)}</div>
          {documentsPage && <div className={styles.pagination}><span>Page {documentsPage.page} of {documentsPage.totalPages} · {documentsPage.total} document{documentsPage.total === 1 ? "" : "s"}</span><div className={styles.buttonRow}><button className={styles.secondaryButton} disabled={loading || documentsPage.page === 1} onClick={() => { void loadDocuments(documentsPage.page - 1); }} type="button">Previous</button><button className={styles.secondaryButton} disabled={loading || !documentsPage.hasNextPage} onClick={() => { void loadDocuments(documentsPage.page + 1); }} type="button">Next</button></div></div>}
        </section>
      </div>
    </main>
  );
}
