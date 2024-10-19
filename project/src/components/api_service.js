import axios from "axios";

export const getDepartmentMappings = async () => {
  try {
    const response = await axios.get(
      "http://localhost:8081/departmentMappings"
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching department mappings:", error);
    return {};
  }
};

export const getPendingData = async () => {
  try {
    const response = await axios.get("http://localhost:8081/pending_data");
    return response.data;
  } catch (error) {
    console.error("Error fetching pending data:", error);
    return [];
  }
};
