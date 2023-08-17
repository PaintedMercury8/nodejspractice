const userName = "alex";

const validateUser = (loggedUser) => {
  let result = userName === loggedUser ? "Welcome!" : "Invalid User Name";
  return result;
};

export default validateUser;
