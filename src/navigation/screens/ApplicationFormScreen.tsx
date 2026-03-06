import { NativeStackScreenProps } from "@react-navigation/native-stack";
import countries from "i18n-iso-countries";
import enLocale from "i18n-iso-countries/langs/en.json";
import {
    CountryCode,
    getCountries,
    getCountryCallingCode,
} from "libphonenumber-js/mobile";
import { useMemo, useState } from "react";
import {
    Modal,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
} from "react-native";

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

type ApplicationFormScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "ApplicationForm"
>;

type FormDialogState = {
  visible: boolean;
  title: string;
  message: string;
  onConfirm?: () => void;
};

type CountryPhoneOption = {
  isoCode: CountryCode;
  country: string;
  code: string;
  flag: string;
};

type FieldErrors = {
  firstName?: string;
  middleName?: string;
  lastName?: string;
  email?: string;
  contactNumber?: string;
  whyHire?: string;
};

type TouchedFields = {
  firstName: boolean;
  middleName: boolean;
  lastName: boolean;
  email: boolean;
  contactNumber: boolean;
  whyHire: boolean;
};

const WHY_HIRE_MAX_LENGTH = 450;

countries.registerLocale(enLocale);

function toFlagEmoji(isoCode: string): string {
  return isoCode
    .toUpperCase()
    .replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt(0)));
}

function getCountryName(isoCode: CountryCode): string {
  return countries.getName(isoCode, "en") || isoCode;
}

const COUNTRY_PHONE_OPTIONS: CountryPhoneOption[] = getCountries()
  .map((isoCode) => ({
    isoCode,
    country: getCountryName(isoCode),
    code: `+${getCountryCallingCode(isoCode)}`,
    flag: toFlagEmoji(isoCode),
  }))
  .sort((firstOption, secondOption) =>
    firstOption.country.localeCompare(secondOption.country),
  );

function validateEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function validateFields(
  firstName: string,
  middleName: string,
  lastName: string,
  email: string,
  contactNumber: string,
  whyHire: string,
): FieldErrors {
  const normalizedFirstName = firstName.trim();
  const normalizedMiddleName = middleName.trim();
  const normalizedLastName = lastName.trim();
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedContact = contactNumber.trim();
  const normalizedWhyHire = whyHire.trim();

  const nextErrors: FieldErrors = {};

  if (!normalizedFirstName) {
    nextErrors.firstName = "First name is required.";
  } else if (normalizedFirstName.length < 2) {
    nextErrors.firstName = "First name must be at least 2 characters.";
  } else if (!/^[A-Za-z][A-Za-z\s'.-]*$/.test(normalizedFirstName)) {
    nextErrors.firstName = "First name contains invalid characters.";
  }

  if (normalizedMiddleName) {
    if (normalizedMiddleName.length < 2) {
      nextErrors.middleName = "Middle name must be at least 2 characters.";
    } else if (!/^[A-Za-z][A-Za-z\s'.-]*$/.test(normalizedMiddleName)) {
      nextErrors.middleName = "Middle name contains invalid characters.";
    }
  }

  if (!normalizedLastName) {
    nextErrors.lastName = "Last name is required.";
  } else if (normalizedLastName.length < 2) {
    nextErrors.lastName = "Last name must be at least 2 characters.";
  } else if (!/^[A-Za-z][A-Za-z\s'.-]*$/.test(normalizedLastName)) {
    nextErrors.lastName = "Last name contains invalid characters.";
  }

  if (!normalizedEmail) {
    nextErrors.email = "Email is required.";
  } else if (!validateEmail(normalizedEmail)) {
    nextErrors.email = "Please enter a valid email address.";
  }

  if (!normalizedContact) {
    nextErrors.contactNumber = "Contact number is required.";
  } else if (normalizedContact.length < 7 || normalizedContact.length > 15) {
    nextErrors.contactNumber = "Contact number must be 7 to 15 digits.";
  }

  if (!normalizedWhyHire) {
    nextErrors.whyHire = '"Why should we hire you?" is required.';
  } else if (normalizedWhyHire.length < 30) {
    nextErrors.whyHire =
      '"Why should we hire you?" must be at least 30 characters.';
  } else if (normalizedWhyHire.length > WHY_HIRE_MAX_LENGTH) {
    nextErrors.whyHire = `"Why should we hire you?" must be at most ${WHY_HIRE_MAX_LENGTH} characters.`;
  }

  return nextErrors;
}

export default function ApplicationFormScreen({
  navigation,
  route,
}: ApplicationFormScreenProps) {
  const { isDarkMode, theme } = useTheme();
  const { jobs, submitJobApplication, savedJobIds, saveJob, unsaveJob } =
    useJobs();
  const [firstName, setFirstName] = useState<string>("");
  const [middleName, setMiddleName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [contactNumber, setContactNumber] = useState<string>("");
  const [whyHire, setWhyHire] = useState<string>("");
  const [selectedCountryOption, setSelectedCountryOption] =
    useState<CountryPhoneOption>(
      COUNTRY_PHONE_OPTIONS.find((option) => option.isoCode === "US") ||
        COUNTRY_PHONE_OPTIONS[0],
    );
  const [showCountryCodePicker, setShowCountryCodePicker] =
    useState<boolean>(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [touchedFields, setTouchedFields] = useState<TouchedFields>({
    firstName: false,
    middleName: false,
    lastName: false,
    email: false,
    contactNumber: false,
    whyHire: false,
  });
  const [dialogState, setDialogState] = useState<FormDialogState>({
    visible: false,
    title: "",
    message: "",
  });

  const selectedJob = useMemo(
    () => jobs.find((job) => job.id === route.params.jobId),
    [jobs, route.params.jobId],
  );
  const isSaved = savedJobIds.includes(route.params.jobId);

  const handleGoBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }

    navigation.navigate("MainTabs", {
      screen: route.params.source === "savedJobs" ? "SavedJobs" : "Finder",
    });
  };

  const clearForm = () => {
    setFirstName("");
    setMiddleName("");
    setLastName("");
    setEmail("");
    setContactNumber("");
    setWhyHire("");
    setFieldErrors({});
    setTouchedFields({
      firstName: false,
      middleName: false,
      lastName: false,
      email: false,
      contactNumber: false,
      whyHire: false,
    });
  };

  const runFieldValidation = () => {
    const nextErrors = validateFields(
      firstName,
      middleName,
      lastName,
      email,
      contactNumber,
      whyHire,
    );
    setFieldErrors(nextErrors);
    return nextErrors;
  };

  const markFieldTouched = (field: keyof TouchedFields) => {
    setTouchedFields((current) => ({ ...current, [field]: true }));
  };

  const handleContactNumberChange = (value: string) => {
    const digitsOnly = value.replace(/[^\d]/g, "");
    setContactNumber(digitsOnly);

    if (touchedFields.contactNumber) {
      runFieldValidation();
    }
  };

  const handleWhyHireChange = (value: string) => {
    setWhyHire(value.slice(0, WHY_HIRE_MAX_LENGTH));

    if (touchedFields.whyHire) {
      runFieldValidation();
    }
  };

  const handleSelectCountryCode = (option: CountryPhoneOption) => {
    setSelectedCountryOption(option);
    setShowCountryCodePicker(false);
  };

  const handleBookmarkToggle = () => {
    if (isSaved) {
      unsaveJob(route.params.jobId);
      return;
    }

    saveJob(route.params.jobId);
  };

  const handleSubmit = () => {
    const normalizedFirstName = firstName.trim();
    const normalizedMiddleName = middleName.trim();
    const normalizedLastName = lastName.trim();
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedContact = contactNumber.trim();
    const normalizedWhyHire = whyHire.trim();

    const fullName = [
      normalizedFirstName,
      normalizedMiddleName,
      normalizedLastName,
    ]
      .filter((part) => part.length > 0)
      .join(" ");

    setTouchedFields({
      firstName: true,
      middleName: true,
      lastName: true,
      email: true,
      contactNumber: true,
      whyHire: true,
    });

    const nextErrors = validateFields(
      firstName,
      middleName,
      lastName,
      email,
      contactNumber,
      whyHire,
    );
    setFieldErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    submitJobApplication(route.params.jobId, {
      name: fullName,
      email: normalizedEmail,
      contactNumber: `${selectedCountryOption.code} ${normalizedContact}`,
      whyHire: normalizedWhyHire,
    });
    clearForm();

    setDialogState({
      visible: true,
      title: "Application Submitted",
      message: "Your application has been submitted.",
      onConfirm: () => navigation.navigate("MainTabs", { screen: "Finder" }),
    });
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
            Application Form
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
                Currently Applying
              </Text>
            </View>
            <ThemeModeToggle />
          </View>
        </View>
      </View>

      {selectedJob ? (
        <>
          <JobInfoCard job={selectedJob} />
        </>
      ) : null}

      <View
        style={[
          applicationFormScreenStyles.formContainer,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
          },
        ]}
      >
        <Text
          style={[
            applicationFormScreenStyles.label,
            { color: theme.colors.textSecondary },
          ]}
        >
          First Name
          <Text style={applicationFormScreenStyles.requiredAsterisk}> *</Text>
        </Text>
        <TextInput
          value={firstName}
          onChangeText={(value) => {
            setFirstName(value);

            if (touchedFields.firstName) {
              runFieldValidation();
            }
          }}
          onBlur={() => {
            markFieldTouched("firstName");
            runFieldValidation();
          }}
          placeholder="Enter your first name"
          placeholderTextColor={theme.colors.textMuted}
          style={[
            applicationFormScreenStyles.input,
            {
              color: theme.colors.textPrimary,
              borderColor: theme.colors.border,
              backgroundColor: isDarkMode ? "#111827" : "#fff",
            },
            touchedFields.firstName && fieldErrors.firstName
              ? applicationFormScreenStyles.inputError
              : undefined,
          ]}
        />
        {touchedFields.firstName && fieldErrors.firstName ? (
          <Text style={applicationFormScreenStyles.helperErrorText}>
            {fieldErrors.firstName}
          </Text>
        ) : null}

        <Text
          style={[
            applicationFormScreenStyles.label,
            { color: theme.colors.textSecondary },
          ]}
        >
          Middle Name
        </Text>
        <TextInput
          value={middleName}
          onChangeText={(value) => {
            setMiddleName(value);

            if (touchedFields.middleName) {
              runFieldValidation();
            }
          }}
          onBlur={() => {
            markFieldTouched("middleName");
            runFieldValidation();
          }}
          placeholder="Enter your middle name"
          placeholderTextColor={theme.colors.textMuted}
          style={[
            applicationFormScreenStyles.input,
            {
              color: theme.colors.textPrimary,
              borderColor: theme.colors.border,
              backgroundColor: isDarkMode ? "#111827" : "#fff",
            },
            touchedFields.middleName && fieldErrors.middleName
              ? applicationFormScreenStyles.inputError
              : undefined,
          ]}
        />
        {touchedFields.middleName && fieldErrors.middleName ? (
          <Text style={applicationFormScreenStyles.helperErrorText}>
            {fieldErrors.middleName}
          </Text>
        ) : null}

        <Text
          style={[
            applicationFormScreenStyles.label,
            { color: theme.colors.textSecondary },
          ]}
        >
          Last Name
          <Text style={applicationFormScreenStyles.requiredAsterisk}> *</Text>
        </Text>
        <TextInput
          value={lastName}
          onChangeText={(value) => {
            setLastName(value);

            if (touchedFields.lastName) {
              runFieldValidation();
            }
          }}
          onBlur={() => {
            markFieldTouched("lastName");
            runFieldValidation();
          }}
          placeholder="Enter your last name"
          placeholderTextColor={theme.colors.textMuted}
          style={[
            applicationFormScreenStyles.input,
            {
              color: theme.colors.textPrimary,
              borderColor: theme.colors.border,
              backgroundColor: isDarkMode ? "#111827" : "#fff",
            },
            touchedFields.lastName && fieldErrors.lastName
              ? applicationFormScreenStyles.inputError
              : undefined,
          ]}
        />
        {touchedFields.lastName && fieldErrors.lastName ? (
          <Text style={applicationFormScreenStyles.helperErrorText}>
            {fieldErrors.lastName}
          </Text>
        ) : null}

        <Text
          style={[
            applicationFormScreenStyles.label,
            { color: theme.colors.textSecondary },
          ]}
        >
          Email
          <Text style={applicationFormScreenStyles.requiredAsterisk}> *</Text>
        </Text>
        <TextInput
          value={email}
          onChangeText={(value) => {
            setEmail(value);

            if (touchedFields.email) {
              runFieldValidation();
            }
          }}
          onBlur={() => {
            markFieldTouched("email");
            runFieldValidation();
          }}
          placeholder="Enter your email"
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor={theme.colors.textMuted}
          style={[
            applicationFormScreenStyles.input,
            {
              color: theme.colors.textPrimary,
              borderColor: theme.colors.border,
              backgroundColor: isDarkMode ? "#111827" : "#fff",
            },
            touchedFields.email && fieldErrors.email
              ? applicationFormScreenStyles.inputError
              : undefined,
          ]}
        />
        {touchedFields.email && fieldErrors.email ? (
          <Text style={applicationFormScreenStyles.helperErrorText}>
            {fieldErrors.email}
          </Text>
        ) : null}

        <Text
          style={[
            applicationFormScreenStyles.label,
            { color: theme.colors.textSecondary },
          ]}
        >
          Contact Number
          <Text style={applicationFormScreenStyles.requiredAsterisk}> *</Text>
        </Text>
        <View style={applicationFormScreenStyles.contactRow}>
          <Pressable
            style={[
              applicationFormScreenStyles.countryCodeButton,
              {
                borderColor: theme.colors.border,
                backgroundColor: isDarkMode ? "#111827" : "#fff",
              },
            ]}
            onPress={() => setShowCountryCodePicker(true)}
          >
            <Text
              style={[
                applicationFormScreenStyles.countryCodeText,
                { color: theme.colors.textSecondary },
              ]}
            >
              {selectedCountryOption.flag} {selectedCountryOption.code}
            </Text>
          </Pressable>

          <TextInput
            value={contactNumber}
            onChangeText={handleContactNumberChange}
            onBlur={() => {
              markFieldTouched("contactNumber");
              runFieldValidation();
            }}
            placeholder="Enter your contact number"
            keyboardType="phone-pad"
            maxLength={15}
            placeholderTextColor={theme.colors.textMuted}
            style={[
              applicationFormScreenStyles.input,
              applicationFormScreenStyles.contactInput,
              {
                color: theme.colors.textPrimary,
                borderColor: theme.colors.border,
                backgroundColor: isDarkMode ? "#111827" : "#fff",
              },
              touchedFields.contactNumber && fieldErrors.contactNumber
                ? applicationFormScreenStyles.inputError
                : undefined,
            ]}
          />
        </View>
        {touchedFields.contactNumber && fieldErrors.contactNumber ? (
          <Text style={applicationFormScreenStyles.helperErrorText}>
            {fieldErrors.contactNumber}
          </Text>
        ) : null}

        <Text
          style={[
            applicationFormScreenStyles.label,
            { color: theme.colors.textSecondary },
          ]}
        >
          Why should we hire you?
          <Text style={applicationFormScreenStyles.requiredAsterisk}> *</Text>
        </Text>
        <TextInput
          value={whyHire}
          onChangeText={handleWhyHireChange}
          onBlur={() => {
            markFieldTouched("whyHire");
            runFieldValidation();
          }}
          placeholder="Write your answer"
          multiline
          maxLength={WHY_HIRE_MAX_LENGTH}
          textAlignVertical="top"
          placeholderTextColor={theme.colors.textMuted}
          style={[
            applicationFormScreenStyles.input,
            applicationFormScreenStyles.textArea,
            {
              color: theme.colors.textPrimary,
              borderColor: theme.colors.border,
              backgroundColor: isDarkMode ? "#111827" : "#fff",
            },
            touchedFields.whyHire && fieldErrors.whyHire
              ? applicationFormScreenStyles.inputError
              : undefined,
          ]}
        />
        <View style={applicationFormScreenStyles.helperMetaRow}>
          {touchedFields.whyHire && fieldErrors.whyHire ? (
            <Text style={applicationFormScreenStyles.helperErrorText}>
              {fieldErrors.whyHire}
            </Text>
          ) : (
            <Text
              style={[
                applicationFormScreenStyles.helperHintText,
                { color: theme.colors.textMuted },
              ]}
            >
              Minimum 30 characters.
            </Text>
          )}
          <Text
            style={[
              applicationFormScreenStyles.characterCounter,
              { color: theme.colors.textMuted },
            ]}
          >
            {whyHire.length}/{WHY_HIRE_MAX_LENGTH}
          </Text>
        </View>
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
            <AppButton label="Submit" onPress={handleSubmit} />
          </View>
          <BookmarkButton isSaved={isSaved} onPress={handleBookmarkToggle} />
        </View>
      </View>

      <AppPrompt
        visible={dialogState.visible}
        variant="dialog"
        title={dialogState.title}
        message={dialogState.message}
        onRequestClose={() =>
          setDialogState((current) => ({ ...current, visible: false }))
        }
        actions={[
          {
            label: "Okay",
            role: "primary",
            onPress: () => {
              const confirmAction = dialogState.onConfirm;
              setDialogState({
                visible: false,
                title: "",
                message: "",
              });

              if (confirmAction) {
                confirmAction();
              }
            },
          },
        ]}
      />

      <Modal
        visible={showCountryCodePicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCountryCodePicker(false)}
      >
        <Pressable
          style={applicationFormScreenStyles.countryPickerBackdrop}
          onPress={() => setShowCountryCodePicker(false)}
        >
          <Pressable
            style={[
              applicationFormScreenStyles.countryPickerContainer,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}
            onPress={() => undefined}
          >
            <Text
              style={[
                applicationFormScreenStyles.countryPickerTitle,
                { color: theme.colors.textPrimary },
              ]}
            >
              Select country code
            </Text>

            <ScrollView
              style={applicationFormScreenStyles.countryPickerOptionsList}
              contentContainerStyle={
                applicationFormScreenStyles.countryPickerOptionsContent
              }
              showsVerticalScrollIndicator={false}
            >
              {COUNTRY_PHONE_OPTIONS.map((option) => (
                <Pressable
                  key={option.isoCode}
                  style={[
                    applicationFormScreenStyles.countryPickerOption,
                    {
                      borderColor: theme.colors.border,
                      backgroundColor: isDarkMode ? "#374151" : "#fff",
                    },
                  ]}
                  onPress={() => handleSelectCountryCode(option)}
                >
                  <Text
                    style={[
                      applicationFormScreenStyles.countryPickerOptionText,
                      { color: theme.colors.textSecondary },
                    ]}
                  >
                    {option.flag} {option.country} ({option.code})
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}
