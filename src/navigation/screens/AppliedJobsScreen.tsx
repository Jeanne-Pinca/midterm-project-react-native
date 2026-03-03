import { MaterialCommunityIcons } from "@expo/vector-icons";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { CompositeScreenProps } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useMemo, useState } from "react";
import { Image, Text, View } from "react-native";

import AppButton from "../../components/AppButton";
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
    <View style={appliedJobsScreenStyles.card}>
      <View style={appliedJobsScreenStyles.jobHeaderRow}>
        <Text style={appliedJobsScreenStyles.jobTitleWithLogo}>
          {item.title}
        </Text>
        {item.companyLogo ? (
          <Image
            source={{ uri: item.companyLogo }}
            style={appliedJobsScreenStyles.cardLogo}
            resizeMode="contain"
          />
        ) : null}
      </View>

      <Text style={appliedJobsScreenStyles.companyText}>{item.company}</Text>
      <Text style={appliedJobsScreenStyles.categoryText}>
        {item.mainCategory}
      </Text>
      <Text style={appliedJobsScreenStyles.jobTypeText}>
        {item.jobType}, {item.workModel}
      </Text>

      <View style={appliedJobsScreenStyles.locationRow}>
        <View style={appliedJobsScreenStyles.locationLeft}>
          <MaterialCommunityIcons name="cash" size={16} color="#6b7280" />
          <Text style={appliedJobsScreenStyles.iconText}>{item.salary}</Text>
        </View>
        <View style={appliedJobsScreenStyles.publishedRight}>
          <MaterialCommunityIcons
            name="clock-outline"
            size={16}
            color="#6b7280"
          />
          <Text style={appliedJobsScreenStyles.publishedText}>
            {item.publishedDate}
          </Text>
        </View>
      </View>

      <View style={appliedJobsScreenStyles.locationRow}>
        <View style={appliedJobsScreenStyles.locationLeft}>
          <MaterialCommunityIcons name="map-marker" size={16} color="#6b7280" />
          <Text style={appliedJobsScreenStyles.iconText}>
            {item.locations.length > 0
              ? item.locations.join(", ")
              : "Not specified"}
          </Text>
        </View>
        <View style={appliedJobsScreenStyles.publishedRight}>
          <MaterialCommunityIcons
            name="calendar-clock"
            size={16}
            color="#6b7280"
          />
          <Text style={appliedJobsScreenStyles.publishedText}>
            {item.expiryDate}
          </Text>
        </View>
      </View>

      <View style={appliedJobsScreenStyles.iconRow}>
        <MaterialCommunityIcons
          name="tag"
          size={16}
          color="#6b7280"
          style={appliedJobsScreenStyles.tagIcon}
        />
        <Text style={appliedJobsScreenStyles.iconText}>
          {item.tags.length > 0 ? item.tags.join(", ") : "Not specified"}
        </Text>
      </View>

      <View style={appliedJobsScreenStyles.buttonRow}>
        <AppButton
          label="Details"
          onPress={() => navigation.navigate("JobDetails", { jobId: item.id })}
        />
        <AppButton
          label="Application Submitted"
          variant="muted"
          disabled
          onPress={() => {}}
        />
      </View>
    </View>
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
