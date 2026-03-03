import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { CompositeScreenProps } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  ListRenderItemInfo,
  Text,
  View,
} from "react-native";

import AppButton from "../../components/AppButton";
import BookmarkButton from "../../components/BookmarkButton";
import JobInfoCard from "../../components/JobInfoCard";
import JobSaveStatusPrompt from "../../components/JobSaveStatusPrompt";
import RefreshableList from "../../components/RefreshableList";
import SearchBar from "../../components/SearchBar";
import { Job, useJobs } from "../../context/JobContext";
import { RootStackParamList, RootTabParamList } from "../index";
import { finderScreenStyles } from "./styles/finderScreenStyles";

type FinderScreenProps = CompositeScreenProps<
  BottomTabScreenProps<RootTabParamList, "Finder">,
  NativeStackScreenProps<RootStackParamList>
>;

export default function FinderScreen({ navigation }: FinderScreenProps) {
  const [query, setQuery] = useState<string>("");
  const [showSavePrompt, setShowSavePrompt] = useState<boolean>(false);
  const [savePromptMessage, setSavePromptMessage] = useState<string>(
    "Job Saved Successfully!",
  );
  const promptTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const {
    jobs,
    isLoading,
    error,
    savedJobIds,
    saveJob,
    unsaveJob,
    refreshJobs,
  } = useJobs();
  const showInitialLoading = isLoading && jobs.length === 0 && !error;
  const showErrorState = Boolean(error) && jobs.length === 0;

  useEffect(() => {
    return () => {
      if (promptTimerRef.current) {
        clearTimeout(promptTimerRef.current);
      }
    };
  }, []);

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

  const executeSave = useCallback(
    (jobId: string) => {
      saveJob(jobId);
      showStatusPrompt("Job Saved Successfully!");
    },
    [saveJob, showStatusPrompt],
  );

  const handleSaveJob = useCallback(
    (jobId: string, isSaved: boolean) => {
      if (isSaved) {
        unsaveJob(jobId);
        showStatusPrompt("Job removed from saved jobs");
        return;
      }

      executeSave(jobId);
    },
    [executeSave, showStatusPrompt, unsaveJob],
  );

  const handleOpenDetails = useCallback(
    (jobId: string) => {
      navigation.navigate("JobDetails", {
        jobId,
        source: "finder",
      });
    },
    [navigation],
  );

  const filteredJobs = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return jobs;
    }

    return jobs.filter((job) => {
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

      return searchableText.includes(normalizedQuery);
    });
  }, [jobs, query]);

  const renderJob = useCallback(
    ({ item }: ListRenderItemInfo<Job>) => (
      <JobInfoCard
        job={item}
        footer={
          <View style={finderScreenStyles.buttonRow}>
            <BookmarkButton
              isSaved={savedJobIds.includes(item.id)}
              onPress={() =>
                handleSaveJob(item.id, savedJobIds.includes(item.id))
              }
            />
            <AppButton
              label="Details"
              onPress={() => handleOpenDetails(item.id)}
            />
          </View>
        }
      />
    ),
    [handleOpenDetails, handleSaveJob, savedJobIds],
  );

  const keyExtractor = useCallback((item: Job) => item.id, []);

  const handleRefresh = useCallback(() => {
    void refreshJobs();
  }, [refreshJobs]);

  return (
    <View style={finderScreenStyles.container}>
      <Text style={finderScreenStyles.title}>Job Finder</Text>

      <SearchBar
        value={query}
        onChangeText={setQuery}
        placeholder="Search jobs"
        style={finderScreenStyles.searchInput}
      />

      {showInitialLoading ? (
        <ActivityIndicator size="large" />
      ) : showErrorState ? (
        <Text style={finderScreenStyles.errorText}>{error}</Text>
      ) : (
        <RefreshableList
          data={filteredJobs}
          keyExtractor={keyExtractor}
          renderItem={renderJob}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          refreshing={isLoading}
          onRefresh={handleRefresh}
          initialNumToRender={8}
          maxToRenderPerBatch={8}
          windowSize={7}
          removeClippedSubviews
          contentContainerStyle={finderScreenStyles.listContainer}
          ListEmptyComponent={
            <Text style={finderScreenStyles.emptyText}>No jobs found.</Text>
          }
        />
      )}

      <JobSaveStatusPrompt
        visible={showSavePrompt}
        message={savePromptMessage}
      />
    </View>
  );
}
