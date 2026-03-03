import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { CompositeScreenProps } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useEffect, useMemo, useRef, useState } from "react";
import { Alert, Text, View } from "react-native";

import AppButton from "../../components/AppButton";
import BookmarkButton from "../../components/BookmarkButton";
import { useJobApplicationState } from "../../components/hooks/useJobApplicationState";
import JobInfoCard from "../../components/JobInfoCard";
import JobSaveStatusPrompt from "../../components/JobSaveStatusPrompt";
import RefreshableList from "../../components/RefreshableList";
import SearchBar from "../../components/SearchBar";
import { Job, useJobs } from "../../context/JobContext";
import { RootStackParamList, RootTabParamList } from "../index";
import { savedJobsScreenStyles } from "./styles/savedJobsScreenStyles";

type SavedJobsScreenProps = CompositeScreenProps<
  BottomTabScreenProps<RootTabParamList, "SavedJobs">,
  NativeStackScreenProps<RootStackParamList>
>;

export default function SavedJobsScreen({ navigation }: SavedJobsScreenProps) {
  const [query, setQuery] = useState<string>("");
  const [showSavePrompt, setShowSavePrompt] = useState<boolean>(false);
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
    Alert.alert(
      "Remove Job",
      "Are you sure you want to remove this job from saved jobs?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Remove Job",
          style: "destructive",
          onPress: () => {
            unsaveJob(jobId);
            showStatusPrompt();
          },
        },
      ],
    );
  };

  const savedJobs = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    const savedOnly = jobs.filter((job) => savedJobIds.includes(job.id));

    if (!normalizedQuery) {
      return savedOnly;
    }

    return savedOnly.filter((job) => {
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

      <JobSaveStatusPrompt
        visible={showSavePrompt}
        message="Job has been removed."
      />
    </View>
  );
}
