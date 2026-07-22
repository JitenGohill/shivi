import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export type Wedding = {
  id: "single-wedding";
  name: string;
  coupleNames: string;
  date: string;
  location: string;
  notes: string;
};

const defaultWedding: Wedding = {
  id: "single-wedding",
  name: "Anaya & Rohan Wedding",
  coupleNames: "Anaya & Rohan",
  date: "2027-02-14",
  location: "Ahmedabad, Gujarat",
  notes: "A private planning workspace for the bride and trusted Collaborators."
};

const dataFilePath =
  process.env.WEDDING_DATA_PATH ?? path.join(process.cwd(), "data", "wedding.json");

export async function getWedding(): Promise<Wedding> {
  try {
    const contents = await readFile(dataFilePath, "utf8");
    return { ...defaultWedding, ...JSON.parse(contents), id: "single-wedding" };
  } catch (error) {
    if (isMissingFileError(error)) {
      await saveWedding(defaultWedding);
      return defaultWedding;
    }

    throw error;
  }
}

export async function saveWedding(wedding: Wedding): Promise<void> {
  await mkdir(path.dirname(dataFilePath), { recursive: true });
  await writeFile(dataFilePath, `${JSON.stringify(wedding, null, 2)}\n`, "utf8");
}

export function normalizeWedding(input: FormData): Wedding {
  return {
    id: "single-wedding",
    name: cleanValue(input.get("name"), defaultWedding.name),
    coupleNames: cleanValue(input.get("coupleNames"), defaultWedding.coupleNames),
    date: cleanValue(input.get("date"), defaultWedding.date),
    location: cleanValue(input.get("location"), defaultWedding.location),
    notes: cleanValue(input.get("notes"), defaultWedding.notes)
  };
}

function cleanValue(value: FormDataEntryValue | null, fallback: string) {
  if (typeof value !== "string") {
    return fallback;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : fallback;
}

function isMissingFileError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "ENOENT"
  );
}
