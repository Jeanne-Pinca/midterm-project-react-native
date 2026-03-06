import { MaterialCommunityIcons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    Animated,
    FlatList,
    LayoutChangeEvent,
    NativeScrollEvent,
    NativeSyntheticEvent,
    Text,
    View,
} from "react-native";

import AppButton from "../../components/AppButton";
import AppPrompt from "../../components/AppPrompt";
import BookmarkButton from "../../components/BookmarkButton";
import CircularBackButton from "../../components/CircularBackButton";
import JobInfoCard from "../../components/JobInfoCard";
import ThemeModeToggle from "../../components/ThemeModeToggle";
import { useJobApplicationState } from "../../components/hooks/useJobApplicationState";
import { useJobs } from "../../context/JobContext";
import { useTheme } from "../../context/ThemeContext";
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
  const { isDarkMode, theme } = useTheme();
  const [showSavePrompt, setShowSavePrompt] = useState<boolean>(false);
  const [isAtBottom, setIsAtBottom] = useState<boolean>(false);
  const [showStickyActions, setShowStickyActions] = useState<boolean>(true);
  const [showInlineActions, setShowInlineActions] = useState<boolean>(false);
  const [savePromptMessage, setSavePromptMessage] = useState<string>(
    "Job has been saved.",
  );
  const promptTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stickyOpacity = useRef(new Animated.Value(1)).current;
  const inlineOpacity = useRef(new Animated.Value(0)).current;
  const scrollOffsetYRef = useRef<number>(0);
  const contentHeightRef = useRef<number>(0);
  const layoutHeightRef = useRef<number>(0);
  const { jobs, savedJobIds, saveJob, unsaveJob } = useJobs();
  const { getApplyButtonState } = useJobApplicationState();
  const selectedJob = useMemo(
    () => jobs.find((job) => job.id === route.params.jobId),
    [jobs, route.params.jobId],
  );

  const handleGoBack = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }

    const fallbackTabBySource = {
      finder: "Finder",
      savedJobs: "SavedJobs",
      appliedJobs: "AppliedJobs",
    } as const;

    const fallbackScreen =
      fallbackTabBySource[route.params.source ?? "finder"] || "Finder";

    navigation.navigate("MainTabs", { screen: fallbackScreen });
  }, [navigation, route.params.source]);

  useEffect(() => {
    return () => {
      if (promptTimerRef.current) {
        clearTimeout(promptTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isAtBottom) {
      setShowInlineActions(true);

      Animated.parallel([
        Animated.timing(stickyOpacity, {
          toValue: 0,
          duration: 120,
          useNativeDriver: true,
        }),
        Animated.timing(inlineOpacity, {
          toValue: 1,
          duration: 120,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setShowStickyActions(false);
      });

      return;
    }

    setShowStickyActions(true);

    Animated.parallel([
      Animated.timing(stickyOpacity, {
        toValue: 1,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(inlineOpacity, {
        toValue: 0,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowInlineActions(false);
    });
  }, [inlineOpacity, isAtBottom, stickyOpacity]);

  if (!selectedJob) {
    return (
      <View style={jobDetailsScreenStyles.container}>
        <View style={jobDetailsScreenStyles.headerRow}>
          <Text
            style={[
              jobDetailsScreenStyles.title,
              { color: theme.colors.textPrimary },
            ]}
          >
            Job Details
          </Text>
          <ThemeModeToggle />
        </View>
        <Text style={jobDetailsScreenStyles.errorText}>
          Selected job was not found.
        </Text>
        <AppButton label="Back" onPress={handleGoBack} />
      </View>
    );
  }

  const isSaved = useMemo(
    () => savedJobIds.includes(selectedJob.id),
    [savedJobIds, selectedJob.id],
  );
  const applyButtonState = useMemo(
    () => getApplyButtonState(selectedJob.id),
    [getApplyButtonState, selectedJob.id],
  );
  const shouldShowApplicationDetailsButton = useMemo(() => {
    const isOpenedFromFinder = route.params.source === "finder";
    const isOpenedFromAppliedJobs = route.params.source === "appliedJobs";
    const isOpenedFromSavedJobs = route.params.source === "savedJobs";

    return (
      (isOpenedFromAppliedJobs ||
        isOpenedFromFinder ||
        isOpenedFromSavedJobs) &&
      applyButtonState.isSubmitted
    );
  }, [applyButtonState.isSubmitted, route.params.source]);
  const descriptionBlocks = useMemo(
    () => parseDescriptionBlocks(selectedJob.description || "N/A"),
    [selectedJob.description],
  );

  const showStatusPrompt = useCallback((message: string) => {
    setSavePromptMessage(message);
    setShowSavePrompt(true);

    if (promptTimerRef.current) {
      clearTimeout(promptTimerRef.current);
    }

    promptTimerRef.current = setTimeout(() => {
      setShowSavePrompt(false);
      promptTimerRef.current = null;
    }, 1800);
  }, []);

  const handleSaveToggle = useCallback(() => {
    if (isSaved) {
      unsaveJob(selectedJob.id);
      showStatusPrompt("Job has been unsaved.");
      return;
    }

    saveJob(selectedJob.id);
    showStatusPrompt("Job has been saved.");
  }, [isSaved, saveJob, selectedJob.id, showStatusPrompt, unsaveJob]);

  const handleApplyOrView = useCallback(() => {
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
  }, [
    applyButtonState.isSubmitted,
    navigation,
    selectedJob.id,
    shouldShowApplicationDetailsButton,
  ]);

  const evaluateBottomState = useCallback(() => {
    const distanceFromBottom = Math.max(
      contentHeightRef.current -
        (scrollOffsetYRef.current + layoutHeightRef.current),
      0,
    );

    setIsAtBottom((currentValue) => {
      const enterBottomThreshold = 40;
      const exitBottomThreshold = 96;
      const nextValue = currentValue
        ? distanceFromBottom <= exitBottomThreshold
        : distanceFromBottom <= enterBottomThreshold;

      return nextValue;
    });
  }, []);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      scrollOffsetYRef.current = event.nativeEvent.contentOffset.y;
      evaluateBottomState();
    },
    [evaluateBottomState],
  );

  const handleListLayout = useCallback(
    (event: LayoutChangeEvent) => {
      layoutHeightRef.current = event.nativeEvent.layout.height;
      evaluateBottomState();
    },
    [evaluateBottomState],
  );

  const handleContentSizeChange = useCallback(
    (_width: number, height: number) => {
      contentHeightRef.current = height;
      evaluateBottomState();
    },
    [evaluateBottomState],
  );

  const renderActions = useCallback(
    () => (
      <View style={jobDetailsScreenStyles.actionsRow}>
        <CircularBackButton onPress={handleGoBack} />
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
          onPress={handleApplyOrView}
        />
        <BookmarkButton isSaved={isSaved} onPress={handleSaveToggle} />
      </View>
    ),
    [
      applyButtonState.disabled,
      handleApplyOrView,
      handleSaveToggle,
      isSaved,
      navigation,
      shouldShowApplicationDetailsButton,
    ],
  );

  return (
    <View style={jobDetailsScreenStyles.container}>
      <View style={jobDetailsScreenStyles.headerRow}>
        <Text
          style={[
            jobDetailsScreenStyles.title,
            { color: theme.colors.textPrimary },
          ]}
        >
          Job Details
        </Text>
        <ThemeModeToggle />
      </View>

      <FlatList
        data={[selectedJob]}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        onLayout={handleListLayout}
        onScroll={handleScroll}
        onScrollEndDrag={evaluateBottomState}
        onMomentumScrollEnd={evaluateBottomState}
        onContentSizeChange={handleContentSizeChange}
        scrollEventThrottle={32}
        contentContainerStyle={[
          jobDetailsScreenStyles.listContainer,
          !showInlineActions &&
            jobDetailsScreenStyles.listContainerWithStickyPadding,
        ]}
        renderItem={() => (
          <View>
            <JobInfoCard job={selectedJob} />

            <View
              style={[
                jobDetailsScreenStyles.descriptionBox,
                {
                  borderColor: theme.colors.border,
                  backgroundColor: isDarkMode ? "#1f2937" : "#fff",
                },
              ]}
            >
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
                        style={[
                          jobDetailsScreenStyles.descriptionSectionLine,
                          { backgroundColor: theme.colors.border },
                        ]}
                      />

                      <View
                        style={jobDetailsScreenStyles.descriptionSectionContent}
                      >
                        <MaterialCommunityIcons
                          name={getHeadingIconName(block.content)}
                          size={18}
                          color={isDarkMode ? "#c4b5fd" : "#4c1d95"}
                        />
                        <Text
                          style={[
                            jobDetailsScreenStyles.descriptionSectionTitle,
                            { color: isDarkMode ? "#ddd6fe" : "#2e1065" },
                          ]}
                        >
                          {toTitleCase(block.content)}
                        </Text>
                      </View>

                      <View
                        style={[
                          jobDetailsScreenStyles.descriptionSectionLine,
                          { backgroundColor: theme.colors.border },
                        ]}
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
                      <Text
                        style={[
                          jobDetailsScreenStyles.descriptionBulletDot,
                          { color: theme.colors.border },
                        ]}
                      >
                        •
                      </Text>
                      <Text
                        style={[
                          jobDetailsScreenStyles.descriptionText,
                          { color: theme.colors.textSecondary },
                        ]}
                      >
                        {block.content}
                      </Text>
                    </View>
                  );
                }

                return (
                  <Text
                    key={`desc-text-${index}`}
                    style={[
                      jobDetailsScreenStyles.descriptionText,
                      { color: theme.colors.textSecondary },
                    ]}
                  >
                    {block.content}
                  </Text>
                );
              })}
            </View>

            {showInlineActions ? (
              <Animated.View
                style={[
                  jobDetailsScreenStyles.actionsInlineContainer,
                  {
                    borderColor: theme.colors.border,
                    backgroundColor: theme.colors.surface,
                  },
                  { opacity: inlineOpacity },
                ]}
              >
                {renderActions()}
              </Animated.View>
            ) : null}
          </View>
        )}
      />

      {showStickyActions ? (
        <Animated.View
          style={[
            jobDetailsScreenStyles.actionsStickyContainer,
            {
              borderColor: theme.colors.border,
              backgroundColor: theme.colors.surface,
            },
            { opacity: stickyOpacity },
          ]}
        >
          {renderActions()}
        </Animated.View>
      ) : null}

      <AppPrompt
        visible={showSavePrompt}
        message={savePromptMessage}
        variant="toast"
      />
    </View>
  );
}
