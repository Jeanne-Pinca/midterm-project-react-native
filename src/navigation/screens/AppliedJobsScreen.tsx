import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { CompositeScreenProps } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useCallback, useMemo, useState } from "react";
import { ListRenderItemInfo, Text, View } from "react-native";

import AppButton from "../../components/AppButton";
import AppPrompt from "../../components/AppPrompt";
import JobInfoCard from "../../components/JobInfoCard";
import RefreshableList from "../../components/RefreshableList";
import SearchBar from "../../components/SearchBar";
import SearchHelpContent from "../../components/SearchHelpContent";
import ThemeModeToggle from "../../components/ThemeModeToggle";
import { Job, useJobs } from "../../context/JobContext";
import { useTheme } from "../../context/ThemeContext";
import { filterJobsBySearchQuery } from "../../utils/jobSearch";
import { RootStackParamList, RootTabParamList } from "../index";
import { appliedJobsScreenStyles } from "./styles/appliedJobsScreenStyles";

type AppliedJobsScreenProps = CompositeScreenProps<
  BottomTabScreenProps<RootTabParamList, "AppliedJobs">,
  NativeStackScreenProps<RootStackParamList>
>;

export default function AppliedJobsScreen({
  navigation,
}: AppliedJobsScreenProps) {
  const { theme } = useTheme();
  const [query, setQuery] = useState<string>("");
  const [showSearchInfoPrompt, setShowSearchInfoPrompt] =
    useState<boolean>(false);
  const { jobs, submittedJobIds, isLoading, refreshJobs } = useJobs();

  const appliedJobs = useMemo(() => {
    const submittedOnly = jobs.filter((job) =>
      submittedJobIds.includes(job.id),
    );

    return filterJobsBySearchQuery(submittedOnly, query);
  }, [jobs, submittedJobIds, query]);

  const handleSearchInfoPress = () => {
    setShowSearchInfoPrompt(true);
  };

  const renderFooter = useCallback(
    (job: Job) => (
      <View style={appliedJobsScreenStyles.buttonRow}>
        <AppButton
          label="Details"
          onPress={() =>
            navigation.navigate("JobDetails", {
              jobId: job.id,
              source: "appliedJobs",
            })
          }
        />
        <AppButton
          label="View Application"
          variant="muted"
          onPress={() =>
            navigation.navigate("ApplicationDetails", { jobId: job.id })
          }
        />
      </View>
    ),
    [navigation],
  );

  const renderAppliedJob = useCallback(
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
    <View style={appliedJobsScreenStyles.container}>
      <View style={appliedJobsScreenStyles.headerRow}>
        <Text
          style={[
            appliedJobsScreenStyles.title,
            { color: theme.colors.textPrimary },
          ]}
        >
          Applied Jobs
        </Text>
        <ThemeModeToggle />
      </View>

      <SearchBar
        value={query}
        onChangeText={setQuery}
        placeholder="Search applied jobs"
        style={appliedJobsScreenStyles.searchInput}
        onInfoPress={handleSearchInfoPress}
      />

      <RefreshableList
        data={appliedJobs}
        keyExtractor={keyExtractor}
        renderItem={renderAppliedJob}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        refreshing={isLoading}
        onRefresh={handleRefresh}
        contentContainerStyle={appliedJobsScreenStyles.listContainer}
        ListEmptyComponent={
          <Text
            style={[
              appliedJobsScreenStyles.emptyText,
              { color: theme.colors.textMuted },
            ]}
          >
            No applied jobs found.
          </Text>
        }
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
