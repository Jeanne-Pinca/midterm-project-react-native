import { ReactNode } from "react";
import { Modal, Pressable, Text, View } from "react-native";

import { useTheme } from "../context/ThemeContext";
import { appPromptStyles } from "./styles/appPromptStyles";

type PromptActionRole = "default" | "primary" | "destructive";

type PromptAction = {
  label: string;
  onPress: () => void;
  role?: PromptActionRole;
  fullWidth?: boolean;
};

type AppPromptProps = {
  visible: boolean;
  message: ReactNode;
  title?: string;
  variant?: "toast" | "dialog";
  actions?: PromptAction[];
  onRequestClose?: () => void;
};

function getButtonRoleClass(role: PromptActionRole | undefined): {
  buttonStyle?: object;
  textStyle?: object;
} {
  if (role === "primary") {
    return {
      buttonStyle: appPromptStyles.actionButtonPrimary,
      textStyle: appPromptStyles.actionTextPrimary,
    };
  }

  if (role === "destructive") {
    return {
      buttonStyle: appPromptStyles.actionButtonDestructive,
      textStyle: appPromptStyles.actionTextPrimary,
    };
  }

  return {};
}

export default function AppPrompt({
  visible,
  message,
  title,
  variant = "toast",
  actions = [],
  onRequestClose,
}: AppPromptProps) {
  const { isDarkMode, theme } = useTheme();
  const isSingleAction = actions.length === 1;

  if (!visible) {
    return null;
  }

  if (variant === "toast") {
    return (
      <View style={appPromptStyles.toastWrapper} pointerEvents="none">
        <View
          style={[
            appPromptStyles.toastContainer,
            {
              backgroundColor: isDarkMode ? "#111827" : "#111827",
              borderColor: theme.colors.border,
            },
          ]}
        >
          {typeof message === "string" ? (
            <Text style={appPromptStyles.toastText}>{message}</Text>
          ) : (
            message
          )}
        </View>
      </View>
    );
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onRequestClose}
    >
      <View style={appPromptStyles.dialogBackdrop}>
        <View
          style={[
            appPromptStyles.dialogContainer,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}
        >
          {title ? (
            <Text
              style={[
                appPromptStyles.dialogTitle,
                { color: theme.colors.textPrimary },
              ]}
            >
              {title}
            </Text>
          ) : null}
          {typeof message === "string" ? (
            <Text
              style={[
                appPromptStyles.dialogMessage,
                { color: theme.colors.textSecondary },
              ]}
            >
              {message}
            </Text>
          ) : (
            message
          )}

          <View
            style={[
              appPromptStyles.actionsRow,
              isSingleAction && appPromptStyles.actionsRowSingle,
            ]}
          >
            {actions.map((action, index) => {
              const roleStyles = getButtonRoleClass(action.role);

              return (
                <Pressable
                  key={`${action.label}-${index}`}
                  style={[
                    appPromptStyles.actionButton,
                    {
                      borderColor: theme.colors.border,
                      backgroundColor: isDarkMode ? "#374151" : "#fff",
                    },
                    index > 0 && appPromptStyles.actionButtonSpaced,
                    isSingleAction && appPromptStyles.actionButtonSingle,
                    action.fullWidth && appPromptStyles.actionButtonFullWidth,
                    roleStyles.buttonStyle,
                  ]}
                  onPress={action.onPress}
                >
                  <Text
                    style={[
                      appPromptStyles.actionText,
                      { color: theme.colors.textPrimary },
                      roleStyles.textStyle,
                    ]}
                  >
                    {action.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
}
