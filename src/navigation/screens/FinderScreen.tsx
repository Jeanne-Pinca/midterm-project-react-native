import { MaterialCommunityIcons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  ListRenderItemInfo,
  Text,
  TextInput,
  View,
} from "react-native";

import AppButton from "../../components/AppButton";
import BookmarkButton from "../../components/BookmarkButton";
import JobSaveStatusPrompt from "../../components/JobSaveStatusPrompt";
import { Job, useJobs } from "../../context/JobContext";
import { RootStackParamList } from "../index";
import { finderScreenStyles } from "./styles/finderScreenStyles";

type FinderScreenProps = NativeStackScreenProps<RootStackParamList, "Finder">;

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

  const saveReplacementPromptMessage =
    "you can only save one job at a time, are you sure you want to continue? this will replace the previous job you have saved.";

  useEffect(() => {
    return () => {
      if (promptTimerRef.current) {
        clearTimeout(promptTimerRef.current);
      }
    };
  }, []);

  const showStatusPrompt = (message: string) => {
    setSavePromptMessage(message);
    setShowSavePrompt(true);

    if (promptTimerRef.current) {
      clearTimeout(promptTimerRef.current);
    }

    promptTimerRef.current = setTimeout(() => {
      setShowSavePrompt(false);
      promptTimerRef.current = null;
    }, 1800);
  };

  const executeSave = (jobId: string) => {
    saveJob(jobId);
    showStatusPrompt("Job Saved Successfully!");
  };

  const handleSaveJob = (jobId: string, isSaved: boolean) => {
    if (isSaved) {
      unsaveJob(jobId);
      showStatusPrompt("Job removed from saved jobs");
      return;
    }

    const hasAnotherSavedJob =
      savedJobIds.length > 0 && !savedJobIds.includes(jobId);

    if (hasAnotherSavedJob) {
      Alert.alert("Save Job", saveReplacementPromptMessage, [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Save Job",
          onPress: () => executeSave(jobId),
        },
      ]);

      return;
    }

    executeSave(jobId);
  };

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

  const renderJob = ({ item }: ListRenderItemInfo<Job>) => {
    const salaryText =
      item.minSalary !== "Not specified" && item.maxSalary !== "Not specified"
        ? `${item.currency} ${item.minSalary} - ${item.maxSalary}`
        : item.salary;
    const isSaved = savedJobIds.includes(item.id);

    return (
      <View style={finderScreenStyles.card}>
        <View style={finderScreenStyles.jobHeaderRow}>
          <Text style={finderScreenStyles.jobTitleWithLogo}>{item.title}</Text>
          {item.companyLogo ? (
            <Image
              source={{ uri: item.companyLogo }}
              style={finderScreenStyles.cardLogo}
              resizeMode="contain"
            />
          ) : null}
        </View>

        <Text style={finderScreenStyles.companyText}>{item.company}</Text>
        <Text style={finderScreenStyles.categoryText}>{item.mainCategory}</Text>
        <Text style={finderScreenStyles.jobTypeText}>
          {item.jobType}, {item.workModel}
        </Text>

        <View style={finderScreenStyles.locationRow}>
          <View style={finderScreenStyles.locationLeft}>
            <MaterialCommunityIcons name="cash" size={16} color="#6b7280" />
            <Text style={finderScreenStyles.iconText}>{salaryText}</Text>
          </View>
          <View style={finderScreenStyles.publishedRight}>
            <MaterialCommunityIcons
              name="clock-outline"
              size={16}
              color="#6b7280"
            />
            <Text style={finderScreenStyles.publishedText}>
              {item.publishedDate}
            </Text>
          </View>
        </View>

        <View style={finderScreenStyles.locationRow}>
          <View style={finderScreenStyles.locationLeft}>
            <MaterialCommunityIcons
              name="map-marker"
              size={16}
              color="#6b7280"
            />
            <Text style={finderScreenStyles.iconText}>
              {item.locations.length > 0
                ? item.locations.join(", ")
                : "Not specified"}
            </Text>
          </View>
          <View style={finderScreenStyles.publishedRight}>
            <MaterialCommunityIcons
              name="calendar-clock"
              size={16}
              color="#6b7280"
            />
            <Text style={finderScreenStyles.publishedText}>
              {item.expiryDate}
            </Text>
          </View>
        </View>

        <View style={finderScreenStyles.iconRow}>
          <MaterialCommunityIcons
            name="tag"
            size={16}
            color="#6b7280"
            style={finderScreenStyles.tagIcon}
          />
          <Text style={finderScreenStyles.iconText}>
            {item.tags.length > 0 ? item.tags.join(", ") : "Not specified"}
          </Text>
        </View>

        <View style={finderScreenStyles.buttonRow}>
          <BookmarkButton
            isSaved={isSaved}
            onPress={() => handleSaveJob(item.id, isSaved)}
          />
          <AppButton
            label="Details"
            onPress={() =>
              navigation.navigate("JobDetails", { jobId: item.id })
            }
          />
        </View>
      </View>
    );
  };

  return (
    <View style={finderScreenStyles.container}>
      <Text style={finderScreenStyles.title}>Job Finder</Text>

      <TextInput
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
        <FlatList
          data={filteredJobs}
          keyExtractor={(item) => item.id}
          renderItem={renderJob}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          refreshing={isLoading}
          onRefresh={() => void refreshJobs()}
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
