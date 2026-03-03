import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { CompositeScreenProps } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useMemo, useState } from "react";
import { Text, View } from "react-native";

import AppButton from "../../components/AppButton";
import JobInfoCard from "../../components/JobInfoCard";
import RefreshableList from "../../components/RefreshableList";
import SearchBar from "../../components/SearchBar";
import { Job, useJobs } from "../../context/JobContext";
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
  const { jobs, submittedJobIds, isLoading, refreshJobs } = useJobs();

  const appliedJobs = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const submittedOnly = jobs.filter((job) =>
      submittedJobIds.includes(job.id),
    );

    if (!normalizedQuery) {
      return submittedOnly;
    }

    return submittedOnly.filter((job) => {
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
  }, [jobs, submittedJobIds, query]);

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
    </View>
  );
}
