import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useMemo } from "react";
import { ScrollView, Text, TextInput, View } from "react-native";

import AppButton from "../../components/AppButton";
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
  const { jobs, applicationDetailsByJobId } = useJobs();

  const selectedJob = useMemo(
    () => jobs.find((job) => job.id === route.params.jobId),
    [jobs, route.params.jobId],
  );

  const applicationDetails = applicationDetailsByJobId[route.params.jobId];

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

      <Text style={applicationFormScreenStyles.sectionTitle}>Job Description</Text>
      <View style={applicationFormScreenStyles.descriptionBox}>
        <Text style={applicationFormScreenStyles.descriptionText}>
          {selectedJob?.description?.trim() || "Not available"}
        </Text>
      </View>

      <Text style={applicationFormScreenStyles.sectionTitle}>
        Filled Out Application Form
      </Text>

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
        value={applicationDetails?.submittedAt ?? "Not available"}
        editable={false}
        style={applicationFormScreenStyles.input}
      />

      <View style={applicationFormScreenStyles.buttonRow}>
        <AppButton label="Back" onPress={() => navigation.goBack()} />
      </View>
    </ScrollView>
  );
}
