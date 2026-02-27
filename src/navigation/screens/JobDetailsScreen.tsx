import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Alert, FlatList, Image, Text, View } from "react-native";

import AppButton from "../../components/AppButton";
import { useJobs } from "../../context/JobContext";
import { RootStackParamList } from "../index";
import { jobDetailsScreenStyles } from "./styles/jobDetailsScreenStyles";

type JobDetailsScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "JobDetails"
>;

export default function JobDetailsScreen({
  navigation,
  route,
}: JobDetailsScreenProps) {
  const { jobs, savedJobIds, saveJob, unsaveJob, applyToJob } = useJobs();
  const selectedJob = jobs.find((job) => job.id === route.params.jobId);

  if (!selectedJob) {
    return (
      <View style={jobDetailsScreenStyles.container}>
        <Text style={jobDetailsScreenStyles.title}>Job Details</Text>
        <Text style={jobDetailsScreenStyles.errorText}>
          Selected job was not found.
        </Text>
        <AppButton label="Back" onPress={() => navigation.goBack()} />
      </View>
    );
  }

  const isSaved = savedJobIds.includes(selectedJob.id);
  const saveReplacementPromptMessage =
    "you can only save one job at a time, are you sure you want to continue? this will replace the previous job you have saved.";

  const handleSaveToggle = () => {
    if (isSaved) {
      unsaveJob(selectedJob.id);
      return;
    }

    const hasAnotherSavedJob =
      savedJobIds.length > 0 && !savedJobIds.includes(selectedJob.id);

    if (hasAnotherSavedJob) {
      Alert.alert("Save Job", saveReplacementPromptMessage, [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Save Job",
          onPress: () => saveJob(selectedJob.id),
        },
      ]);

      return;
    }

    saveJob(selectedJob.id);
  };

  return (
    <View style={jobDetailsScreenStyles.container}>
      <Text style={jobDetailsScreenStyles.title}>Job Details</Text>

      <FlatList
        data={[selectedJob]}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={jobDetailsScreenStyles.listContainer}
        renderItem={() => (
          <View style={jobDetailsScreenStyles.card}>
            <Text style={jobDetailsScreenStyles.jobTitle}>
              {selectedJob.title}
            </Text>
            <Text style={jobDetailsScreenStyles.jobMeta}>
              Company: {selectedJob.company}
            </Text>
            <Text style={jobDetailsScreenStyles.jobMeta}>
              Category: {selectedJob.mainCategory}
            </Text>
            <Text style={jobDetailsScreenStyles.jobMeta}>
              Job Type: {selectedJob.jobType}
            </Text>
            <Text style={jobDetailsScreenStyles.jobMeta}>
              Work Model: {selectedJob.workModel}
            </Text>
            <Text style={jobDetailsScreenStyles.jobMeta}>
              Seniority: {selectedJob.seniorityLevel}
            </Text>
            <Text style={jobDetailsScreenStyles.jobMeta}>
              Salary: {selectedJob.salary}
            </Text>
            <Text style={jobDetailsScreenStyles.jobMeta}>
              Min Salary: {selectedJob.minSalary}
            </Text>
            <Text style={jobDetailsScreenStyles.jobMeta}>
              Max Salary: {selectedJob.maxSalary}
            </Text>
            <Text style={jobDetailsScreenStyles.jobMeta}>
              Currency: {selectedJob.currency || "Not specified"}
            </Text>
            <Text style={jobDetailsScreenStyles.jobMeta}>
              Locations:{" "}
              {selectedJob.locations.length > 0
                ? selectedJob.locations.join(", ")
                : "Not specified"}
            </Text>
            <Text style={jobDetailsScreenStyles.jobMeta}>
              Tags:{" "}
              {selectedJob.tags.length > 0
                ? selectedJob.tags.join(", ")
                : "Not specified"}
            </Text>
            <Text style={jobDetailsScreenStyles.jobMeta}>
              Published: {selectedJob.publishedDate}
            </Text>
            <Text style={jobDetailsScreenStyles.jobMeta}>
              Expires: {selectedJob.expiryDate}
            </Text>
            <Text style={jobDetailsScreenStyles.jobMeta}>
              Link:{" "}
              {selectedJob.guid || selectedJob.applyUrl || "Not specified"}
            </Text>

            {selectedJob.companyLogo ? (
              <Image
                source={{ uri: selectedJob.companyLogo }}
                style={jobDetailsScreenStyles.logo}
                resizeMode="contain"
              />
            ) : null}

            <Text style={jobDetailsScreenStyles.descriptionTitle}>
              Description
            </Text>
            <Text style={jobDetailsScreenStyles.jobMeta}>
              {selectedJob.description}
            </Text>

            <View style={jobDetailsScreenStyles.buttonRow}>
              <AppButton label="Back" onPress={() => navigation.goBack()} />
              <AppButton
                label={isSaved ? "Unsave Job" : "Save Job"}
                variant={isSaved ? "muted" : "primary"}
                onPress={handleSaveToggle}
              />
            </View>

            <AppButton
              label="Apply"
              onPress={() => void applyToJob(selectedJob.id)}
            />
          </View>
        )}
      />
    </View>
  );
}
