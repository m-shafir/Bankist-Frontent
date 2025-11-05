import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye } from "react-icons/fa";
import { FaEyeSlash } from "react-icons/fa";
import { toast } from "react-toastify";
import { checkEmailExistsAPI, createAccountAPI } from "../services/allApi";

export default function Signup() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);

  const [userData, setUserData] = useState({
    id: null,
    username: "",
    email: "",
    password: "",
    role: "customer",
    transactions: [
      {
        id: 1,
        amount: 15000,
        type: "deposit",
        timestamp: new Date().toISOString(),
      },
    ],
    balance: 15000,
    loans: [],
  });

  const [errors, setErrors] = useState({
    username: "",
    email: "",
    password: "",
  });

  console.log(userData);
  async function handleCreateAccount() {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    const usernameRegex = /^[a-zA-Z0-9_]{3,15}$/;

    const newErrors = {
      username: "",
      email: "",
      password: "",
    };

    if (!userData.username || !userData.email || !userData.password) {
      const message = "Please fill all fields with corresponding data";

      newErrors.username = message;
      setErrors(newErrors);
      return;
    } else {
      if (!usernameRegex.test(userData.username)) {
        newErrors.username =
          "Username must be 3-15 characters and contain only letters, numbers, or underscores";
      }
      if (!emailRegex.test(userData.email)) {
        newErrors.email = "Invalid email format";
      }
      if (!passwordRegex.test(userData.password)) {
        newErrors.password =
          "Password must be at least 8 characters and include uppercase, lowercase, number, and special character";
      }
    }

    setErrors(newErrors);

    // If no errors, proceed
    if (!newErrors.username && !newErrors.email && !newErrors.password) {
      try {
        const res = await checkEmailExistsAPI(userData.email);
        console.log(res);

        const sameEmail = res.data.some(
          (curr) => curr.email.toLowerCase() === userData.email.toLowerCase()
        );

        if (sameEmail) {
          toast.error("Email is already used");
          return;
        }
      } catch (error) {
        console.log(error.message);
      }

      try {
        const result = await createAccountAPI(userData);
        if (result.status >= 200 && result.status < 300) {
          toast.success("Success! Account created.");
          setTimeout(() => {
            setUserData({
              id: null,
              username: "",
              email: "",
              password: "",
              role: "customer",
              transactions: [
                {
                  id: 1,
                  amount: 15000,
                  type: "deposit",
                  timestamp: new Date().toISOString(),
                },
              ],
            });
          }, 500);
          setTimeout(() => {
            navigate("/");
          }, 3000);
        }
      } catch (error) {
        console.log(error.message);
      }
    }
  }

  return (
    <>
      <header>
        <nav className="bg-white dark:bg-gray-900 fixed w-full z-20 top-0 start-0 border-b border-gray-200 dark:border-gray-600">
          <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
            <h1
              className="text-white capitalize text-2xl text-md-4xl
            "
            >
              Bankist
            </h1>
            <div className="flex md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse">
              <button
                type="button"
                className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                onClick={() => navigate("/")}
              >
                Log in
              </button>
            </div>
          </div>
        </nav>
      </header>
      <main className="flex justify-center items-center h-[100vh] bg-amber-50">
        <form className="bg-black py-16 md:mt-12 px-20 rounded-2xl">
          <label
            htmlFor="input-group-1"
            className="block mb-2 text-sm font-medium text-[#e5e5e5] dark:text-white"
          >
            Email
          </label>
          <div className="relative mb-2">
            <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
              <svg
                className="w-4 h-4 text-gray-500 dark:text-gray-400"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 20 16"
              >
                <path d="m10.036 8.278 9.258-7.79A1.979 1.979 0 0 0 18 0H2A1.987 1.987 0 0 0 .641.541l9.395 7.737Z" />
                <path d="M11.241 9.817c-.36.275-.801.425-1.255.427-.428 0-.845-.138-1.187-.395L0 2.6V14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2.5l-8.759 7.317Z" />
              </svg>
            </div>
            <input
              type="email"
              id="input-group-1"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="Enter email"
              value={userData.email}
              onChange={(e) =>
                setUserData({ ...userData, email: e.target.value })
              }
            />
          </div>
          {errors.email && (
            <p className=" max-w-[300px] my-2 text-red-600">{errors.email}</p>
          )}
          <label
            htmlFor="website-password"
            className="block mb-2 text-sm font-medium text-[#e5e5e5] dark:text-white"
          >
            Password
          </label>

          <div className="flex mb-2 relative">
            {/* Leading icon */}
            <span className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border rounded-e-0 border-gray-300 border-e-0 rounded-s-md dark:bg-gray-600 dark:text-gray-400 dark:border-gray-600">
              <svg
                className="w-4 h-4 text-gray-500 dark:text-gray-400"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M10 0a10 10 0 1 0 10 10A10.011 10.011 0 0 0 10 0Zm0 5a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm0 13a8.949 8.949 0 0 1-4.951-1.488A3.987 3.987 0 0 1 9 13h2a3.987 3.987 0 0 1 3.951 3.512A8.949 8.949 0 0 1 10 18Z" />
              </svg>
            </span>

            {/* Password input */}
            <input
              type={showPassword ? "text" : "password"}
              id="website-password"
              className="rounded-none rounded-e-lg bg-gray-50 border text-gray-900 focus:ring-blue-500 focus:border-blue-500 block flex-1 min-w-0 w-full text-sm border-gray-300 p-2.5 pr-10 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="Enter Password"
              value={userData.password}
              onChange={(e) =>
                setUserData({ ...userData, password: e.target.value })
              }
            />

            {/* Eye toggle button */}
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-2.5 text-gray-500 dark:text-gray-300"
            >
              {showPassword ? <FaEye /> : <FaEyeSlash />}
            </button>
          </div>
          {errors.password && (
            <p className=" max-w-[300px] my-2 text-red-600">
              {errors.password}
            </p>
          )}
          <label
            htmlFor="website-username"
            className="block mb-2 text-sm font-medium text-[#e5e5e5] dark:text-white"
          >
            Username
          </label>
          <div className="flex">
            <span className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border rounded-e-0 border-gray-300 border-e-0 rounded-s-md dark:bg-gray-600 dark:text-gray-400 dark:border-gray-600">
              <svg
                className="w-4 h-4 text-gray-500 dark:text-gray-400"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M10 0a10 10 0 1 0 10 10A10.011 10.011 0 0 0 10 0Zm0 5a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm0 13a8.949 8.949 0 0 1-4.951-1.488A3.987 3.987 0 0 1 9 13h2a3.987 3.987 0 0 1 3.951 3.512A8.949 8.949 0 0 1 10 18Z" />
              </svg>
            </span>
            <input
              type="text"
              id="website-username"
              className="rounded-none rounded-e-lg bg-gray-50 border text-gray-900 focus:ring-blue-500 focus:border-blue-500 block flex-1 min-w-0 w-full text-sm border-gray-300 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="Enter username"
              value={userData.username}
              onChange={(e) =>
                setUserData({ ...userData, username: e.target.value })
              }
            />
          </div>
          {errors.username && (
            <p className=" max-w-[300px] my-2 text-red-600">
              {errors.username}
            </p>
          )}
          <button
            type="button"
            className="block w-full text-blue-700 hover:text-white border border-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-6 py-2.5 text-center me-2 mb-2 mt-12 dark:border-blue-500 dark:text-blue-500 dark:hover:text-white dark:hover:bg-blue-500 dark:focus:ring-blue-800"
            onClick={handleCreateAccount}
          >
            Create Account
          </button>
        </form>
      </main>
    </>
  );
}
