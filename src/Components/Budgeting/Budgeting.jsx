import React from "react";
import "./Budgeting.css";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import TranslateIcon from "@mui/icons-material/Translate";
import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import InputLabel from "@mui/material/InputLabel";
import OutlinedInput from "@mui/material/OutlinedInput";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import { Gauge, gaugeClasses } from "@mui/x-charts/Gauge";
import logo from "../Capital_One_logo.png";
import { useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import LogoutIcon from "@mui/icons-material/Logout";
import { useTranslation } from "react-i18next";

const ADDRESS = process.env.REACT_APP_CURR_ADDRESS;

function Budgeting() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const [open, setOpen] = React.useState(false);
  const [manageBudgetOpen, setManageBudgetOpen] = useState(false);
  const [manageExpenseOpen, setManageExpenseOpen] = useState(false);

  const [Language, setLanguage] = React.useState("");
  const [Currency, setCurrency] = React.useState("");

  const [userName, setUserName] = useState("");
  const [budget, setBudget] = useState("");
  const [newBudget, setNewBudget] = useState("");

  const [totalExpenses, setTotalExpenses] = useState(0);
  const [newExpenseAmount, setNewExpenseAmount] = useState("");
  const [newExpenseCategory, setNewExpenseCategory] = useState("");

  useEffect(() => {
    // Retrieve token from localStorage
    const token = localStorage.getItem("userToken");

    // If token exists, fetch the latest budget from the backend
    if (token) {
      axios
        .get(`http://${ADDRESS}:8005/api/auth/user-data`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => {
          setUserName(response.data.name);
          setBudget(response.data.budget);
          setTotalExpenses(response.data.totalExpenses);
        })
        .catch((error) => {
          console.error("Failed to fetch user data:", error);
          if (error.response && error.response.status === 401) {
            alert("Session expired or invalid token. Please log in again.");
            navigate("/login");
          }
        });
    } else if (location.state) {
      // If no token, but location state exists, use it (e.g., user just logged in)
      setUserName(location.state.name);
      setBudget(location.state.budget);
      setTotalExpenses(location.state.totalExpenses);
    } else {
      // If no state and no token, redirect to login
      navigate("/login");
    }
  }, [location.state, navigate]);

  useEffect(() => {
    // Check if state exists and if yes, update the budgetValue and expenses
    if (location.state) {
      setUserName(location.state.name);
      setBudget(location.state.budget);
    }
  }, [location.state]);

  const handleChange = (event) => {
    setLanguage(Number(event.target.value) || "");
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = (event, reason) => {
    if (reason !== "backdropClick") {
      setOpen(false);
    }
  };

  const handleManageBudgetOpen = () => {
    setManageBudgetOpen(true);
  };

  const handleManageBudgetClose = () => {
    setManageBudgetOpen(false);
  };

  const handleManageExpenseOpen = () => {
    setManageExpenseOpen(true);
  };

  const handleManageExpenseClose = () => {
    setManageExpenseOpen(false);
  };

  const handleManageBudgetSubmit = () => {
    setManageBudgetOpen(false);
    const token = localStorage.getItem("userToken");

    axios
      .post(
        `http://${ADDRESS}:8005/api/auth/update-budget`,
        {
          budget: parseInt(newBudget),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Correctly setting the authorization header
          },
        }
      )
      .then((response) => {
        console.log(response.data.message);
        setBudget(newBudget); // Update state only on successful API response
      })
      .catch((error) => {
        console.error("Failed to update budget:", error);
        if (error.response && error.response.status === 401) {
          alert("Session expired or invalid token. Please log in again.");
          navigate("/login");
        }
      });
  };

  const handleLogout = () => {
    localStorage.removeItem("userToken");
    navigate("/login");
  };

  const handleAddExpenseSubmit = () => {
    setManageExpenseOpen(false);

    // Convert the newExpenseAmount to a number
    const expenseAmount = parseFloat(newExpenseAmount);

    if (!isNaN(expenseAmount) && expenseAmount > 0) {
      // Update the total expenses
      setTotalExpenses((prevTotal) => parseFloat(prevTotal) + expenseAmount);

      // Update the category-specific expenses based on the selected category
      const token = localStorage.getItem("userToken");
      axios
        .post(
          `http://${ADDRESS}:8005/api/auth/add-expense`,
          {
            amount: expenseAmount,
            category: newExpenseCategory,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
        .then((response) => {
          console.log(response.data.message);
          fetchUserData(token);
        })
        .catch((error) => {
          console.error("Failed to add expense:", error);
          if (error.response && error.response.status === 401) {
            alert("Session expired or invalid token. Please log in again.");
            navigate("/login");
          }
        });
    } else {
      console.error("Invalid expense amount");
    }
    setNewExpenseAmount("");
    setNewExpenseCategory("");
  };
  const fetchUserData = async (token) => {
    try {
      const response = await axios.get(
        `http://${ADDRESS}:8005/api/auth/user-data`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log("Fetched user data:", response.data);
      navigate("/Home", {
        state: {
          name: response.data.name,
          budget: response.data.budget,
          totalExpenses: response.data.totalExpenses,
          groceryExpenses: response.data.groceryExpenses,
          billsExpenses: response.data.billsExpenses,
          subscriptionExpenses: response.data.subscriptionExpenses,
          gasExpenses: response.data.gasExpenses,
          otherExpenses: response.data.otherExpenses,
          savings: response.data.savings,
        },
      });
    } catch (error) {
      console.error("Failed to fetch user data:", error);
    }
  };

  return (
    <div>
      <div className="headerBanner">
        <img className="logo" src={logo} alt="" />
        <div className="logoutButton" onClick={handleLogout}>
          <LogoutIcon />
        </div>
      </div>
      <div className="BudgetContainer">
        <div className="BudgetCard">
          <div className="BudgetContent">
            <div className="BudgetHeader">
              <p style={{ fontWeight: "500" }}>
                {t("Greeting")} {userName},
              </p>
              <p>{t("BudgetTitle")}</p>
            </div>
            <div className="BudgetGauge">
              <Gauge
                className="test"
                width={250}
                height={170}
                value={totalExpenses}
                valueMax={budget}
                startAngle={-110}
                endAngle={110}
                sx={{
                  [`& .${gaugeClasses.valueText}`]: {
                    fontSize: 23,
                    fontFamily: "Poppins",
                    fontWeight: 500,
                    transform: "translate(0px, -14px)",
                  },
                  [`& .${gaugeClasses.valueText} text`]: {
                    fill: "#ffffff",
                  },
                  [`& .${gaugeClasses.valueArc}`]: {
                    fill: "#d03027",
                  },
                  [`& .${gaugeClasses.referenceArc}`]: {},
                }}
                text={({ value, valueMax }) =>
                  valueMax === 0 ? `$${value}/$X.XX` : `$${value}/$${valueMax}`
                }
              />
            </div>
            <div className="ButtonSection">
              <div className="BudgetButton" onClick={handleManageBudgetOpen}>
                {t("ManageBudget")}
              </div>
              <div className="BudgetButton" onClick={handleManageExpenseOpen}>
                {t("AddExpense")}
              </div>
            </div>
          </div>
        </div>
        <Dialog
          open={manageBudgetOpen}
          onClose={handleManageBudgetClose}
          PaperProps={{
            sx: {
              display: "flex",
              flexDirection: "column",
            },
          }}
        >
          <DialogTitle>
            {t("ManageBudget")}
            <IconButton
              aria-label="close"
              onClick={handleManageBudgetClose}
              sx={{
                position: "absolute",
                right: 8,
                top: 8,
                color: (theme) => theme.palette.grey[500],
              }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <div className="budgetInput">
              <input
                id="budget"
                placeholder="New Budget"
                name="budget"
                className="budgetIn"
                value={newBudget ? `$${newBudget}` : ""}
                onChange={(e) => {
                  const valueWithoutDollar = e.target.value.replace(/^\$/, "");
                  setNewBudget(valueWithoutDollar);
                }}
              />
              <Button
                className="center-button"
                sx={{
                  backgroundColor: "rgb(71,140,209)",
                  color: "white",
                  "&:hover": {
                    backgroundColor: "rgb(0,72,120)",
                  },
                }}
                variant="contained"
                type="submit"
                onClick={handleManageBudgetSubmit}
              >
                {t("Submit")}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        <Dialog
          open={manageExpenseOpen}
          onClose={handleManageExpenseClose}
          PaperProps={{
            sx: {
              display: "flex",
              flexDirection: "column",
            },
          }}
        >
          <DialogTitle>
            {t("Add Expense")}
            <IconButton
              aria-label="close"
              onClick={handleManageExpenseClose}
              sx={{
                position: "absolute",
                right: 8,
                top: 8,
                color: (theme) => theme.palette.grey[500],
              }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <div className="amountInput">
              <input
                id="amount"
                placeholder="New Expense Amount"
                name="amount"
                className="amountIn"
                value={newExpenseAmount ? `$${newExpenseAmount}` : ""}
                onChange={(e) => {
                  const valueWithoutDollar = e.target.value.replace(/^\$/, "");
                  setNewExpenseAmount(valueWithoutDollar);
                }}
              />
              <FormControl sx={{ m: 1, minWidth: 120 }}>
                <InputLabel htmlFor="demo-dialog-native">
                  {t("Category")}
                </InputLabel>
                <Select
                  native
                  value={newExpenseCategory}
                  onChange={(e) => setNewExpenseCategory(e.target.value)}
                >
                  <option aria-label="None" value="" />
                  <option value={"groceries"}>{t("PieVal1")}</option>
                  <option value={"bills"}>{t("PieVal2")}</option>
                  <option value={"subscriptions"}>{t("PieVal3")}</option>
                  <option value={"gas"}>{t("PieVal4")}</option>
                  <option value={"savings"}>{t("PieVal5")}</option>
                  <option value={"other"}>{t("PieVal6")}</option>
                </Select>
              </FormControl>
              <Button
                className="center-button"
                sx={{
                  backgroundColor: "rgb(71,140,209)",
                  color: "white",
                  "&:hover": {
                    backgroundColor: "rgb(0,72,120)",
                  },
                }}
                variant="contained"
                type="submit"
                onClick={handleAddExpenseSubmit} // Use the new function here
              >
                {t("Submit")}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

export default Budgeting;
