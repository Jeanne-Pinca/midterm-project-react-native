import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useMemo, useState } from "react";
import { Alert, ScrollView, Text, TextInput, View } from "react-native";

import AppButton from "../../components/AppButton";
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
  const { jobs, markJobAsSubmitted } = useJobs();
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

    clearForm();
    markJobAsSubmitted(route.params.jobId);

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
    >
      <Text style={applicationFormScreenStyles.title}>Application Form</Text>
      <Text style={applicationFormScreenStyles.subtitle}>
        {selectedJob
          ? `Applying for ${selectedJob.title}`
          : "Complete your application details."}
      </Text>

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
