import type {
  CreateMedicineTransactionInput,
  MedicineTransactionDetail,
  MedicineTransactionSummary,
  UpdateMedicineTransactionInput,
} from "@kull/contracts";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:3001";

/*
 * HELPER 1
 *
 * Reads an error message returned by NestJS.
 */
async function getErrorMessage(
  response: Response,
): Promise<string> {
  const data = (await response
    .json()
    .catch(() => null)) as {
    message?: string | string[];
  } | null;

  if (Array.isArray(data?.message)) {
    return data.message.join(" ");
  }

  if (typeof data?.message === "string") {
    return data.message;
  }

  return "The request could not be completed.";
}

/*
 * HELPER 2
 *
 * Checks whether a request succeeded.
 */
async function checkResponse(
  response: Response,
): Promise<void> {
  if (response.status === 401) {
    window.location.href = "/activities/login";

    throw new Error(
      "Log in to access Medicine Tracker.",
    );
  }

  if (!response.ok) {
    const message =
      await getErrorMessage(response);

    throw new Error(message);
  }
}

/*
 * GET ALL TRANSACTIONS
 */
export async function getMedicineTransactions(): Promise<
  MedicineTransactionSummary[]
> {
  const response = await fetch(
    `${API_URL}/medicine-transactions`,
    {
      credentials: "include",
      cache: "no-store",
    },
  );

  await checkResponse(response);

  return response.json();
}

/*
 * GET ONE TRANSACTION
 */
export async function getMedicineTransaction(
  transactionId: string,
): Promise<MedicineTransactionDetail> {
  const response = await fetch(
    `${API_URL}/medicine-transactions/${transactionId}`,
    {
      credentials: "include",
      cache: "no-store",
    },
  );

  await checkResponse(response);

  return response.json();
}

/*
 * CREATE A TRANSACTION
 */
export async function createMedicineTransaction(
  input: CreateMedicineTransactionInput,
): Promise<MedicineTransactionDetail> {
  const response = await fetch(
    `${API_URL}/medicine-transactions`,
    {
      method: "POST",

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

/*
 * UPDATE A TRANSACTION
 */
export async function updateMedicineTransaction(
  transactionId: string,
  input: UpdateMedicineTransactionInput,
): Promise<MedicineTransactionDetail> {
  const response = await fetch(
    `${API_URL}/medicine-transactions/${transactionId}`,
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

/*
 * DELETE A TRANSACTION
 */
export async function deleteMedicineTransaction(
  transactionId: string,
): Promise<void> {
  const response = await fetch(
    `${API_URL}/medicine-transactions/${transactionId}`,
    {
      method: "DELETE",
      credentials: "include",
    },
  );

  await checkResponse(response);
}