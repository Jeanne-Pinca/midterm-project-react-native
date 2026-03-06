import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useMemo, useState } from "react";
import { ScrollView, Text, TextInput, View } from "react-native";

import AppButton from "../../components/AppButton";
import AppPrompt from "../../components/AppPrompt";
import BookmarkButton from "../../components/BookmarkButton";
import CircularBackButton from "../../components/CircularBackButton";
import JobInfoCard from "../../components/JobInfoCard";
import { useJobs } from "../../context/JobContext";
import { RootStackParamList } from "../index";
import { applicationFormScreenStyles } from "./styles/applicationFormScreenStyles";

type ApplicationDetailsScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "ApplicationDetails"
>;

export default function ApplicationDetailsScreen({
  navigation,
  route,
}: ApplicationDetailsScreenProps) {
  const {
    jobs,
    applicationDetailsByJobId,
    retractJobApplication,
    savedJobIds,
    saveJob,
    unsaveJob,
  } = useJobs();
  const [showRetractPrompt, setShowRetractPrompt] = useState<boolean>(false);
  const [showRetractedPrompt, setShowRetractedPrompt] =
    useState<boolean>(false);

  const selectedJob = useMemo(
    () => jobs.find((job) => job.id === route.params.jobId),
    [jobs, route.params.jobId],
  );

  const applicationDetails = applicationDetailsByJobId[route.params.jobId];
  const isSaved = savedJobIds.includes(route.params.jobId);

  const formatSubmittedAt = (value?: string): string => {
    if (!value) {
      return "Not available";
    }

    const parsedDate = new Date(value);

    if (Number.isNaN(parsedDate.getTime())) {
      return value;
    }

    return parsedDate.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      timeZoneName: "short",
    });
  };

  const handleBookmarkToggle = () => {
    if (isSaved) {
      unsaveJob(route.params.jobId);
      return;
    }

    saveJob(route.params.jobId);
  };

  const handleConfirmRetract = () => {
    retractJobApplication(route.params.jobId);
    setShowRetractPrompt(false);
    setShowRetractedPrompt(true);
  };

  const handleCloseRetractedPrompt = () => {
    setShowRetractedPrompt(false);
    navigation.navigate("MainTabs", { screen: "AppliedJobs" });
  };

  return (
    <ScrollView
      style={applicationFormScreenStyles.container}
      contentContainerStyle={applicationFormScreenStyles.contentContainer}
      showsVerticalScrollIndicator={false}
      stickyHeaderIndices={[0]}
    >
      <View style={applicationFormScreenStyles.stickyHeader}>
        <View style={applicationFormScreenStyles.stickyHeaderRow}>
          <Text style={applicationFormScreenStyles.stickyHeaderTitle}>
            Application Details
          </Text>
          <View style={applicationFormScreenStyles.statusCapsule}>
            <Text style={applicationFormScreenStyles.statusCapsuleText}>
              Submitted
            </Text>
          </View>
        </View>
      </View>

      <Text style={applicationFormScreenStyles.sectionTitle}>Job Overview</Text>
      {selectedJob ? <JobInfoCard job={selectedJob} /> : null}

      <View style={applicationFormScreenStyles.formContainer}>
        <View style={applicationFormScreenStyles.dashedHeaderRow}>
          <View style={applicationFormScreenStyles.dashedHeaderLine} />
          <Text style={applicationFormScreenStyles.dashedHeaderText}>
            Filled Out Application Form
          </Text>
          <View style={applicationFormScreenStyles.dashedHeaderLine} />
        </View>

        <Text style={applicationFormScreenStyles.label}>Name</Text>
        <TextInput
          value={applicationDetails?.name ?? "Not available"}
          editable={false}
          style={applicationFormScreenStyles.input}
        />

        <Text style={applicationFormScreenStyles.label}>Email</Text>
        <TextInput
          value={applicationDetails?.email ?? "Not available"}
          editable={false}
          style={applicationFormScreenStyles.input}
        />

        <Text style={applicationFormScreenStyles.label}>Contact Number</Text>
        <TextInput
          value={applicationDetails?.contactNumber ?? "Not available"}
          editable={false}
          style={applicationFormScreenStyles.input}
        />

        <Text style={applicationFormScreenStyles.label}>
          Why should we hire you?
        </Text>
        <TextInput
          value={applicationDetails?.whyHire ?? "Not available"}
          editable={false}
          multiline
          textAlignVertical="top"
          style={[
            applicationFormScreenStyles.input,
            applicationFormScreenStyles.textArea,
          ]}
        />

        <Text style={applicationFormScreenStyles.label}>Submitted At</Text>
        <TextInput
          value={formatSubmittedAt(applicationDetails?.submittedAt)}
          editable={false}
          style={applicationFormScreenStyles.input}
        />
      </View>

      <View style={applicationFormScreenStyles.actionsContainer}>
        <View style={applicationFormScreenStyles.buttonRow}>
          <CircularBackButton onPress={() => navigation.goBack()} />
          <View style={applicationFormScreenStyles.submitButtonWrap}>
            <AppButton
              label="Delete Application"
              onPress={() => setShowRetractPrompt(true)}
              style={applicationFormScreenStyles.deleteButton}
            />
          </View>
          <BookmarkButton isSaved={isSaved} onPress={handleBookmarkToggle} />
        </View>
      </View>

      <AppPrompt
        visible={showRetractPrompt}
        variant="dialog"
        title="Retract application"
        message="Do you want to retract this application?"
        onRequestClose={() => setShowRetractPrompt(false)}
        actions={[
          {
            label: "Cancel",
            fullWidth: true,
            onPress: () => setShowRetractPrompt(false),
          },
          {
            label: "Retract",
            role: "destructive",
            fullWidth: true,
            onPress: handleConfirmRetract,
          },
        ]}
      />

      <AppPrompt
        visible={showRetractedPrompt}
        variant="dialog"
        title="Application retracted"
        message="Job application has been retracted"
        onRequestClose={handleCloseRetractedPrompt}
        actions={[
          {
            label: "Okay",
            role: "primary",
            onPress: handleCloseRetractedPrompt,
          },
        ]}
      />
    </ScrollView>
  );
}
