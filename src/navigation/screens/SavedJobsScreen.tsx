import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { CompositeScreenProps } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ListRenderItemInfo, Text, View } from "react-native";

import AppButton from "../../components/AppButton";
import AppPrompt from "../../components/AppPrompt";
import BookmarkButton from "../../components/BookmarkButton";
import { useJobApplicationState } from "../../components/hooks/useJobApplicationState";
import JobInfoCard from "../../components/JobInfoCard";
import RefreshableList from "../../components/RefreshableList";
import SearchBar from "../../components/SearchBar";
import SearchHelpContent from "../../components/SearchHelpContent";
import ThemeModeToggle from "../../components/ThemeModeToggle";
import { Job, useJobs } from "../../context/JobContext";
import { useTheme } from "../../context/ThemeContext";
import { filterJobsBySearchQuery } from "../../utils/jobSearch";
import { RootStackParamList, RootTabParamList } from "../index";
import { savedJobsScreenStyles } from "./styles/savedJobsScreenStyles";

type SavedJobsScreenProps = CompositeScreenProps<
  BottomTabScreenProps<RootTabParamList, "SavedJobs">,
  NativeStackScreenProps<RootStackParamList>
>;

export default function SavedJobsScreen({ navigation }: SavedJobsScreenProps) {
  const { theme } = useTheme();
  const [query, setQuery] = useState<string>("");
  const [showSavePrompt, setShowSavePrompt] = useState<boolean>(false);
  const [showSearchInfoPrompt, setShowSearchInfoPrompt] =
    useState<boolean>(false);
  const [jobIdPendingRemoval, setJobIdPendingRemoval] = useState<string | null>(
    null,
  );
  const promptTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { jobs, savedJobIds, unsaveJob, isLoading, refreshJobs } = useJobs();
  const { getApplyButtonState } = useJobApplicationState();

  useEffect(() => {
    return () => {
      if (promptTimerRef.current) {
        clearTimeout(promptTimerRef.current);
      }
    };
  }, []);

  const showStatusPrompt = () => {
    setShowSavePrompt(true);

    if (promptTimerRef.current) {
      clearTimeout(promptTimerRef.current);
    }

    promptTimerRef.current = setTimeout(() => {
      setShowSavePrompt(false);
      promptTimerRef.current = null;
    }, 1800);
  };

  const handleRemoveJob = (jobId: string) => {
    setJobIdPendingRemoval(jobId);
  };

  const handleConfirmRemoveJob = () => {
    if (!jobIdPendingRemoval) {
      return;
    }

    unsaveJob(jobIdPendingRemoval);
    setJobIdPendingRemoval(null);
    showStatusPrompt();
  };

  const handleSearchInfoPress = () => {
    setShowSearchInfoPrompt(true);
  };

  const savedJobs = useMemo(() => {
    const savedOnly = jobs.filter((job) => savedJobIds.includes(job.id));

    return filterJobsBySearchQuery(savedOnly, query);
  }, [jobs, savedJobIds, query]);

  const renderFooter = useCallback(
    (job: Job) => {
      const applyButtonState = getApplyButtonState(job.id);

      return (
        <View style={savedJobsScreenStyles.buttonRow}>
          <BookmarkButton isSaved onPress={() => handleRemoveJob(job.id)} />
          <AppButton
            label="Details"
            onPress={() =>
              navigation.navigate("JobDetails", {
                jobId: job.id,
                source: "savedJobs",
              })
            }
          />
          <AppButton
            label={applyButtonState.isSubmitted ? "View Application" : "Apply"}
            variant={
              applyButtonState.isSubmitted
                ? "primary"
                : applyButtonState.variant
            }
            disabled={false}
            onPress={() => {
              if (applyButtonState.isSubmitted) {
                navigation.navigate("ApplicationDetails", {
                  jobId: job.id,
                });
                return;
              }

              navigation.navigate("ApplicationForm", {
                jobId: job.id,
                source: "savedJobs",
              });
            }}
          />
        </View>
      );
    },
    [getApplyButtonState, handleRemoveJob, navigation],
  );

  const renderSavedJob = useCallback(
    ({ item }: ListRenderItemInfo<Job>) => (
      <JobInfoCard job={item} footer={renderFooter} />
    ),
    [renderFooter],
  );

  const keyExtractor = useCallback((item: Job) => item.id, []);

  const handleRefresh = useCallback(() => {
    void refreshJobs();
  }, [refreshJobs]);

  return (
    <View style={savedJobsScreenStyles.container}>
      <View style={savedJobsScreenStyles.headerRow}>
        <Text
          style={[
            savedJobsScreenStyles.title,
            { color: theme.colors.textPrimary },
          ]}
        >
          Saved Jobs
        </Text>
        <ThemeModeToggle />
      </View>

      <SearchBar
        value={query}
        onChangeText={setQuery}
        placeholder="Search saved jobs"
        style={savedJobsScreenStyles.searchInput}
        onInfoPress={handleSearchInfoPress}
      />

      <RefreshableList
        data={savedJobs}
        keyExtractor={keyExtractor}
        renderItem={renderSavedJob}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        refreshing={isLoading}
        onRefresh={handleRefresh}
        contentContainerStyle={savedJobsScreenStyles.listContainer}
        ListEmptyComponent={
          <Text
            style={[
              savedJobsScreenStyles.emptyText,
              { color: theme.colors.textMuted },
            ]}
          >
            No saved jobs found.
          </Text>
        }
      />

      <AppPrompt
        visible={showSavePrompt}
        message="Job has been removed."
        variant="toast"
      />

      <AppPrompt
        visible={showSearchInfoPrompt}
        variant="dialog"
        title="How search works"
        message={<SearchHelpContent />}
        onRequestClose={() => setShowSearchInfoPrompt(false)}
        actions={[
          {
            label: "Okay",
            role: "primary",
            onPress: () => setShowSearchInfoPrompt(false),
          },
        ]}
      />

      <AppPrompt
        visible={Boolean(jobIdPendingRemoval)}
        variant="dialog"
        title="Remove Job"
        message="Are you sure you want to remove this job from saved jobs?"
        onRequestClose={() => setJobIdPendingRemoval(null)}
        actions={[
          {
            label: "Cancel",
            onPress: () => setJobIdPendingRemoval(null),
          },
          {
            label: "Remove Job",
            role: "destructive",
            onPress: handleConfirmRemoveJob,
          },
        ]}
      />
    </View>
  );
}
