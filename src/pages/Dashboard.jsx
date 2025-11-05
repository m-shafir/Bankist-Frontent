import { useState, useEffect } from "react";
import {
  updateUserAPI,
  checkEmailExistsAPI,
  deleteUserAPI,
} from "../services/allApi";

import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  // ! Navigate hook
  const navigate = useNavigate();

  //! Filter tab
  const [activeTab, setActiveTab] = useState("all transaction");

  // !user data
  const [userData, setUserData] = useState(null);

  // ! For Transfer Amount
  const [transferEmail, setTransferEmail] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  // !  For Request Loan

  const [loanAmount, setLoanAmount] = useState("");

  // !   For delete account
  const [deleteEmail, setDeleteEmail] = useState("");
  const [deletePassword, setDeletePassword] = useState("");

  console.log(userData);

  useEffect(() => {
    const email = localStorage.getItem("loggedInEmail");
    if (email) {
      (async () => {
        try {
          const res = await checkEmailExistsAPI(email);
          const matchedUser = res.data.find((user) => user.email === email);
          setUserData(matchedUser);
        } catch (err) {
          console.error("Failed to fetch user:", err.message);
        }
      })();
    }
  }, []);

  const filteredTransactions = userData?.transactions?.filter((txn) => {
    if (activeTab === "credit") return txn.type === "deposit";
    if (activeTab === "debit") return txn.type === "withdrawal";
    return true; // all transactions
  });

  // ! to get balance

  // ! Function for transfer money

  const handleTransferMoney = async () => {
    const amount = parseFloat(transferAmount);

    // Basic validation
    if (!transferEmail || isNaN(amount) || amount <= 0) {
      toast.error("Enter valid email and amount");
      return;
    }

    // Check balance
    if (amount > userData.balance) {
      toast.error("Insufficient balance");
      return;
    }

    try {
      // Fetch recipient
      const res = await checkEmailExistsAPI(transferEmail);
      const targetUser = res.data.find((user) => user.email === transferEmail);

      if (!targetUser) {
        toast.error("Recipient not found");
        return;
      }

      // Prepare updated sender
      const updatedSender = {
        ...userData,
        balance: userData.balance - amount,
        transactions: [
          ...userData.transactions,
          {
            id: Date.now(),
            amount,
            type: "withdrawal",
            timestamp: new Date().toISOString(),
          },
        ],
      };

      // Prepare updated receiver
      const updatedReceiver = {
        ...targetUser,
        balance: targetUser.balance + amount,
        transactions: [
          ...targetUser.transactions,
          {
            id: Date.now(),
            amount,
            type: "deposit",
            timestamp: new Date().toISOString(),
          },
        ],
      };

      // Update both users
      await updateUserAPI(updatedSender.id, updatedSender);
      await updateUserAPI(updatedReceiver.id, updatedReceiver);

      // Reflect changes in UI
      setUserData(updatedSender);
      setTransferEmail("");
      setTransferAmount("");
      toast.success("Money transferred successfully");
    } catch (err) {
      toast.error("Transfer failed");
      console.error(err.message);
    }
  };

  // !delete Account

  const handleDeleteAccount = async () => {
    if (!deleteEmail || !deletePassword) {
      toast.error("Please enter email and password");
      return;
    }

    if (
      deleteEmail !== userData.email ||
      deletePassword !== userData.password
    ) {
      toast.error("Credentials do not match your account");
      return;
    }

    try {
      await deleteUserAPI(userData.id);
      toast.success("Account deleted successfully");
      localStorage.removeItem("loggedInEmail");
      navigate("/");
    } catch (err) {
      toast.error("Failed to delete account");
      console.error(err.message);
    }
  };

  //! handle Loan
  const handleLoanRequest = async () => {
    const amount = parseFloat(loanAmount);

    if (isNaN(amount) || amount <= 0 || !Number.isInteger(amount)) {
      toast.error("Enter a valid whole number for loan amount");
      return;
    }

    const maxLoan = userData.balance * 1.5;

    if (amount > maxLoan) {
      toast.error(`Loan limit exceeded. Max allowed: ₹${Math.floor(maxLoan)}`);
      return;
    }

    const hasAnyLoan = userData.loans && userData.loans.length > 0;

    if (hasAnyLoan) {
      toast.error("You already have a loan request");
      return;
    }

    const newLoan = {
      amount,
      email: userData.email,
      status: "pending",
      timestamp: new Date().toISOString(),
    };

    const updatedUser = {
      ...userData,
      loans: [newLoan],
    };

    try {
      await updateUserAPI(updatedUser.id, updatedUser);
      setUserData(updatedUser);
      setLoanAmount("");
      toast.success("Loan request submitted");
    } catch (err) {
      toast.error("Loan request failed");
      console.error(err.message);
    }
  };

  // logout

  function logout() {
    localStorage.removeItem("loggedInEmail");
    navigate("/");
  }

  return (
    <>
      <header className="mb-12 bg-[#001219] text-white flex justify-between items-center">
        <h1 className="px-12 py-6 text-2xl md:text-3xl">
          Welcome Back, {userData?.username.toUpperCase() || "User"}
        </h1>
        <button
          type="button"
          className="text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 me-12  dark:bg-red-600 dark:hover:bg-red-700 focus:outline-none dark:focus:ring-red-800 whitespace-nowrap "
          onClick={logout}
        >
          Log out
        </button>
      </header>
      <div className="container mx-auto flex justify-between mb-8">
        <div className="flex ">
          <h2 className=" font-medium text-4xl ">
            {new Date().toDateString()}
          </h2>
        </div>
        {userData?.balance && (
          <div className="flex justify-between gap-4 items-center ">
            <span className="font-medium text-4xl">Balance :</span>
            <span className="font-medium text-4xl text-emerald-500">
              {userData.balance}
            </span>
          </div>
        )}
      </div>
      <main className="grid md:grid-cols-2 gap-8 container mx-auto">
        {/* transaction Display */}
        <section className="flex flex-col gap">
          <div className="mb-4">
            <ul className="flex flex-wrap -mb-px text-sm font-medium text-center">
              {["all transaction", "credit", "debit"].map((tab) => (
                <li key={tab} className="me-2" role="presentation">
                  <button
                    onClick={() => setActiveTab(tab)}
                    className={`inline-block p-4 border-b-2 rounded-t-lg capitalize ${
                      activeTab === tab ? "border-blue-500 text-blue-600" : ""
                    }`}
                  >
                    {tab}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-4 rounded-xl min-h-[60vh] max-h-[60vh] bg-gray-50 dark:bg-gray-800 overflow-y-scroll flex flex-col gap-2">
            {filteredTransactions?.length > 0 ? (
              filteredTransactions.map((txn, idx) => (
                <Transaction key={idx} txn={txn} />
              ))
            ) : (
              <p className="text-center text-gray-500">No transactions found</p>
            )}
          </div>
        </section>

        {/* Right-side actions (unchanged) */}
        <aside className="bg-red-50 px-8 py-6 flex flex-col gap-4">
          {" "}
          <div className="bg-yellow-400 p-6 flex flex-col gap-4 rounded-2xl">
            {" "}
            <h2 className="font-medium capitalize text-xl ">
              transfet money
            </h2>{" "}
            <div className="flex gap-4">
              {" "}
              <input
                type="text"
                className="bg-gray-100 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 "
                value={transferEmail}
                onChange={(e) => setTransferEmail(e.target.value)}
                placeholder="Transfer to"
                required
              />{" "}
              <input
                type="text"
                className="bg-gray-100 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 "
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
                placeholder="Amount"
                required
              />{" "}
              <button
                type="button"
                onClick={handleTransferMoney}
                className="text-white capitalize bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2"
              >
                Share
              </button>
            </div>{" "}
          </div>{" "}
          <div className="bg-emerald-600 p-6 flex flex-col gap-4 rounded-2xl">
            {" "}
            <h2 className="font-medium capitalize text-xl ">
              request loan
            </h2>{" "}
            <div className="flex gap-4">
              {" "}
              <input
                type="text"
                className="bg-gray-100 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 "
                value={loanAmount}
                onChange={(e) => setLoanAmount(e.target.value)}
                placeholder="Amount"
                required
              />{" "}
              <button
                type="button"
                className="text-white capitalize bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 "
                onClick={handleLoanRequest}
              >
                request
              </button>
            </div>{" "}
          </div>{" "}
          <div className="bg-red-400 p-6 flex flex-col gap-4 rounded-2xl">
            {" "}
            <h2 className="font-medium capitalize text-xl ">
              Delete Account
            </h2>{" "}
            <div className="flex gap-4">
              {" "}
              <input
                type="email"
                className="bg-gray-100 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                value={deleteEmail}
                onChange={(e) => setDeleteEmail(e.target.value)}
                placeholder="Email"
                required
              />{" "}
              <input
                type="password"
                className="bg-gray-100 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 "
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                placeholder="Password"
                required
              />{" "}
              <button
                type="button"
                onClick={handleDeleteAccount}
                className="text-white capitalize bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2"
              >
                Delete
              </button>
            </div>{" "}
          </div>{" "}
        </aside>
      </main>
    </>
  );
}

function Transaction({ txn }) {
  function getPassedDay(utcTimestamp) {
    const utcDate = new Date(utcTimestamp);
    const istDate = new Date(
      utcDate.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
    );

    const now = new Date(
      new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
    );

    const diffMs = now - istDate;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays <= 7) return "This week";
    if (diffDays <= 30) return "This month";
    if (diffDays <= 90) return "Few months ago";
    return "Few years ago";
  }
  return (
    <div className="bg-white p-4 rounded-2xl flex justify-between">
      <span
        className={`rounded-full px-4 py-1 text-white font-medium capitalize ${
          txn.type === "deposit" ? "bg-emerald-400" : "bg-red-400"
        }`}
      >
        {txn.type}
      </span>
      <div className="flex gap-4 items-center ">
        <span
          className={` px-4 py-1  font-medium capitalize ${
            txn.type === "deposit" ? "text-emerald-400" : "text-red-400"
          }`}
        >
          {getPassedDay(txn.timestamp)}
        </span>
        <span className="rounded-full px-4 py-1 text-lg font-semibold capitalize">
          ₹ {txn.amount}
        </span>
      </div>
    </div>
  );
}
