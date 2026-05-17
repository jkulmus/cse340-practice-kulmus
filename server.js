// Imports
import "dotenv/config";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import routes from "./src/controllers/routes.js";
import { addLocalVariables } from "./src/middleware/global.js";


/**
 * Declare Important Variables
 */
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || "development";

// Correct for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Setup Express Server
 */
const app = express();

app.use(
express.static(
path.join(
__dirname,
"public"
)
)
);

app.set(
"view engine",
"ejs"
);

app.set(
"views",
path.join(
__dirname,
"src/views"
)
);

app.use(
addLocalVariables
);

app.use(
"/",
routes
);

app.use(
(req,res,next)=>{
const err = new Error(
"Page Not Found"
);
err.status =
404;
next(err);
}
);

app.use(
(err,req,res,next)=>{
const status =
err.status || 500;

const template =
status === 404 ? "404" : "500";

res.status(
status
).render(`errors/${template}`,
{ title: status===404 ? "Not Found" : "Server Error",
error:
err.message,
NODE_ENV
}
);
}
);

app.listen(
PORT,
()=>{
console.log(
`Server:http://localhost:${PORT}`
);
}
);