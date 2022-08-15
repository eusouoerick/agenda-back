const context = ({ req }) => ({
  req,
  userReq: req.user,
  checkUser: (checkId) => {
    if (!req.user) throw new ApolloError("Unauthorized", "401");
    const { id, adm } = req.user;
    if (id === checkId || adm) return true;
    throw new ApolloError("Unauthorized", "401");
  },
  checkField: (field) => {
    // check if field is email or phone number
    const emailRegex =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    const phoneRegex = /^\(?[1-9]{2}\)? ?(?:[2-8]|9[1-9])[0-9]{3}(\-|\s)?[0-9]{4}$/;

    if (emailRegex.test(field)) return "email";
    if (phoneRegex.test(field)) return "phone";

    throw new ApolloError("Invalid credentials", "401");
  },
});


module.exports = context