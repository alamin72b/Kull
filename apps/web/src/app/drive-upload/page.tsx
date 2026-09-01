
"use client";

import type {
  DrivePathCheckResult,
  DriveUploadResult,
} from "@kull/contracts";

import Link from "next/link";

import {
  useEffect,
  useState,
} from "react";

import {
  checkDrivePath,
  connectGoogleDrive,
  getDriveStatus,
  uploadToDrive,
} from "../../features/drive-upload/drive-upload.api";

import styles from "../../features/drive-upload/drive-upload.module.css";

export default function DriveUploadPage() {
  /*
   * ---------------------------------------------------------
   * FILE
   * ---------------------------------------------------------
   */
  const [file, setFile] =
    useState<File | null>(null);

  /*
   * ---------------------------------------------------------
   * GOOGLE DRIVE CONNECTION
   * ---------------------------------------------------------
   */
  const [isConnected, setIsConnected] =
    useState(false);

  /*
   * ---------------------------------------------------------
   * PATH
   * ---------------------------------------------------------
   */
  const [folderPath, setFolderPath] =
    useState("");

  /*
   * Result of path checking.
   */
  const [pathCheck, setPathCheck] =
    useState<DrivePathCheckResult | null>(
      null,
    );

  /*
   * Upload result.
   */
  const [uploadedFile, setUploadedFile] =
    useState<DriveUploadResult | null>(
      null,
    );

  /*
   * ---------------------------------------------------------
   * LOADING STATES
   * ---------------------------------------------------------
   */
  const [isLoadingStatus, setIsLoadingStatus] =
    useState(true);

  const [isChecking, setIsChecking] =
    useState(false);

  const [isUploading, setIsUploading] =
    useState(false);

  /*
   * ---------------------------------------------------------
   * ERROR
   * ---------------------------------------------------------
   */
  const [error, setError] =
    useState("");

  /*
   * ---------------------------------------------------------
   * SUCCESS MESSAGE
   * ---------------------------------------------------------
   */
  const [connectedMessage, setConnectedMessage] =
    useState("");

  /*
   * ---------------------------------------------------------
   * LOAD DRIVE STATUS
   * ---------------------------------------------------------
   */
  useEffect(() => {
    async function loadStatus() {
      try {
        const result =
          await getDriveStatus();

        setIsConnected(
          result.connected,
        );

        const params =
          new URLSearchParams(
            window.location.search,
          );

        if (
          params.get("connected") ===
          "true"
        ) {
          setConnectedMessage(
            "Google Drive connected successfully.",
          );

          window.history.replaceState(
            {},
            "",
            "/drive-upload",
          );
        }
      } catch (caughtError) {
        if (
          caughtError instanceof Error
        ) {
          setError(
            caughtError.message,
          );
        } else {
          setError(
            "Could not check Google Drive connection.",
          );
        }
      } finally {
        setIsLoadingStatus(
          false,
        );
      }
    }

    loadStatus();
  }, []);

  /*
   * ---------------------------------------------------------
   * HELPER
   * ---------------------------------------------------------
   *
   * When the path changes,
   * the old path-check becomes invalid.
   */
  function changeFolderPath(
    value: string,
  ) {
    setFolderPath(value);

    setPathCheck(null);

    setUploadedFile(null);

    setError("");
  }

  /*
   * ---------------------------------------------------------
   * CHOOSE FILE
   * ---------------------------------------------------------
   */
  function chooseFile(
    selectedFile: File | null,
  ) {
    setFile(selectedFile);

    setUploadedFile(null);

    setError("");
  }

  /*
   * ---------------------------------------------------------
   * CONNECT
   * ---------------------------------------------------------
   */
  function handleConnect() {
    setError("");

    connectGoogleDrive();
  }

  /*
   * ---------------------------------------------------------
   * CHECK PATH
   * ---------------------------------------------------------
   */
  async function handleCheckPath() {
    setError("");

    setUploadedFile(null);

    if (!isConnected) {
      setError(
        "Connect Google Drive first.",
      );

      return;
    }

    if (
      !folderPath.trim()
    ) {
      setError(
        "Enter a Google Drive folder path.",
      );

      return;
    }

    setIsChecking(true);

    try {
      const result =
        await checkDrivePath(
          folderPath,
        );

      setPathCheck(result);
    } catch (caughtError) {
      if (
        caughtError instanceof Error
      ) {
        setError(
          caughtError.message,
        );
      } else {
        setError(
          "The folder path could not be checked.",
        );
      }

      setPathCheck(null);
    } finally {
      setIsChecking(false);
    }
  }

  /*
   * ---------------------------------------------------------
   * UPLOAD
   * ---------------------------------------------------------
   */
  async function handleUpload() {
    setError("");

    setUploadedFile(null);

    if (!file) {
      setError(
        "Choose a file first.",
      );

      return;
    }

    if (!pathCheck) {
      setError(
        "Check the folder path first.",
      );

      return;
    }

    /*
     * Show the path one final time.
     */
    const confirmed =
      window.confirm(
        `Please confirm this Google Drive destination:\n\nMy Drive / ${pathCheck.folderPath}\n\nFile: ${file.name}\n\nUpload this file?`,
      );

    if (!confirmed) {
      return;
    }

    setIsUploading(true);

    try {
      const result =
        await uploadToDrive(
          file,
          pathCheck.folderPath,
        );

      setUploadedFile(
        result,
      );
    } catch (caughtError) {
      if (
        caughtError instanceof Error
      ) {
        setError(
          caughtError.message,
        );
      } else {
        setError(
          "The file could not be uploaded.",
        );
      }
    } finally {
      setIsUploading(
        false,
      );
    }
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link
          className={styles.backLink}
          href="/"
        >
          ← Kull home
        </Link>

        <p className={styles.eyebrow}>
          Kull / Drive Upload
        </p>

        <h1>
          Upload to Google Drive
        </h1>

        <p>
          Choose a file, enter its
          destination path, check the path,
          confirm it, and upload.
        </p>
      </header>

      {connectedMessage && (
        <div
          className={styles.successMessage}
        >
          {connectedMessage}
        </div>
      )}

      <section className={styles.card}>
        <h2>
          1. Connect Google Drive
        </h2>

        {isLoadingStatus ? (
          <p>
            Checking connection...
          </p>
        ) : isConnected ? (
          <div
            className={styles.connected}
          >
            Google Drive is connected.
          </div>
        ) : (
          <>
            <p>
              Connect your own Google account
              before uploading.
            </p>

            <button
              className={
                styles.primaryButton
              }
              onClick={
                handleConnect
              }
              type="button"
            >
              Connect Google Drive
            </button>
          </>
        )}
      </section>

      <section className={styles.card}>
        <h2>
          2. Choose a file
        </h2>

        <label className={styles.fileBox}>
          <span>
            {file
              ? file.name
              : "Choose a file"}
          </span>

          <input
            type="file"
            onChange={(event) => {
              chooseFile(
                event.target.files?.[0] ??
                  null,
              );
            }}
          />
        </label>

        {file && (
          <p>
            Selected:
            <strong>
              {" "}
              {file.name}
            </strong>
          </p>
        )}
      </section>

      <section className={styles.card}>
        <h2>
          3. Enter the Drive folder path
        </h2>

        <p className={styles.helpText}>
          Example:
        </p>

        <code>
          Projects/Kull/Reports
        </code>

        <label className={styles.field}>
          Destination folder path

          <input
            value={folderPath}
            onChange={(event) =>
              changeFolderPath(
                event.target.value,
              )
            }
            placeholder="Projects/Kull/Reports"
          />
        </label>

        <button
          className={
            styles.primaryButton
          }
          disabled={
            isChecking ||
            !isConnected
          }
          onClick={
            handleCheckPath
          }
          type="button"
        >
          {isChecking
            ? "Checking..."
            : "Check path"}
        </button>
      </section>

      {pathCheck && (
        <section
          className={
            styles.confirmationCard
          }
        >
          <h2>
            4. Review the path
          </h2>

          <div
            className={
              styles.pathDisplay
            }
          >
            My Drive /{" "}
            {pathCheck.folderPath}
          </div>

          {pathCheck.folderExists ? (
            <div
              className={
                styles.successBox
              }
            >
              <strong>
                This folder path already
                exists.
              </strong>

              <p>
                No folders will be created.
              </p>
            </div>
          ) : (
            <div
              className={
                styles.warningBox
              }
            >
              <strong>
                Some folders do not exist.
              </strong>

              <p>
                Kull will create:
              </p>

              <ul>
                {pathCheck.missingFolders.map(
                  (folder) => (
                    <li key={folder}>
                      {folder}
                    </li>
                  ),
                )}
              </ul>
            </div>
          )}

          <p className={styles.confirmText}>
            Check the complete path before
            uploading.
          </p>

          <button
            className={
              styles.uploadButton
            }
            disabled={isUploading}
            onClick={
              handleUpload
            }
            type="button"
          >
            {isUploading
              ? "Uploading..."
              : "Confirm path & upload"}
          </button>
        </section>
      )}

      {error && (
        <div className={styles.errorBox}>
          {error}
        </div>
      )}

      {uploadedFile && (
        <section
          className={
            styles.successCard
          }
        >
          <h2>
            Upload complete
          </h2>

          <p>
            <strong>
              {uploadedFile.name}
            </strong>{" "}
            was uploaded successfully.
          </p>

          <p>
            Destination:
          </p>

          <div
            className={
              styles.pathDisplay
            }
          >
            My Drive /{" "}
            {uploadedFile.folderPath}
          </div>

          {uploadedFile.webViewLink && (
            <a
              className={
                styles.primaryButton
              }
              href={
                uploadedFile.webViewLink
              }
              target="_blank"
              rel="noreferrer"
            >
              Open file in Drive
            </a>
          )}
        </section>
      )}
    </main>
  );
}