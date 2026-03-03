import { MaterialCommunityIcons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useEffect, useRef, useState } from "react";
import { FlatList, Text, View } from "react-native";

import AppButton from "../../components/AppButton";
import BookmarkButton from "../../components/BookmarkButton";
import CircularBackButton from "../../components/CircularBackButton";
import JobInfoCard from "../../components/JobInfoCard";
import JobSaveStatusPrompt from "../../components/JobSaveStatusPrompt";
import { useJobApplicationState } from "../../components/hooks/useJobApplicationState";
import { useJobs } from "../../context/JobContext";
import { RootStackParamList } from "../index";
import { jobDetailsScreenStyles } from "./styles/jobDetailsScreenStyles";

type JobDetailsScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "JobDetails"
>;

type DescriptionBlock = {
  type: "heading" | "bullet" | "text";
  content: string;
};

const KNOWN_DESCRIPTION_HEADINGS = new Set([
  "description",
  "requirements",
  "responsibilities",
  "qualifications",
  "benefits",
  "preferred qualifications",
  "nice to have",
]);

function normalizeHeadingCandidate(value: string): string {
  return value
    .replace(/^#+\s*/, "")
    .replace(/[📋✅⭐🎯]/g, "")
    .replace(/[:：]\s*$/, "")
    .trim();
}

function removeEmojiCharacters(value: string): string {
  return value
    .replace(/[\u{1F300}-\u{1FAFF}]/gu, "")
    .replace(/[\u{2600}-\u{27BF}]/gu, "")
    .replace(/[\uFE0F]/g, "")
    .trim();
}

function isHeadingLine(value: string): boolean {
  const normalized = normalizeHeadingCandidate(value);
  const lowercase = normalized.toLowerCase();

  if (!normalized) {
    return false;
  }

  if (/^#{1,6}\s+/.test(value)) {
    return true;
  }

  if (KNOWN_DESCRIPTION_HEADINGS.has(lowercase)) {
    return true;
  }

  if (
    /[:：]\s*$/.test(value) &&
    normalized.length <= 60 &&
    normalized.split(/\s+/).length <= 8
  ) {
    return true;
  }

  return false;
}

function getBulletContent(value: string): string | null {
  const bulletMatch = value.match(
    /^(?:[•\-*\u2022\u25E6\u25AA]|\d+[\.)])\s+(.*)$/,
  );

  if (!bulletMatch) {
    return null;
  }

  return bulletMatch[1].trim();
}

function parseDescriptionBlocks(description: string): DescriptionBlock[] {
  const normalizedDescription = removeEmojiCharacters(description)
    .replace(/\r/g, "")
    .replace(/\u2022|\u25E6|\u25AA/g, "•")
    .replace(
      /\s*(Description|Requirements|Responsibilities|Qualifications|Benefits)\s*:?\s*/gi,
      "\n$1\n",
    )
    .replace(/\s*([*-])\s+/g, "\n• ")
    .replace(/\s*(\d+[\.)])\s+/g, "\n$1 ")
    .replace(/\s*•\s*/g, "\n• ")
    .replace(/\n{2,}/g, "\n")
    .trim();

  if (!normalizedDescription || normalizedDescription.toLowerCase() === "n/a") {
    return [{ type: "text", content: "N/A" }];
  }

  return normalizedDescription
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => {
      if (isHeadingLine(line)) {
        return {
          type: "heading",
          content: removeEmojiCharacters(normalizeHeadingCandidate(line)),
        } satisfies DescriptionBlock;
      }

      const bulletContent = getBulletContent(line);

      if (bulletContent) {
        return {
          type: "bullet",
          content: removeEmojiCharacters(bulletContent),
        } satisfies DescriptionBlock;
      }

      return {
        type: "text",
        content: removeEmojiCharacters(line),
      } satisfies DescriptionBlock;
    });
}

function getHeadingIconName(
  heading: string,
): keyof typeof MaterialCommunityIcons.glyphMap {
  const normalizedHeading = heading.trim().toLowerCase();

  if (normalizedHeading.includes("description")) {
    return "clipboard-text-outline";
  }

  if (normalizedHeading.includes("requirement")) {
    return "target";
  }

  if (normalizedHeading.includes("benefit")) {
    return "gift-outline";
  }

  return "text-box-outline";
}

function toTitleCase(value: string): string {
  return value
    .toLowerCase()
    .split(/\s+/)
    .filter((word) => word.length > 0)
    .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
    .join(" ");
}

export default function JobDetailsScreen({
  navigation,
  route,
}: JobDetailsScreenProps) {
  const [showSavePrompt, setShowSavePrompt] = useState<boolean>(false);
  const [savePromptMessage, setSavePromptMessage] = useState<string>(
    "Job has been saved.",
  );
  const promptTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { jobs, savedJobIds, saveJob, unsaveJob } = useJobs();
  const { getApplyButtonState } = useJobApplicationState();
  const selectedJob = jobs.find((job) => job.id === route.params.jobId);

  useEffect(() => {
    return () => {
      if (promptTimerRef.current) {
        clearTimeout(promptTimerRef.current);
      }
    };
  }, []);

  if (!selectedJob) {
    return (
      <View style={jobDetailsScreenStyles.container}>
        <Text style={jobDetailsScreenStyles.title}>Job Details</Text>
        <Text style={jobDetailsScreenStyles.errorText}>
          Selected job was not found.
        </Text>
        <AppButton label="Back" onPress={() => navigation.goBack()} />
      </View>
    );
  }

  const isSaved = savedJobIds.includes(selectedJob.id);
  const applyButtonState = getApplyButtonState(selectedJob.id);
  const isOpenedFromFinder = route.params.source === "finder";
  const isOpenedFromAppliedJobs = route.params.source === "appliedJobs";
  const isOpenedFromSavedJobs = route.params.source === "savedJobs";
  const shouldShowApplicationDetailsButton =
    (isOpenedFromAppliedJobs || isOpenedFromFinder || isOpenedFromSavedJobs) &&
    applyButtonState.isSubmitted;
  const descriptionBlocks = parseDescriptionBlocks(
    selectedJob.description || "N/A",
  );

  const showStatusPrompt = (message: string) => {
    setSavePromptMessage(message);
    setShowSavePrompt(true);

    if (promptTimerRef.current) {
      clearTimeout(promptTimerRef.current);
    }

    promptTimerRef.current = setTimeout(() => {
      setShowSavePrompt(false);
      promptTimerRef.current = null;
    }, 1800);
  };

  const handleSaveToggle = () => {
    if (isSaved) {
      unsaveJob(selectedJob.id);
      showStatusPrompt("Job has been unsaved.");
      return;
    }

    saveJob(selectedJob.id);
    showStatusPrompt("Job has been saved.");
  };

  return (
    <View style={jobDetailsScreenStyles.container}>
      <Text style={jobDetailsScreenStyles.title}>Job Details</Text>

      <FlatList
        data={[selectedJob]}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={jobDetailsScreenStyles.listContainer}
        renderItem={() => (
          <View>
            <JobInfoCard job={selectedJob} />

            <View style={jobDetailsScreenStyles.descriptionBox}>
              {descriptionBlocks.map((block, index) => {
                if (block.type === "heading") {
                  const headingIndex =
                    descriptionBlocks
                      .slice(0, index + 1)
                      .filter((item) => item.type === "heading").length - 1;

                  return (
                    <View
                      key={`desc-heading-${index}`}
                      style={[
                        jobDetailsScreenStyles.descriptionSectionRow,
                        headingIndex > 0 &&
                          jobDetailsScreenStyles.descriptionSectionRowSpaced,
                      ]}
                    >
                      <View
                        style={jobDetailsScreenStyles.descriptionSectionLine}
                      />

                      <View
                        style={jobDetailsScreenStyles.descriptionSectionContent}
                      >
                        <MaterialCommunityIcons
                          name={getHeadingIconName(block.content)}
                          size={18}
                          color="#4c1d95"
                        />
                        <Text
                          style={jobDetailsScreenStyles.descriptionSectionTitle}
                        >
                          {toTitleCase(block.content)}
                        </Text>
                      </View>

                      <View
                        style={jobDetailsScreenStyles.descriptionSectionLine}
                      />
                    </View>
                  );
                }

                if (block.type === "bullet") {
                  return (
                    <View
                      key={`desc-bullet-${index}`}
                      style={jobDetailsScreenStyles.descriptionBulletRow}
                    >
                      <Text style={jobDetailsScreenStyles.descriptionBulletDot}>
                        •
                      </Text>
                      <Text style={jobDetailsScreenStyles.descriptionText}>
                        {block.content}
                      </Text>
                    </View>
                  );
                }

                return (
                  <Text
                    key={`desc-text-${index}`}
                    style={jobDetailsScreenStyles.descriptionText}
                  >
                    {block.content}
                  </Text>
                );
              })}
            </View>

            <View style={jobDetailsScreenStyles.actionsRow}>
              <CircularBackButton onPress={() => navigation.goBack()} />
              <AppButton
                label={
                  shouldShowApplicationDetailsButton
                    ? "View Application Details"
                    : "Apply Job"
                }
                variant={
                  shouldShowApplicationDetailsButton
                    ? "primary"
                    : applyButtonState.variant
                }
                disabled={
                  shouldShowApplicationDetailsButton
                    ? false
                    : applyButtonState.disabled
                }
                onPress={() => {
                  if (shouldShowApplicationDetailsButton) {
                    navigation.navigate("ApplicationDetails", {
                      jobId: selectedJob.id,
                    });
                    return;
                  }

                  if (applyButtonState.isSubmitted) {
                    return;
                  }

                  navigation.navigate("ApplicationForm", {
                    jobId: selectedJob.id,
                    source: "jobDetails",
                  });
                }}
              />
              <BookmarkButton isSaved={isSaved} onPress={handleSaveToggle} />
            </View>
          </View>
        )}
      />

      <JobSaveStatusPrompt
        visible={showSavePrompt}
        message={savePromptMessage}
      />
    </View>
  );
}
