const userName = "alex";

const validateUser = (loggedUser) => {
  let result = userName === loggedUser ? "Welcome!" : "Invalid User Name";
  console.log(userName);
  return result;
};

export default validateUser;
