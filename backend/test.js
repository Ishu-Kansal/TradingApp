/*TEST FILE ONLY: NOT IN USE IN PROD */

import db from "./pgAdaptor.js";

// db.one("select * from users").then((res) => {
//   console.log(res);
// });

try {
  const user = await db.any("SELECT * FROM users");
  console.log(user);
} catch (e) {
  console.log(e);
}
