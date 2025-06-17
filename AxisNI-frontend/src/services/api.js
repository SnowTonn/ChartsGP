import axios from "axios";


const API_URL = `${process.env.REACT_APP_API_URL}/api`;

// Upload Excel file with sheet index and range
export const uploadExcel = async (file, sheet, range) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("sheet", sheet);
  formData.append("range", range);

  try {
    const res = await axios.post(`${API_URL}/upload/excel`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res;
  } catch (err) {
    console.error("Excel upload error:", err);
    throw err;
  }
};

export const uploadCsv = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const res = await axios.post(`${API_URL}/upload/csv`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res;
  } catch (err) {
    console.error("CSV upload error:", err);
    throw err;
  }
};

export const getSheetNames = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const res = await axios.post(`${API_URL}/upload/sheets`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res;
  } catch (err) {
    console.error("Get sheet names error:", err);
    throw err;
  }
};

export const saveChart = async (name, configJson) => {
  try {
    const res = await axios.post(`${API_URL}/chart/save`, { name, configJson });
    return res;
  } catch (err) {
    console.error("Save chart error:", err);
    throw err;
  }
};

export const getCharts = async () => {
  try {
    const res = await axios.get(`${API_URL}/chart/all`);
    return res;
  } catch (err) {
    console.error("Get charts error:", err);
    throw err;
  }
};




// import axios from "axios";

// const API_URL = "http://localhost:8080/api";

// // Upload Excel file with sheet index and range
// export const uploadExcel = async (file, sheet, range) => {
//   const formData = new FormData();
//   formData.append("file", file);
//   formData.append("sheet", sheet);
//   formData.append("range", range);

//   try {
//     const res = await axios.post(`${API_URL}/upload/excel`, formData, {
//       headers: { "Content-Type": "multipart/form-data" },
//     });
//     console.log("Excel upload response:", res);
//     return res;
//   } catch (err) {
//     console.error("Excel upload error:", err);
//     throw err;
//   }
// };

// // Upload CSV file
// export const uploadCsv = async (file) => {
//   const formData = new FormData();
//   formData.append("file", file);

//   try {
//     const res = await axios.post(`${API_URL}/upload/csv`, formData, {
//       headers: { "Content-Type": "multipart/form-data" },
//     });
//     console.log("CSV upload response:", res);
//     return res;
//   } catch (err) {
//     console.error("CSV upload error:", err);
//     throw err;
//   }
// };

// // Get sheet names from uploaded Excel file
// export const getSheetNames = async (file) => {
//   const formData = new FormData();
//   formData.append("file", file);

//   try {
//     const res = await axios.post(`${API_URL}/upload/sheets`, formData, {
//       headers: { "Content-Type": "multipart/form-data" },
//     });
//     console.log("Get sheet names response:", res);
//     return res;
//   } catch (err) {
//     console.error("Get sheet names error:", err);
//     throw err;
//   }
// };

// // Save chart data (name + JSON config)
// export const saveChart = async (name, configJson) => {
//   try {
//     const res = await axios.post(`${API_URL}/chart/save`, { name, configJson });
//     console.log("Save chart response:", res);
//     return res;
//   } catch (err) {
//     console.error("Save chart error:", err);
//     throw err;
//   }
// };

// // Get all saved charts
// export const getCharts = async () => {
//   try {
//     const res = await axios.get(`${API_URL}/chart/all`);
//     console.log("Get charts response:", res);
//     return res;
//   } catch (err) {
//     console.error("Get charts error:", err);
//     throw err;
//   }
// };
