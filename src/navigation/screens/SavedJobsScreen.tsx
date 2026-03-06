import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { CompositeScreenProps } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useEffect, useMemo, useRef, useState } from "react";
import { Text, View } from "react-native";

import AppButton from "../../components/AppButton";
import AppPrompt from "../../components/AppPrompt";
import BookmarkButton from "../../components/BookmarkButton";
import { useJobApplicationState } from "../../components/hooks/useJobApplicationState";
import JobInfoCard from "../../components/JobInfoCard";
import RefreshableList from "../../components/RefreshableList";
import SearchHelpContent from "../../components/SearchHelpContent";
import SearchBar from "../../components/SearchBar";
import { Job, useJobs } from "../../context/JobContext";
import { filterJobsBySearchQuery } from "../../utils/jobSearch";
import { RootStackParamList, RootTabParamList } from "../index";
import { savedJobsScreenStyles } from "./styles/savedJobsScreenStyles";

type SavedJobsScreenProps = CompositeScreenProps<
  BottomTabScreenProps<RootTabParamList, "SavedJobs">,
  NativeStackScreenProps<RootStackParamList>
>;

export default function SavedJobsScreen({ navigation }: SavedJobsScreenProps) {
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

  const renderSavedJob = ({ item }: { item: Job }) => {
    const applyButtonState = getApplyButtonState(item.id);

    return (
      <JobInfoCard
        job={item}
        footer={
          <>
            <View style={savedJobsScreenStyles.buttonRow}>
              <BookmarkButton
                isSaved
                onPress={() => handleRemoveJob(item.id)}
              />
              <AppButton
                label="Details"
                onPress={() =>
                  navigation.navigate("JobDetails", {
                    jobId: item.id,
                    source: "savedJobs",
                  })
                }
              />
              <AppButton
                label={
                  applyButtonState.isSubmitted ? "View Application" : "Apply"
                }
                variant={
                  applyButtonState.isSubmitted
                    ? "primary"
                    : applyButtonState.variant
                }
                disabled={false}
                onPress={() => {
                  if (applyButtonState.isSubmitted) {
                    navigation.navigate("ApplicationDetails", {
                      jobId: item.id,
                    });
                    return;
                  }

                  navigation.navigate("ApplicationForm", {
                    jobId: item.id,
                    source: "savedJobs",
                  });
                }}
              />
            </View>
          </>
        }
      />
    );
  };

  return (
    <View style={savedJobsScreenStyles.container}>
      <Text style={savedJobsScreenStyles.title}>Saved Jobs</Text>

      <SearchBar
        value={query}
        onChangeText={setQuery}
        placeholder="Search saved jobs"
        style={savedJobsScreenStyles.searchInput}
        onInfoPress={handleSearchInfoPress}
      />

      <RefreshableList
        data={savedJobs}
        keyExtractor={(item) => item.id}
        renderItem={renderSavedJob}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        refreshing={isLoading}
        onRefresh={() => void refreshJobs()}
        contentContainerStyle={savedJobsScreenStyles.listContainer}
        ListEmptyComponent={
          <Text style={savedJobsScreenStyles.emptyText}>
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
