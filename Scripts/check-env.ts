import "dotenv/config";

const url = process.env.DATABASE_URL;
console.log("URL loaded?", !!url);

if (url) {
  const u = new URL(url);
  console.log("user:", u.username);
  console.log("has password?", u.password.length > 0);
  console.log("host:", u.hostname);
  console.log("port:", u.port);
  console.log("database:", u.pathname);
}