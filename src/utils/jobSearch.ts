import { Job } from "../context/JobContext";

type ScopedFilters = {
  category: string[];
  location: string[];
  jobType: string[];
  freeText: string;
};

const CATEGORY_PATTERN =
  /(?:^|\s)(?:category|cat)\s*:\s*([^:]+?)(?=\s+(?:category|cat|location|loc|job\s*type|jobtype|type)\s*:|$)/gi;
const LOCATION_PATTERN =
  /(?:^|\s)(?:location|loc)\s*:\s*([^:]+?)(?=\s+(?:category|cat|location|loc|job\s*type|jobtype|type)\s*:|$)/gi;
const JOB_TYPE_PATTERN =
  /(?:^|\s)(?:job\s*type|jobtype|type)\s*:\s*([^:]+?)(?=\s+(?:category|cat|location|loc|job\s*type|jobtype|type)\s*:|$)/gi;

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function extractTerms(
  query: string,
  pattern: RegExp,
): { terms: string[]; stripped: string } {
  const terms: string[] = [];
  const stripped = query.replace(pattern, (_, rawValue: string) => {
    const cleaned = normalize(rawValue);

    if (cleaned) {
      terms.push(cleaned);
    }

    return " ";
  });

  return { terms, stripped };
}

function parseSearchQuery(query: string): ScopedFilters {
  const normalizedQuery = normalize(query);

  if (!normalizedQuery) {
    return {
      category: [],
      location: [],
      jobType: [],
      freeText: "",
    };
  }

  const categoryResult = extractTerms(normalizedQuery, CATEGORY_PATTERN);
  const locationResult = extractTerms(
    categoryResult.stripped,
    LOCATION_PATTERN,
  );
  const jobTypeResult = extractTerms(locationResult.stripped, JOB_TYPE_PATTERN);

  const freeText = jobTypeResult.stripped.replace(/\s+/g, " ").trim();

  return {
    category: categoryResult.terms,
    location: locationResult.terms,
    jobType: jobTypeResult.terms,
    freeText,
  };
}

function containsAny(haystack: string, terms: string[]): boolean {
  if (terms.length === 0) {
    return true;
  }

  return terms.some((term) => haystack.includes(term));
}

export function filterJobsBySearchQuery(jobs: Job[], query: string): Job[] {
  const parsed = parseSearchQuery(query);

  if (
    !parsed.freeText &&
    parsed.category.length === 0 &&
    parsed.location.length === 0 &&
    parsed.jobType.length === 0
  ) {
    return jobs;
  }

  return jobs.filter((job) => {
    const categoryText = normalize(job.mainCategory);
    const locationText = normalize(job.locations.join(" "));
    const jobTypeText = normalize(`${job.jobType} ${job.workModel}`);

    const matchesCategory = containsAny(categoryText, parsed.category);
    const matchesLocation = containsAny(locationText, parsed.location);
    const matchesJobType = containsAny(jobTypeText, parsed.jobType);

    if (!matchesCategory || !matchesLocation || !matchesJobType) {
      return false;
    }

    if (!parsed.freeText) {
      return true;
    }

    const searchableText = [
      job.title,
      job.company,
      job.mainCategory,
      job.jobType,
      job.workModel,
      job.seniorityLevel,
      job.salary,
      job.currency,
      job.locations.join(" "),
      job.tags.join(" "),
      job.description,
      job.guid,
    ]
      .join(" ")
      .toLowerCase();

    return searchableText.includes(parsed.freeText);
  });
}
