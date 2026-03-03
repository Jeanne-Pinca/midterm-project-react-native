import { useCallback } from "react";

import { useJobs } from "../../context/JobContext";

type ApplyButtonState = {
  isSubmitted: boolean;
  label: string;
  variant: "primary" | "muted";
  disabled: boolean;
};

export function useJobApplicationState() {
  const { submittedJobIds } = useJobs();

  const isJobSubmitted = useCallback(
    (jobId: string) => submittedJobIds.includes(jobId),
    [submittedJobIds],
  );

  const getApplyButtonState = useCallback(
    (jobId: string): ApplyButtonState => {
      const isSubmitted = isJobSubmitted(jobId);

      return {
        isSubmitted,
        label: isSubmitted ? "Application Submitted" : "Apply",
        variant: isSubmitted ? "muted" : "primary",
        disabled: isSubmitted,
      };
    },
    [isJobSubmitted],
  );

  return {
    isJobSubmitted,
    getApplyButtonState,
  };
}
