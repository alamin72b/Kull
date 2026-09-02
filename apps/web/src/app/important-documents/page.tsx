"use client";

import type {
  ImportantDocument,
  ImportantDocumentSortBy,
  ImportantDocumentsPage,
  SortDirection,
} from "@kull/contracts";
import {
  ArrowLeft,
  ArrowUpRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FileArchive,
  FileText,
  FolderCog,
  FolderPlus,
  Pencil,
  Search,
  Trash2,
  Upload,
} from "lucide-react";
import Link from "next/link";
import {
  type ChangeEvent,
  useEffect,
  useState,
} from "react";

import { AppHeader } from "@/components/layout/app-header";
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
  if (!value) {
    return "Unknown date";
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
  }).format(new Date(value));
}

function displaySize(value?: string) {
  if (!value) {
    return "";
  }

  const bytes = Number(value);

  if (!Number.isFinite(bytes)) {
    return "";
  }

  return (bytes / 1024 / 1024).toFixed(2) + " MB";
}

export default function ImportantDocumentsPage() {
  const [connected, setConnected] = useState(false);
  const [loadingConnection, setLoadingConnection] = useState(true);
  const [rootFolderPath, setRootFolderPath] = useState(DEFAULT_ROOT);
  const [folderPath, setFolderPath] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const [documentsPage, setDocumentsPage] =
    useState<ImportantDocumentsPage | null>(null);
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] =
    useState<ImportantDocumentSortBy>("date");
  const [sortDirection, setSortDirection] =
    useState<SortDirection>("desc");
  const [page, setPage] = useState(1);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] =
    useState<ImportantDocument | null>(null);
  const [editName, setEditName] = useState("");
  const [editFolderPath, setEditFolderPath] = useState("");

  useEffect(() => {
    async function loadConnection() {
      try {
        const status = await getDriveStatus();
        setConnected(status.connected);
      } catch (caughtError) {
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Could not check Google Drive connection.",
        );
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
      const result = await getImportantDocuments({
        rootFolderPath,
        query,
        sortBy,
        sortDirection,
        page: nextPage,
        pageSize: 20,
      });

      setDocumentsPage(result);
      setPage(nextPage);
    } catch (caughtError) {
      setDocumentsPage(null);
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Could not load documents.",
      );
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

      setMessage(
        result.createdFolders.length
          ? "Root folder prepared: " + result.rootFolderPath
          : "Root folder is ready: " + result.rootFolderPath,
      );

      await loadDocuments(1);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Could not prepare the root folder.",
      );
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

    const confirmed = window.confirm(
      "Upload " +
        fileName +
        " to My Drive / " +
        rootFolderPath +
        (folderPath ? " / " + folderPath : "") +
        "?",
    );

    if (!confirmed) {
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const uploaded = await uploadImportantDocument(file, {
        rootFolderPath,
        folderPath,
        fileName,
      });

      setMessage("Uploaded " + uploaded.name + ".");
      setFile(null);
      setFileName("");
      setFolderPath("");
      await loadDocuments(1);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Could not upload the document.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function saveEdit() {
    if (!editing) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await updateImportantDocument(editing.id, {
        rootFolderPath,
        fileName: editName.trim() || undefined,
        folderPath: editFolderPath.trim() || undefined,
      });

      setMessage("Updated " + result.name + ".");
      setEditing(null);
      await loadDocuments(page);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Could not update the document.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function remove(document: ImportantDocument) {
    const confirmed = window.confirm(
      "Move " + document.name + " to Google Drive trash?",
    );

    if (!confirmed) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      await deleteImportantDocument(document.id, rootFolderPath);
      setMessage(document.name + " was moved to Drive trash.");
      await loadDocuments(page);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Could not delete the document.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <AppHeader />

      <main className={styles.page}>
        <header className={styles.hero}>
          <div className={styles.heroCopy}>
            <Link className={styles.backLink} href="/">
              <ArrowLeft aria-hidden="true" size={16} />
              All tools
            </Link>

            <p className={styles.eyebrow}>Personal document vault</p>
            <h1>Keep the important things within reach.</h1>
            <p className={styles.intro}>
              Upload, organise, and find the documents that matter
              most — all in your own Google Drive.
            </p>
          </div>

          <aside className={styles.heroPanel}>
            <div className={styles.heroPanelIcon}>
              <FileArchive aria-hidden="true" size={25} />
            </div>
            <p>Your secure workspace</p>
            <strong>Google Drive, organised around you.</strong>
            <span>
              Files remain in your Drive and are never copied into
              Kull.
            </span>
          </aside>
        </header>

        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}

        {message && (
          <p className={styles.notice} role="status">
            <CheckCircle2 aria-hidden="true" size={18} />
            {message}
          </p>
        )}

        <div className={styles.workspace}>
          <section className={styles.setupCard}>
            <div className={styles.cardHeading}>
              <div className={styles.cardIcon}>
                <FolderCog aria-hidden="true" size={21} />
              </div>
              <div>
                <p className={styles.cardEyebrow}>Setup & upload</p>
                <h2>Store a document</h2>
              </div>
            </div>

            {loadingConnection ? (
              <div className={styles.connectionState}>
                Checking Google Drive connection…
              </div>
            ) : connected ? (
              <div className={styles.connectionState}>
                <CheckCircle2 aria-hidden="true" size={18} />
                Google Drive connected
              </div>
            ) : (
              <div className={styles.connectionPrompt}>
                <p>Connect Drive before uploading your first file.</p>
                <button
                  className={styles.primaryButton}
                  onClick={connectGoogleDrive}
                  type="button"
                >
                  Connect Google Drive
                  <ArrowUpRight aria-hidden="true" size={16} />
                </button>
              </div>
            )}

            <div className={styles.formSection}>
              <div className={styles.sectionTitle}>
                <span>1</span>
                <p>Choose where it belongs</p>
              </div>

              <label className={styles.field}>
                <span>Root folder</span>
                <input
                  onChange={(event) => {
                    setRootFolderPath(event.target.value);
                    setDocumentsPage(null);
                  }}
                  placeholder={DEFAULT_ROOT}
                  value={rootFolderPath}
                />
              </label>

              <button
                className={styles.quietButton}
                disabled={!connected || loading}
                onClick={() => {
                  void prepareRoot();
                }}
                type="button"
              >
                <FolderPlus aria-hidden="true" size={16} />
                Prepare root folder
              </button>

              <label className={styles.field}>
                <span>Subfolder <em>Optional</em></span>
                <input
                  onChange={(event) => {
                    setFolderPath(event.target.value);
                  }}
                  placeholder="Identity / Passport"
                  value={folderPath}
                />
              </label>
            </div>

            <div className={styles.formSection}>
              <div className={styles.sectionTitle}>
                <span>2</span>
                <p>Add your file</p>
              </div>

              <label className={styles.fileInput}>
                <input onChange={chooseFile} type="file" />
                <span className={styles.fileInputIcon}>
                  <Upload aria-hidden="true" size={22} />
                </span>
                <strong>{file ? file.name : "Choose a document"}</strong>
                <small>
                  {file
                    ? displaySize(String(file.size)) + " selected"
                    : "PDF, image, or document · up to 20 MB"}
                </small>
              </label>

              <label className={styles.field}>
                <span>File name in Google Drive</span>
                <input
                  onChange={(event) => {
                    setFileName(event.target.value);
                  }}
                  placeholder="passport-2026.pdf"
                  value={fileName}
                />
              </label>

              <button
                className={styles.primaryButton}
                disabled={!connected || !file || loading}
                onClick={() => {
                  void upload();
                }}
                type="button"
              >
                <Upload aria-hidden="true" size={17} />
                Upload document
              </button>
            </div>
          </section>

          <section className={styles.documentsCard}>
            <div className={styles.documentsHeader}>
              <div className={styles.cardHeading}>
                <div className={styles.cardIcon}>
                  <FileText aria-hidden="true" size={21} />
                </div>
                <div>
                  <p className={styles.cardEyebrow}>Your library</p>
                  <h2>Find and manage documents</h2>
                </div>
              </div>
              {documentsPage && (
                <span className={styles.documentCount}>
                  {documentsPage.total} document
                  {documentsPage.total === 1 ? "" : "s"}
                </span>
              )}
            </div>

            <div className={styles.searchPanel}>
              <div className={styles.searchField}>
                <Search aria-hidden="true" size={18} />
                <input
                  aria-label="Search documents"
                  onChange={(event) => {
                    setQuery(event.target.value);
                  }}
                  placeholder="Search by file name"
                  value={query}
                />
              </div>

              <div className={styles.filterRow}>
                <label>
                  <span>Sort by</span>
                  <select
                    aria-label="Sort documents"
                    onChange={(event) => {
                      setSortBy(
                        event.target.value as ImportantDocumentSortBy,
                      );
                    }}
                    value={sortBy}
                  >
                    <option value="date">Date added</option>
                    <option value="name">Name</option>
                    <option value="type">File type</option>
                  </select>
                </label>

                <label>
                  <span>Direction</span>
                  <select
                    aria-label="Sort direction"
                    onChange={(event) => {
                      setSortDirection(
                        event.target.value as SortDirection,
                      );
                    }}
                    value={sortDirection}
                  >
                    <option value="desc">Newest first</option>
                    <option value="asc">Oldest first</option>
                  </select>
                </label>

                <button
                  className={styles.searchButton}
                  disabled={!connected || loading}
                  onClick={() => {
                    void loadDocuments(1);
                  }}
                  type="button"
                >
                  <Search aria-hidden="true" size={16} />
                  Search
                </button>
              </div>
            </div>

            {documentsPage?.truncated && (
              <p className={styles.infoMessage}>
                Showing the first 1,000 matches. Refine your search
                to narrow the results.
              </p>
            )}

            {loading && (
              <div className={styles.loadingState}>
                Loading your documents…
              </div>
            )}

            {!loading &&
              documentsPage &&
              documentsPage.documents.length === 0 && (
                <div className={styles.emptyState}>
                  <span>
                    <FileText aria-hidden="true" size={26} />
                  </span>
                  <h3>No documents found</h3>
                  <p>Try a different search or upload a new file.</p>
                </div>
              )}

            {!documentsPage && !loading && (
              <div className={styles.emptyState}>
                <span>
                  <Search aria-hidden="true" size={26} />
                </span>
                <h3>Your library is ready</h3>
                <p>
                  Search your selected root folder to see its
                  documents here.
                </p>
              </div>
            )}

            <div className={styles.documentList}>
              {documentsPage?.documents.map((document) => (
                <article className={styles.document} key={document.id}>
                  <div className={styles.documentIcon}>
                    <FileText aria-hidden="true" size={20} />
                  </div>

                  <div className={styles.documentDetails}>
                    <p className={styles.documentName}>{document.name}</p>
                    <p className={styles.documentMeta}>
                      {document.folderPath || rootFolderPath}
                      <span>•</span>
                      {document.mimeType}
                      <span>•</span>
                      {displayDate(document.modifiedTime)}
                      {document.size && (
                        <>
                          <span>•</span>
                          {displaySize(document.size)}
                        </>
                      )}
                    </p>

                    {document.webViewLink && (
                      <a
                        className={styles.driveLink}
                        href={document.webViewLink}
                        rel="noreferrer"
                        target="_blank"
                      >
                        Open in Google Drive
                        <ArrowUpRight aria-hidden="true" size={14} />
                      </a>
                    )}

                    {editing?.id === document.id && (
                      <div className={styles.editForm}>
                        <label className={styles.field}>
                          <span>New file name</span>
                          <input
                            onChange={(event) => {
                              setEditName(event.target.value);
                            }}
                            value={editName}
                          />
                        </label>
                        <label className={styles.field}>
                          <span>New subfolder <em>Optional</em></span>
                          <input
                            onChange={(event) => {
                              setEditFolderPath(event.target.value);
                            }}
                            placeholder="New subfolder path"
                            value={editFolderPath}
                          />
                        </label>
                        <div className={styles.editActions}>
                          <button
                            className={styles.primaryButton}
                            disabled={loading}
                            onClick={() => {
                              void saveEdit();
                            }}
                            type="button"
                          >
                            Save changes
                          </button>
                          <button
                            className={styles.textButton}
                            onClick={() => {
                              setEditing(null);
                            }}
                            type="button"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className={styles.documentActions}>
                    <button
                      aria-label={"Rename or move " + document.name}
                      className={styles.iconButton}
                      onClick={() => {
                        setEditing(document);
                        setEditName(document.name);
                        setEditFolderPath("");
                      }}
                      title="Rename or move"
                      type="button"
                    >
                      <Pencil aria-hidden="true" size={16} />
                    </button>
                    <button
                      aria-label={"Delete " + document.name}
                      className={styles.deleteButton}
                      onClick={() => {
                        void remove(document);
                      }}
                      title="Move to Drive trash"
                      type="button"
                    >
                      <Trash2 aria-hidden="true" size={16} />
                    </button>
                  </div>
                </article>
              ))}
            </div>

            {documentsPage && (
              <div className={styles.pagination}>
                <span>
                  Page {documentsPage.page} of {documentsPage.totalPages}
                </span>
                <div>
                  <button
                    aria-label="Previous page"
                    className={styles.iconButton}
                    disabled={loading || documentsPage.page === 1}
                    onClick={() => {
                      void loadDocuments(documentsPage.page - 1);
                    }}
                    type="button"
                  >
                    <ChevronLeft aria-hidden="true" size={18} />
                  </button>
                  <button
                    aria-label="Next page"
                    className={styles.iconButton}
                    disabled={loading || !documentsPage.hasNextPage}
                    onClick={() => {
                      void loadDocuments(documentsPage.page + 1);
                    }}
                    type="button"
                  >
                    <ChevronRight aria-hidden="true" size={18} />
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
    </>
  );
}
