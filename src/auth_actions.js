export async function logoutRequest() {
  await fetch("http://localhost:8000/auth/logout", {
    method: "POST",
    credentials: "include",
  });
}
