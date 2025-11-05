import { commonAPI } from "./commonAPI";
import { serviceURL } from "./serviceURL";

// ! api for create acoount
export const createAccountAPI = async (reqBody) => {
  return await commonAPI("POST", `${serviceURL}/accounts`, reqBody);
};

// ! GEt All Accounts

export const getAllAccountsAPI = async () => {
  return await commonAPI("GET", `${serviceURL}/accounts`);
};

//! APi for check is the email already existed
// imp :  encodeURIComponent() is a built-in JavaScript function that ensures special characters in a URL query string are safely encoded, so they don’t break the request or get misinterpreted.
export const checkEmailExistsAPI = async (email) => {
  return await commonAPI(
    "GET",
    `${serviceURL}/accounts?email=${encodeURIComponent(email)}`
  );
};


//! update data of a User
export const updateUserAPI = async (id, updatedData) => {
  return await commonAPI("PUT", `${serviceURL}/accounts/${id}`, updatedData);
};

//! delete user api

export const deleteUserAPI = async (id) => {
  return await commonAPI("DELETE", `${serviceURL}/accounts/${id}`);
};
