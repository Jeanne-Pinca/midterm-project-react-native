import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { CompositeScreenProps } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useMemo, useState } from "react";
import { Text, View } from "react-native";

import AppButton from "../../components/AppButton";
import AppPrompt from "../../components/AppPrompt";
import JobInfoCard from "../../components/JobInfoCard";
import RefreshableList from "../../components/RefreshableList";
import SearchHelpContent from "../../components/SearchHelpContent";
import SearchBar from "../../components/SearchBar";
import { Job, useJobs } from "../../context/JobContext";
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

  const renderAppliedJob = ({ item }: { item: Job }) => (
    <JobInfoCard
      job={item}
      footer={
        <View style={appliedJobsScreenStyles.buttonRow}>
          <AppButton
            label="Details"
            onPress={() =>
              navigation.navigate("JobDetails", {
                jobId: item.id,
                source: "appliedJobs",
              })
            }
          />
          <AppButton
            label="View Application"
            variant="muted"
            onPress={() =>
              navigation.navigate("ApplicationDetails", { jobId: item.id })
            }
          />
        </View>
      }
    />
  );

  return (
    <View style={appliedJobsScreenStyles.container}>
      <Text style={appliedJobsScreenStyles.title}>Applied Jobs</Text>

      <SearchBar
        value={query}
        onChangeText={setQuery}
        placeholder="Search applied jobs"
        style={appliedJobsScreenStyles.searchInput}
        onInfoPress={handleSearchInfoPress}
      />

      <RefreshableList
        data={appliedJobs}
        keyExtractor={(item) => item.id}
        renderItem={renderAppliedJob}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        refreshing={isLoading}
        onRefresh={() => void refreshJobs()}
        contentContainerStyle={appliedJobsScreenStyles.listContainer}
        ListEmptyComponent={
          <Text style={appliedJobsScreenStyles.emptyText}>
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
