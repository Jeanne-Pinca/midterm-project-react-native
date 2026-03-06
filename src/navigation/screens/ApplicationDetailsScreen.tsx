import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useMemo, useState } from "react";
import { ScrollView, Text, TextInput, View } from "react-native";

import AppButton from "../../components/AppButton";
import AppPrompt from "../../components/AppPrompt";
import BookmarkButton from "../../components/BookmarkButton";
import CircularBackButton from "../../components/CircularBackButton";
import JobInfoCard from "../../components/JobInfoCard";
import ThemeModeToggle from "../../components/ThemeModeToggle";
import { useJobs } from "../../context/JobContext";
import { useTheme } from "../../context/ThemeContext";
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
  const { isDarkMode, theme } = useTheme();
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

  const handleGoBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }

    navigation.navigate("MainTabs", { screen: "AppliedJobs" });
  };

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
      <View
        style={[
          applicationFormScreenStyles.stickyHeader,
          {
            backgroundColor: theme.colors.surface,
            borderBottomColor: theme.colors.border,
          },
        ]}
      >
        <View style={applicationFormScreenStyles.stickyHeaderRow}>
          <Text
            style={[
              applicationFormScreenStyles.stickyHeaderTitle,
              { color: theme.colors.textPrimary },
            ]}
          >
            Application Details
          </Text>
          <View style={applicationFormScreenStyles.stickyHeaderRightRow}>
            <View
              style={[
                applicationFormScreenStyles.statusCapsule,
                {
                  borderColor: theme.colors.border,
                  backgroundColor: isDarkMode ? "#374151" : "#f9fafb",
                },
              ]}
            >
              <Text
                style={[
                  applicationFormScreenStyles.statusCapsuleText,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Submitted
              </Text>
            </View>
            <ThemeModeToggle />
          </View>
        </View>
      </View>

      <Text
        style={[
          applicationFormScreenStyles.sectionTitle,
          { color: theme.colors.textPrimary },
        ]}
      >
        Job Overview
      </Text>
      {selectedJob ? <JobInfoCard job={selectedJob} /> : null}

      <View
        style={[
          applicationFormScreenStyles.formContainer,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
          },
        ]}
      >
        <View style={applicationFormScreenStyles.dashedHeaderRow}>
          <View style={applicationFormScreenStyles.dashedHeaderLine} />
          <Text
            style={[
              applicationFormScreenStyles.dashedHeaderText,
              { color: theme.colors.textSecondary },
            ]}
          >
            Filled Out Application Form
          </Text>
          <View style={applicationFormScreenStyles.dashedHeaderLine} />
        </View>

        <Text
          style={[
            applicationFormScreenStyles.label,
            { color: theme.colors.textSecondary },
          ]}
        >
          Name
        </Text>
        <TextInput
          value={applicationDetails?.name ?? "Not available"}
          editable={false}
          style={[
            applicationFormScreenStyles.input,
            {
              color: theme.colors.textPrimary,
              borderColor: theme.colors.border,
              backgroundColor: isDarkMode ? "#111827" : "#fff",
            },
          ]}
        />

        <Text
          style={[
            applicationFormScreenStyles.label,
            { color: theme.colors.textSecondary },
          ]}
        >
          Email
        </Text>
        <TextInput
          value={applicationDetails?.email ?? "Not available"}
          editable={false}
          style={[
            applicationFormScreenStyles.input,
            {
              color: theme.colors.textPrimary,
              borderColor: theme.colors.border,
              backgroundColor: isDarkMode ? "#111827" : "#fff",
            },
          ]}
        />

        <Text
          style={[
            applicationFormScreenStyles.label,
            { color: theme.colors.textSecondary },
          ]}
        >
          Contact Number
        </Text>
        <TextInput
          value={applicationDetails?.contactNumber ?? "Not available"}
          editable={false}
          style={[
            applicationFormScreenStyles.input,
            {
              color: theme.colors.textPrimary,
              borderColor: theme.colors.border,
              backgroundColor: isDarkMode ? "#111827" : "#fff",
            },
          ]}
        />

        <Text
          style={[
            applicationFormScreenStyles.label,
            { color: theme.colors.textSecondary },
          ]}
        >
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
            {
              color: theme.colors.textPrimary,
              borderColor: theme.colors.border,
              backgroundColor: isDarkMode ? "#111827" : "#fff",
            },
          ]}
        />

        <Text
          style={[
            applicationFormScreenStyles.label,
            { color: theme.colors.textSecondary },
          ]}
        >
          Submitted At
        </Text>
        <TextInput
          value={formatSubmittedAt(applicationDetails?.submittedAt)}
          editable={false}
          style={[
            applicationFormScreenStyles.input,
            {
              color: theme.colors.textPrimary,
              borderColor: theme.colors.border,
              backgroundColor: isDarkMode ? "#111827" : "#fff",
            },
          ]}
        />
      </View>

      <View
        style={[
          applicationFormScreenStyles.actionsContainer,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
          },
        ]}
      >
        <View style={applicationFormScreenStyles.buttonRow}>
          <CircularBackButton onPress={handleGoBack} />
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
