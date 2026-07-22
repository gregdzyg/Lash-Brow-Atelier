import apiClient from "./apiClient";

export const getWorkingHours = async () => {
  const response = await apiClient.get(
    "/api/admin/working-hours",
  );

  return response.data;
};

export const updateWorkingHours = async (
  workingHoursId,
  workingHoursRequest,
) => {
  const response = await apiClient.put(
    `/api/admin/working-hours/${workingHoursId}`,
    workingHoursRequest,
  );

  return response.data;
};

export const getAvailabilityExceptions = async (
  start,
  end,
) => {
  const response = await apiClient.get(
    "/api/admin/availability-exceptions",
    {
      params: {
        start,
        end,
      },
    },
  );

  return response.data;
};

export const getAvailabilityException = async (
  exceptionId,
) => {
  const response = await apiClient.get(
    `/api/admin/availability-exceptions/${exceptionId}`,
  );

  return response.data;
};

export const createAvailabilityException = async (
  availabilityExceptionRequest,
) => {
  const response = await apiClient.post(
    "/api/admin/availability-exceptions",
    availabilityExceptionRequest,
  );

  return response.data;
};

export const updateAvailabilityException = async (
  exceptionId,
  availabilityExceptionRequest,
) => {
  const response = await apiClient.put(
    `/api/admin/availability-exceptions/${exceptionId}`,
    availabilityExceptionRequest,
  );

  return response.data;
};

export const archiveAvailabilityException = async (
  exceptionId,
) => {
  await apiClient.delete(
    `/api/admin/availability-exceptions/${exceptionId}`,
  );
};