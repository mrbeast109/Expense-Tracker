const BASE_URL = "http://localhost:5001/api";

function getToken() {
  return localStorage.getItem("token") || sessionStorage.getItem("token");
}

function authHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
  };
}

export async function loginUser(email, password) {
  const res = await fetch(`${BASE_URL}/user/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
}

export async function registerUser(name, email, password) {
  const res = await fetch(`${BASE_URL}/user/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });
  return res.json();
}

export async function fetchDashboard() {
  const res = await fetch(`${BASE_URL}/dashboard`, { headers: authHeaders() });
  return res.json();
}

export async function fetchIncome() {
  const res = await fetch(`${BASE_URL}/income/get`, { headers: authHeaders() });
  return res.json();
}

export async function addIncome(data) {
  const res = await fetch(`${BASE_URL}/income/add`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function updateIncome(id, data) {
  const res = await fetch(`${BASE_URL}/income/update/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteIncome(id) {
  const res = await fetch(`${BASE_URL}/income/delete/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  return res.json();
}

export async function fetchExpenses() {
  const res = await fetch(`${BASE_URL}/expense/get`, { headers: authHeaders() });
  return res.json();
}

export async function addExpense(data) {
  const res = await fetch(`${BASE_URL}/expense/add`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function updateExpense(id, data) {
  const res = await fetch(`${BASE_URL}/expense/update/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteExpense(id) {
  const res = await fetch(`${BASE_URL}/expense/delete/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  return res.json();
}

export async function updateUserProfile(data) {
  const res = await fetch(`${BASE_URL}/user/profile`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
}
