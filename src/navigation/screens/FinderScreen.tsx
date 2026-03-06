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
import AppPrompt from "../../components/AppPrompt";
import BookmarkButton from "../../components/BookmarkButton";
import JobInfoCard from "../../components/JobInfoCard";
import RefreshableList from "../../components/RefreshableList";
import SearchBar from "../../components/SearchBar";
import SearchHelpContent from "../../components/SearchHelpContent";
import ThemeModeToggle from "../../components/ThemeModeToggle";
import { Job, useJobs } from "../../context/JobContext";
import { useTheme } from "../../context/ThemeContext";
import { filterJobsBySearchQuery } from "../../utils/jobSearch";
import { RootStackParamList, RootTabParamList } from "../index";
import { finderScreenStyles } from "./styles/finderScreenStyles";

type FinderScreenProps = CompositeScreenProps<
  BottomTabScreenProps<RootTabParamList, "Finder">,
  NativeStackScreenProps<RootStackParamList>
>;

export default function FinderScreen({ navigation }: FinderScreenProps) {
  const { theme } = useTheme();
  const [query, setQuery] = useState<string>("");
  const [showSavePrompt, setShowSavePrompt] = useState<boolean>(false);
  const [showSearchInfoPrompt, setShowSearchInfoPrompt] =
    useState<boolean>(false);
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
    return filterJobsBySearchQuery(jobs, query);
  }, [jobs, query]);

  const renderFooter = useCallback(
    (job: Job) => (
      <View style={finderScreenStyles.buttonRow}>
        <BookmarkButton
          isSaved={savedJobIds.includes(job.id)}
          onPress={() => handleSaveJob(job.id, savedJobIds.includes(job.id))}
        />
        <AppButton label="Details" onPress={() => handleOpenDetails(job.id)} />
      </View>
    ),
    [handleOpenDetails, handleSaveJob, savedJobIds],
  );

  const renderJob = useCallback(
    ({ item }: ListRenderItemInfo<Job>) => (
      <JobInfoCard job={item} footer={renderFooter} />
    ),
    [renderFooter],
  );

  const keyExtractor = useCallback((item: Job) => item.id, []);

  const handleRefresh = useCallback(() => {
    void refreshJobs();
  }, [refreshJobs]);

  const handleSearchInfoPress = useCallback(() => {
    setShowSearchInfoPrompt(true);
  }, []);

  return (
    <View style={finderScreenStyles.container}>
      <View style={finderScreenStyles.headerRow}>
        <Text
          style={[
            finderScreenStyles.title,
            { color: theme.colors.textPrimary },
          ]}
        >
          Job Finder
        </Text>
        <ThemeModeToggle />
      </View>

      <SearchBar
        value={query}
        onChangeText={setQuery}
        placeholder="Search jobs"
        style={finderScreenStyles.searchInput}
        onInfoPress={handleSearchInfoPress}
      />

      {showInitialLoading ? (
        <ActivityIndicator size="large" color={theme.colors.textMuted} />
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
            <Text
              style={[
                finderScreenStyles.emptyText,
                { color: theme.colors.textMuted },
              ]}
            >
              No jobs found.
            </Text>
          }
        />
      )}

      <AppPrompt
        visible={showSavePrompt}
        message={savePromptMessage}
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
    </View>
  );
}
