import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useMemo, useState } from "react";
import { Alert, ScrollView, Text, TextInput, View } from "react-native";

import AppButton from "../../components/AppButton";
import JobInfoCard from "../../components/JobInfoCard";
import { useJobs } from "../../context/JobContext";
import { RootStackParamList } from "../index";
import { applicationFormScreenStyles } from "./styles/applicationFormScreenStyles";

type ApplicationFormScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "ApplicationForm"
>;

export default function ApplicationFormScreen({
  navigation,
  route,
}: ApplicationFormScreenProps) {
  const { jobs, submitJobApplication } = useJobs();
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [contactNumber, setContactNumber] = useState<string>("");
  const [whyHire, setWhyHire] = useState<string>("");

  const selectedJob = useMemo(
    () => jobs.find((job) => job.id === route.params.jobId),
    [jobs, route.params.jobId],
  );

  const clearForm = () => {
    setName("");
    setEmail("");
    setContactNumber("");
    setWhyHire("");
  };

  const handleSubmit = () => {
    const isMissingRequiredField =
      !name.trim() || !email.trim() || !contactNumber.trim() || !whyHire.trim();

    if (isMissingRequiredField) {
      Alert.alert(
        "Incomplete Form",
        "Please fill in all fields before submitting.",
      );
      return;
    }

    submitJobApplication(route.params.jobId, {
      name: name.trim(),
      email: email.trim(),
      contactNumber: contactNumber.trim(),
      whyHire: whyHire.trim(),
    });
    clearForm();

    Alert.alert(
      "Application Submitted",
      "Your application has been submitted.",
      [
        {
          text: "Okay",
          onPress: () => navigation.navigate("MainTabs", { screen: "Finder" }),
        },
      ],
    );
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
            Application Form
          </Text>
          <View style={applicationFormScreenStyles.statusCapsule}>
            <Text style={applicationFormScreenStyles.statusCapsuleText}>
              Currently Applying
            </Text>
          </View>
        </View>
      </View>

      {selectedJob ? (
        <>
          <JobInfoCard job={selectedJob} />
        </>
      ) : null}

      <Text style={applicationFormScreenStyles.label}>Name</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Enter your name"
        style={applicationFormScreenStyles.input}
      />

      <Text style={applicationFormScreenStyles.label}>Email</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="Enter your email"
        keyboardType="email-address"
        autoCapitalize="none"
        style={applicationFormScreenStyles.input}
      />

      <Text style={applicationFormScreenStyles.label}>Contact Number</Text>
      <TextInput
        value={contactNumber}
        onChangeText={setContactNumber}
        placeholder="Enter your contact number"
        keyboardType="phone-pad"
        style={applicationFormScreenStyles.input}
      />

      <Text style={applicationFormScreenStyles.label}>
        Why should we hire you?
      </Text>
      <TextInput
        value={whyHire}
        onChangeText={setWhyHire}
        placeholder="Write your answer"
        multiline
        textAlignVertical="top"
        style={[
          applicationFormScreenStyles.input,
          applicationFormScreenStyles.textArea,
        ]}
      />

      <View style={applicationFormScreenStyles.buttonRow}>
        <AppButton label="Back" onPress={() => navigation.goBack()} />
        <AppButton label="Submit" onPress={handleSubmit} />
      </View>
    </ScrollView>
  );
}
