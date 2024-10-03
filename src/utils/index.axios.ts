import axios from "axios";

const token = localStorage.getItem("token");
const headers = {
  Accept: "application/json",
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
};

export const axiosInstance = axios.create({
  baseURL: `https://staginglinkfootapi.softylines.com/api/v1`,
  headers,
});
