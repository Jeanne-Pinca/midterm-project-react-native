import {
    createContext,
    createElement,
    ReactNode,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";
import { Linking } from "react-native";
import uuid from "react-native-uuid";

type ApiJob = {
  title?: string;
  mainCategory?: string;
  companyName?: string;
  companyLogo?: string;
  jobType?: string;
  workModel?: string;
  seniorityLevel?: string;
  minSalary?: string | number | null;
  maxSalary?: string | number | null;
  currency?: string;
  locations?: string[];
  tags?: string[];
  description?: string;
  pubDate?: number;
  expiryDate?: number;
  applicationLink?: string;
  guid?: string;

  company?: string;
  salary?: string | number;
  apply_url?: string;
  url?: string;
  link?: string;
  location?: string;
};

export type Job = {
  id: string;
  title: string;
  company: string;
  mainCategory: string;
  companyLogo: string;
  jobType: string;
  workModel: string;
  seniorityLevel: string;
  salary: string;
  minSalary: string;
  maxSalary: string;
  currency: string;
  tags: string[];
  description: string;
  publishedDate: string;
  expiryDate: string;
  guid: string;
  applyUrl: string;
  locations: string[];
};

export type JobApplicationDetails = {
  name: string;
  email: string;
  contactNumber: string;
  whyHire: string;
  submittedAt: string;
};

type JobContextValue = {
  jobs: Job[];
  savedJobIds: string[];
  submittedJobIds: string[];
  applicationDetailsByJobId: Record<string, JobApplicationDetails>;
  isLoading: boolean;
  error: string | null;
  saveJob: (jobId: string) => void;
  unsaveJob: (jobId: string) => void;
  markJobAsSubmitted: (jobId: string) => void;
  submitJobApplication: (
    jobId: string,
    details: Omit<JobApplicationDetails, "submittedAt">,
  ) => void;
  applyToJob: (jobId: string) => Promise<void>;
  refreshJobs: () => Promise<void>;
};

const JobContext = createContext<JobContextValue | undefined>(undefined);

const JOBS_API_URL = "https://empllo.com/api/v1";
const generatedJobIdsByKey = new Map<string, string>();

function normalizeRemoteUrl(value?: string): string {
  const trimmedValue = value?.trim() || "";

  if (!trimmedValue) {
    return "";
  }

  if (/^https?:\/\//i.test(trimmedValue)) {
    return trimmedValue;
  }

  if (trimmedValue.startsWith("//")) {
    return `https:${trimmedValue}`;
  }

  if (trimmedValue.startsWith("assets.empllo.com/")) {
    return `https://${trimmedValue}`;
  }

  if (/^[a-z0-9-]+(\.[a-z0-9-]+)+\//i.test(trimmedValue)) {
    return `https://${trimmedValue}`;
  }

  return `https://assets.empllo.com/${trimmedValue.replace(/^\/+/, "")}`;
}

function toDisplayDate(value?: number): string {
  if (!value) {
    return "Not specified";
  }

  const date = new Date(value * 1000);

  if (Number.isNaN(date.getTime())) {
    return "Not specified";
  }

  return date.toLocaleDateString();
}

function toSalaryText(
  minSalary?: string | number | null,
  maxSalary?: string | number | null,
  currency?: string,
): string {
  const hasMin = minSalary !== null && minSalary !== undefined;
  const hasMax = maxSalary !== null && maxSalary !== undefined;

  if (!hasMin && !hasMax) {
    return "Not specified";
  }

  const prefix = currency ? `${currency} ` : "";

  if (hasMin && hasMax) {
    return `${prefix}${String(minSalary)} - ${String(maxSalary)}`;
  }

  if (hasMin) {
    return `${prefix}${String(minSalary)}+`;
  }

  return `${prefix}Up to ${String(maxSalary)}`;
}

function stripHtml(input?: string): string {
  if (!input) {
    return "Not specified";
  }

  const normalizedHtml = input
    .replace(/\\u003C/g, "<")
    .replace(/\\u003E/g, ">");

  const structuredText = normalizedHtml
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<li[^>]*>/gi, "\n• ")
    .replace(/<\/(li|p|div|h[1-6])>/gi, "\n")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/[ \t\f\v]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .split("\n")
    .map((line) => line.trim())
    .join("\n")
    .trim();

  return structuredText || "Not specified";
}

function normalizeIdPart(value?: string | number | null): string {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim().toLowerCase();
}

function buildStableJobKey(job: ApiJob): string {
  const directIdSources = [
    job.guid,
    job.applicationLink,
    job.apply_url,
    job.url,
    job.link,
  ];

  const directId = directIdSources.find((value) => normalizeIdPart(value));

  if (directId) {
    return normalizeIdPart(directId);
  }

  const fallbackIdParts = [
    job.title,
    job.companyName,
    job.company,
    job.mainCategory,
    job.jobType,
    job.workModel,
    Array.isArray(job.locations) ? job.locations.join("|") : job.location,
    Array.isArray(job.tags) ? job.tags.join("|") : "",
    job.description,
    job.pubDate,
    job.expiryDate,
  ]
    .map((part) => normalizeIdPart(part))
    .filter((part) => part.length > 0);

  return fallbackIdParts.length > 0 ? fallbackIdParts.join("|") : "unknown-job";
}

function getOrCreateJobId(job: ApiJob): string {
  const jobKey = buildStableJobKey(job);
  const existingId = generatedJobIdsByKey.get(jobKey);

  if (existingId) {
    return existingId;
  }

  const generatedId = String(uuid.v4());
  generatedJobIdsByKey.set(jobKey, generatedId);
  return generatedId;
}

function mapApiJobs(payload: unknown): Job[] {
  const sourceArray: unknown[] = Array.isArray(payload)
    ? payload
    : typeof payload === "object" && payload !== null
      ? (payload as { data?: unknown; jobs?: unknown }).jobs &&
        Array.isArray((payload as { jobs?: unknown }).jobs)
        ? ((payload as { jobs?: unknown }).jobs as unknown[])
        : (payload as { data?: unknown }).data &&
            Array.isArray((payload as { data?: unknown }).data)
          ? ((payload as { data?: unknown }).data as unknown[])
          : []
      : [];

  return sourceArray
    .filter((item): item is ApiJob => typeof item === "object" && item !== null)
    .map((job) => ({
      id: getOrCreateJobId(job),
      title: job.title?.trim() || "Untitled role",
      company:
        job.companyName?.trim() || job.company?.trim() || "Unknown company",
      mainCategory: job.mainCategory?.trim() || "Not specified",
      companyLogo: normalizeRemoteUrl(job.companyLogo),
      jobType: job.jobType?.trim() || "Not specified",
      workModel: job.workModel?.trim() || "Not specified",
      seniorityLevel: job.seniorityLevel?.trim() || "Not specified",
      minSalary:
        job.minSalary === null || job.minSalary === undefined
          ? "Not specified"
          : String(job.minSalary),
      maxSalary:
        job.maxSalary === null || job.maxSalary === undefined
          ? "Not specified"
          : String(job.maxSalary),
      currency: job.currency?.trim() || "",
      salary:
        job.salary !== null && job.salary !== undefined
          ? String(job.salary)
          : toSalaryText(job.minSalary, job.maxSalary, job.currency),
      locations: Array.isArray(job.locations)
        ? job.locations.filter(
            (value) => typeof value === "string" && value.trim().length > 0,
          )
        : job.location
          ? [job.location]
          : [],
      tags: Array.isArray(job.tags)
        ? job.tags.filter(
            (value) => typeof value === "string" && value.trim().length > 0,
          )
        : [],
      description: stripHtml(job.description),
      publishedDate: toDisplayDate(job.pubDate),
      expiryDate: toDisplayDate(job.expiryDate),
      guid: job.guid?.trim() || "",
      applyUrl:
        job.applicationLink ||
        job.apply_url ||
        job.url ||
        job.link ||
        job.guid ||
        "",
    }));
}

export function JobProvider({ children }: { children: ReactNode }) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [savedJobIds, setSavedJobIds] = useState<string[]>([]);
  const [submittedJobIds, setSubmittedJobIds] = useState<string[]>([]);
  const [applicationDetailsByJobId, setApplicationDetailsByJobId] = useState<
    Record<string, JobApplicationDetails>
  >({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const refreshJobs = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(JOBS_API_URL);

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const json = (await response.json()) as unknown;
      const mappedJobs = mapApiJobs(json);
      setJobs(mappedJobs);
    } catch {
      setError("Unable to load jobs right now.");
      setJobs([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void refreshJobs();
  }, []);

  const saveJob = (jobId: string) => {
    setSavedJobIds((current) =>
      current.includes(jobId) ? current : [...current, jobId],
    );
  };

  const unsaveJob = (jobId: string) => {
    setSavedJobIds((current) =>
      current.filter((savedJobId) => savedJobId !== jobId),
    );
  };

  const markJobAsSubmitted = (jobId: string) => {
    setSubmittedJobIds((current) =>
      current.includes(jobId) ? current : [...current, jobId],
    );
  };

  const submitJobApplication = (
    jobId: string,
    details: Omit<JobApplicationDetails, "submittedAt">,
  ) => {
    setApplicationDetailsByJobId((current) => ({
      ...current,
      [jobId]: {
        ...details,
        submittedAt: new Date().toLocaleString(),
      },
    }));

    markJobAsSubmitted(jobId);
  };

  const applyToJob = async (jobId: string) => {
    const selectedJob = jobs.find((job) => job.id === jobId);

    if (!selectedJob?.applyUrl) {
      return;
    }

    await Linking.openURL(selectedJob.applyUrl);
  };

  const value = useMemo(
    () => ({
      jobs,
      savedJobIds,
      submittedJobIds,
      applicationDetailsByJobId,
      isLoading,
      error,
      saveJob,
      unsaveJob,
      markJobAsSubmitted,
      submitJobApplication,
      applyToJob,
      refreshJobs,
    }),
    [
      jobs,
      savedJobIds,
      submittedJobIds,
      applicationDetailsByJobId,
      isLoading,
      error,
    ],
  );

  return createElement(JobContext.Provider, { value }, children);
}

export function useJobs() {
  const context = useContext(JobContext);

  if (!context) {
    throw new Error("useJobs must be used within a JobProvider");
  }

  return context;
}
