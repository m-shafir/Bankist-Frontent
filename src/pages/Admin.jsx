import React, { useEffect, useState } from "react";
import {
  checkEmailExistsAPI,
  getAllAccountsAPI,
  updateUserAPI,
} from "../services/allApi";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

function Admin() {
  const [isVisible, setIsVisible] = useState(false);
  const [isHidden, setIsHidden] = useState(true);

  const [displayData, setDisplayData] = useState("");

  const [currentData, setCurrentData] = useState("");

  const [data, setData] = useState({});

  const [userData, setUserData] = useState({
    password: "",
    email: "",
  });
  const navigate = useNavigate();

  const [role, setRole] = useState(null);

  useEffect(() => {
    const storedRole = localStorage.getItem("loggedInRole");
    setRole(storedRole);
  }, []);

  console.log(userData);
  console.log(displayData);

  //   handle login
  console.log(data);

  async function handleLogin() {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!userData.email || !userData.password) {
      toast.error("Please fill all fields with corresponding data");
      return;
    }

    if (!emailRegex.test(userData.email)) {
      toast.error("Invalid email format");
      return;
    }
    if (!passwordRegex.test(userData.password)) {
      toast.error(
        "Password must be at least 8 characters and include uppercase, lowercase, number, and special character"
      );
      return;
    }

    if (userData.password && userData.email) {
      try {
        const res = await checkEmailExistsAPI(userData.email);
        const matchedUser = res.data.find(
          (user) =>
            user.email === userData.email &&
            user.password === userData.password &&
            user.role === "admin"
        );

        if (matchedUser) {
          localStorage.setItem("loggedInEmail", matchedUser.email);
          localStorage.setItem("loggedInRole", matchedUser.role);
          setUserData({
            password: "",
            email: "",
          });

          setIsVisible(true);
          setCurrentData("");
        } else {
          toast.error("Invalid email or password");
        }
      } catch (error) {
        console.log("Login error:", error.message);
      }
    }
  }

  // handle logout
  function handleLogout() {
    localStorage.removeItem("loggedInEmail");
    localStorage.removeItem("loggedInRole");

    setIsVisible(false); // hide the dashboard or admin panel
    setUserData({ email: "", password: "" }); // reset form
    toast.success("Logged out successfully");

    setTimeout(() => {
      navigate("/"); // redirect to homepage
    }, 1000);
  }

  // show loans

  useEffect(() => {
    const fetchAllAccounts = async () => {
      try {
        const response = await getAllAccountsAPI();

        setData(response.data); // store all accounts directly
      } catch (error) {
        console.error("Error fetching accounts:", error);
      }
    };

    fetchAllAccounts();
  }, []);

  //! visible loan request

  const visibleLoanRequest = () => {
    setCurrentData("loan");

    const accountsWithLoans = data.filter(
      (account) => Array.isArray(account.loans) && account.loans.length > 0
    );

    setDisplayData(accountsWithLoans);
  };

  //! handle loan Request

  const handleLoanDecision = async (user, decision) => {
    const loan = user.loans[0];
    if (!loan) return;

    const updatedLoans = [];
    const updatedTransactions = [...user.transactions];
    let updatedBalance = user.balance;

    if (decision === "accept") {
      updatedTransactions.push({
        id: Date.now(),
        amount: loan.amount,
        type: "deposit",
        timestamp: new Date().toISOString(),
      });
      updatedBalance += loan.amount;
    }

    const updatedUser = {
      ...user,
      loans: updatedLoans,
      transactions: updatedTransactions,
      balance: updatedBalance,
    };

    try {
      const response = await updateUserAPI(user.id, updatedUser);

      if (response.status === 200 || response.status === 204) {
        setData((prev) =>
          prev.map((u) => (u.id === user.id ? updatedUser : u))
        );

        setDisplayData((prev) =>
          prev
            .map((u) => (u.id === user.id ? updatedUser : u))
            .filter((u) => Array.isArray(u.loans) && u.loans.length > 0)
        );

        toast.success(`Loan ${decision}ed for ${user.username}`);
      } else {
        toast.error(`Failed to ${decision} loan`);
      }
    } catch (err) {
      console.error(err);
      toast.error(`Error while processing loan`);
    }
  };

  return (
    <>
      <nav className="flex flex-col md:flex-row  justify-between py-6 px-8 bg-black h-36 md:h-20 items-center">
        <h1
          className="text-white capitalize text-2xl text-md-4xl
            "
        >
          Bankist
        </h1>

        <div className="flex gap-4 items-center mt-6 md:mt-0">
          {!role && <></>}
          <input
            type="email"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 "
            placeholder="Enter Email"
            required
            value={userData.email}
            onChange={(e) =>
              setUserData({ ...userData, email: e.target.value })
            }
          />
          <input
            type="password"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 "
            placeholder="Enter Password"
            required
            value={userData.password}
            onChange={(e) =>
              setUserData({ ...userData, password: e.target.value })
            }
          />
          <button
            type="button"
            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2  dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800 whitespace-nowrap"
            onClick={handleLogin}
          >
            Log in
          </button>
        </div>
      </nav>

      <main className="max-h-[100vh] relative">
        <button
          type="button"
          className="inline-flex items-center p-2 mt-2 ml-3 text-sm text-gray-500 rounded-lg sm:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600 absolute top-0 right-0 "
          onClick={() => setIsHidden((prev) => !prev)}
        >
          <span className="sr-only">Open sidebar</span>
          <svg
            className="w-6 h-6"
            aria-hidden="true"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              clipRule="evenodd"
              fillRule="evenodd"
              d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"
            ></path>
          </svg>
        </button>
        {isHidden && (
          <aside
            className={
              isHidden
                ? `fixed mt-36 md:mt-20 top-0 left-0 z-40 w-64 h-screen transition-transform ${
                    !isVisible && `${"hidden"}`
                  }`
                : "fixed mt-20 top-0 left-0 z-40 w-64 h-screen transition-transform  "
            }
          >
            <div className="overflow-y-auto py-5 px-3 h-full bg-white border-r border-gray-200 dark:bg-gray-800 dark:border-gray-700">
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="flex items-center p-2 text-base font-normal text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
                  >
                    <svg
                      className="w-6 h-6 text-gray-400 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z"></path>
                      <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z"></path>
                    </svg>
                    <span className="ml-3" onClick={visibleLoanRequest}>
                      Loan request
                    </span>
                  </a>
                </li>

                <li>
                  <button
                    type="button"
                    className="flex items-center p-2 w-full text-base font-normal text-gray-900 rounded-lg transition duration-75 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
                    aria-controls="dropdown-authentication"
                    data-collapse-toggle="dropdown-authentication"
                  >
                    <svg
                      aria-hidden="true"
                      className="flex-shrink-0 w-6 h-6 text-gray-400 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                        clipRule="evenodd"
                      ></path>
                    </svg>
                    <span className="flex-1 ml-3 text-left whitespace-nowrap">
                      Authentication
                    </span>
                    <svg
                      aria-hidden="true"
                      className="w-6 h-6"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      ></path>
                    </svg>
                  </button>
                  <ul
                    id="dropdown-authentication"
                    className="hidden py-2 space-y-2"
                  >
                    <li>
                      <button
                        onClick={handleLogout}
                        className="bg-red-600 w-full text-white px-4 py-2 rounded hover:bg-red-700"
                      >
                        Log out
                      </button>
                    </li>
                  </ul>
                </li>
              </ul>
            </div>

            {/* auth end */}
          </aside>
        )}
        {currentData === "loan" && (
          <div
            className={
              isHidden
                ? `ml-64 overflow-x-auto p-4`
                : "ml-0 overflow-x-auto p-4"
            }
          >
            {displayData.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200 bg-white rounded-lg shadow-md">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Loan Amount
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {displayData.map((user) => (
                    <tr key={user.email}>
                      {/* Email */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.email}
                      </td>

                      {/* Loan Amount */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {user.loans[0]?.amount}
                      </td>

                      {/* Action Buttons */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 flex gap-2">
                        <button
                          onClick={() => handleLoanDecision(user, "decline")}
                          className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400"
                        >
                          Decline
                        </button>
                        <button
                          onClick={() => handleLoanDecision(user, "accept")}
                          className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400"
                        >
                          Accept
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <h1 className="text-black text-center text-2xl md:text-4xl lg:text-5xl mt-6">
                No Loans are pending
              </h1>
            )}
          </div>
        )}
      </main>
    </>
  );
}

export default Admin;
