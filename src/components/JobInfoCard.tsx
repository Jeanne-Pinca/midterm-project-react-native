import { MaterialCommunityIcons } from "@expo/vector-icons";
import { memo, ReactNode } from "react";
import { Image, Linking, StyleSheet, Text, View } from "react-native";

import { Job } from "../context/JobContext";
import InfoCapsule from "./InfoCapsule";

type JobInfoCardProps = {
  job: Job;
  footer?: ReactNode;
};

const CURRENCY_SYMBOL_BY_CODE: Record<string, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  JPY: "¥",
  INR: "₹",
  RUB: "₽",
  CNY: "¥",
  KRW: "₩",
  PHP: "₱",
  BTC: "₿",
};

function formatSalaryAmount(value: string): string {
  const normalizedValue = value.trim().replace(/,/g, "");
  const parsedValue = Number(normalizedValue);

  if (Number.isNaN(parsedValue)) {
    return value;
  }

  return parsedValue.toLocaleString();
}

function getCurrencySymbol(job: Job): string {
  const currencyCode = job.currency.trim().toUpperCase();
  return CURRENCY_SYMBOL_BY_CODE[currencyCode] || "";
}

function getSalaryBoundaryDisplay(
  value: string,
  currencySymbol: string,
): string {
  const normalizedValue = value.trim();

  if (!normalizedValue || normalizedValue.toLowerCase() === "not specified") {
    return "N/A";
  }

  return `${currencySymbol}${formatSalaryAmount(normalizedValue)}`;
}

function getCombinedSalaryDisplay(
  minSalary: string,
  maxSalary: string,
): string {
  if (minSalary === "N/A" && maxSalary === "N/A") {
    return "N/A";
  }

  if (minSalary === "N/A") {
    return `Up to ${maxSalary}`;
  }

  if (maxSalary === "N/A") {
    return `${minSalary}+`;
  }

  return `${minSalary}–${maxSalary}`;
}

function formatDisplayDate(value: string): string {
  const normalizedValue = value.trim();

  if (
    !normalizedValue ||
    normalizedValue.toLowerCase() === "not specified" ||
    normalizedValue.toLowerCase() === "n/a"
  ) {
    return "N/A";
  }

  let parsedDate = new Date(normalizedValue);

  if (Number.isNaN(parsedDate.getTime())) {
    const slashDateMatch = normalizedValue.match(
      /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/,
    );

    if (slashDateMatch) {
      const month = Number(slashDateMatch[1]);
      const day = Number(slashDateMatch[2]);
      const year = Number(slashDateMatch[3]);
      parsedDate = new Date(year, month - 1, day);
    }
  }

  if (Number.isNaN(parsedDate.getTime())) {
    return normalizedValue;
  }

  const month = parsedDate.toLocaleString("en-US", { month: "long" });
  const day = String(parsedDate.getDate());
  const year = parsedDate.getFullYear();

  return `${month} ${day}, ${year}`;
}

function normalizeCompanyLinkUrl(rawValue?: string): string | null {
  const normalizedValue = rawValue?.trim() || "";

  if (!normalizedValue || normalizedValue.toLowerCase() === "n/a") {
    return null;
  }

  if (/^https?:\/\//i.test(normalizedValue)) {
    return normalizedValue;
  }

  if (normalizedValue.startsWith("//")) {
    return `https:${normalizedValue}`;
  }

  return `https://${normalizedValue.replace(/^\/+/, "")}`;
}

const JobInfoCard = memo(function JobInfoCard({
  job,
  footer,
}: JobInfoCardProps) {
  const currencySymbol = getCurrencySymbol(job);
  const minSalaryDisplay = getSalaryBoundaryDisplay(
    job.minSalary,
    currencySymbol,
  );
  const maxSalaryDisplay = getSalaryBoundaryDisplay(
    job.maxSalary,
    currencySymbol,
  );
  const salaryDisplay = getCombinedSalaryDisplay(
    minSalaryDisplay,
    maxSalaryDisplay,
  );
  const companyLinkUrl = normalizeCompanyLinkUrl(job.guid || job.applyUrl);
  const publishedDateDisplay = formatDisplayDate(job.publishedDate);
  const expiryDateDisplay = formatDisplayDate(job.expiryDate);
  const locationDisplay =
    job.locations.length > 0 ? job.locations.join(", ") : "N/A";
  const tagItems =
    job.tags.length > 0
      ? [...job.tags].sort((firstTag, secondTag) =>
          firstTag.localeCompare(secondTag),
        )
      : ["N/A"];

  const handleOpenCompanyLink = () => {
    if (!companyLinkUrl) {
      return;
    }

    void Linking.openURL(companyLinkUrl);
  };

  return (
    <View style={styles.card}>
      <View style={styles.jobHeaderRow}>
        <View style={styles.jobHeaderInfoContainer}>
          <Text style={styles.jobTitleWithLogo}>{job.title}</Text>
          <Text style={styles.companyText}>{job.company}</Text>
        </View>
        {job.companyLogo ? (
          <Image
            source={{ uri: job.companyLogo }}
            style={styles.cardLogo}
            resizeMode="contain"
          />
        ) : null}
      </View>

      <View style={styles.detailsSection}>
        <View style={styles.detailsColumns}>
          <View style={styles.detailsColumnBox}>
            <View style={styles.detailsColumn}>
              <InfoCapsule text={job.mainCategory} iconName="shape" />
              <InfoCapsule
                text={job.seniorityLevel || "N/A"}
                iconName="account-tie-outline"
              />
              <InfoCapsule
                text={`${job.jobType}, ${job.workModel}`}
                iconName="briefcase-outline"
              />
              <InfoCapsule
                text={companyLinkUrl ? "Link" : "N/A"}
                iconName="link-variant"
                onPress={companyLinkUrl ? handleOpenCompanyLink : undefined}
              />
            </View>
          </View>

          <View style={styles.detailsColumnBox}>
            <View style={styles.detailsColumn}>
              <InfoCapsule text={salaryDisplay} iconName="cash" />
              <InfoCapsule text={locationDisplay} iconName="map-marker" />
              <InfoCapsule
                text={publishedDateDisplay}
                iconName="clock-outline"
              />
              <InfoCapsule text={expiryDateDisplay} iconName="calendar-clock" />
            </View>
          </View>
        </View>

        <View style={styles.tagsCapsuleRow}>
          <MaterialCommunityIcons
            name="tag"
            size={16}
            color="#6b7280"
            style={styles.tagIcon}
          />
          <View style={styles.tagsCapsulesWrap}>
            {tagItems.map((tag, index) => (
              <InfoCapsule
                key={`${job.id}-tag-${index}`}
                text={tag}
                expand={false}
              />
            ))}
          </View>
        </View>
      </View>

      {footer}
    </View>
  );
});

export default JobInfoCard;

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    overflow: "hidden",
  },
  jobHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
    gap: 8,
  },
  jobHeaderInfoContainer: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  jobTitleWithLogo: {
    fontSize: 18,
    fontWeight: "700",
    flexShrink: 1,
  },
  cardLogo: {
    width: 44,
    height: 44,
    borderRadius: 8,
    flexShrink: 0,
    overflow: "hidden",
    backgroundColor: "#f3f4f6",
  },
  companyText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    flexShrink: 1,
  },
  detailsSection: {
    gap: 8,
    marginBottom: 8,
  },
  detailsColumns: {
    flexDirection: "row",
    gap: 8,
  },
  detailsColumnBox: {
    flex: 1,
    minWidth: 0,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    padding: 10,
    backgroundColor: "#fff",
  },
  detailsColumn: {
    gap: 8,
  },
  tagsCapsuleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
  },
  tagsCapsulesWrap: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  tagIcon: {
    marginTop: 6,
  },
});
