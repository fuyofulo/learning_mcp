import jwt from "jsonwebtoken";

const JWT_SECRET = "ASDF123";

const token = jwt.sign({ userId: 123 }, JWT_SECRET);

console.log(token);
