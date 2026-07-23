export const vendorCategories = [
  "Venue",
  "Catering",
  "Decor",
  "Photography",
  "Priest",
  "Planning",
  "Music",
  "Beauty",
  "Transport",
  "Other"
] as const;

export type VendorCategory = (typeof vendorCategories)[number];

export const vendorStatuses = [
  "Researching",
  "Contacted",
  "Quote Received",
  "Shortlisted",
  "Booked",
  "Rejected",
  "Cancelled"
] as const;

export type VendorStatus = (typeof vendorStatuses)[number];

export type Vendor = {
  id: string;
  name: string;
  category: VendorCategory;
  status: VendorStatus;
  eventIds: string[];
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  notes: string;
};

export type VendorInput = Omit<Vendor, "id">;

export type VendorPipelineStatusSummary = {
  status: VendorStatus;
  total: number;
  categories: Array<{
    category: VendorCategory;
    total: number;
  }>;
};

export function normalizeVendorCategory(
  value: FormDataEntryValue | null
): VendorCategory {
  const category = vendorCategories.find((candidate) => candidate === value);

  if (!category) {
    throw new Error("Vendor Category is required.");
  }

  return category;
}

export function assertValidVendorCategory(category: VendorCategory) {
  if (!vendorCategories.includes(category)) {
    throw new Error("Vendor Category is required.");
  }
}

export function normalizeVendorStatus(
  value: FormDataEntryValue | null
): VendorStatus {
  return vendorStatuses.find((status) => status === value) ?? "Researching";
}

export function assertValidVendorStatus(status: VendorStatus) {
  if (!vendorStatuses.includes(status)) {
    throw new Error("Vendor Status is invalid.");
  }
}

export function createVendorRecord(id: string, input: VendorInput): Vendor {
  assertValidVendorCategory(input.category);
  assertValidVendorStatus(input.status);

  return {
    ...input,
    id
  };
}

export function normalizeVendorEventIds(
  values: FormDataEntryValue[],
  validEventIds: Set<string>
) {
  return Array.from(
    new Set(
      values.filter(
        (value): value is string =>
          typeof value === "string" && validEventIds.has(value)
      )
    )
  );
}

export function applyVendorStatus(
  vendor: Vendor,
  status: VendorStatus
): Vendor {
  return {
    ...vendor,
    status
  };
}

export function calculateVendorPipeline(vendors: Vendor[]) {
  return vendorStatuses.map((status) => {
    const vendorsForStatus = vendors.filter((vendor) => vendor.status === status);

    return {
      status,
      total: vendorsForStatus.length,
      categories: vendorCategories
        .map((category) => ({
          category,
          total: vendorsForStatus.filter((vendor) => vendor.category === category).length
        }))
        .filter((summary) => summary.total > 0)
    };
  });
}
