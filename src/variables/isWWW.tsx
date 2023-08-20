import axiosInstance from "variables/axiosInstance";
import isTest from "variables/isTest";

const isWWW = () => isTest
    ? axiosInstance.defaults.baseURL?.includes("www.") ?? false
    : location.hostname.includes("www.");

export default isWWW