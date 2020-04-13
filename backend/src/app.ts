// needed for typeorm && type-graphl to function
import "reflect-metadata";
// imports the .env file
import "./env";
import { config } from "./config";
import { createSQLiteServerSchema } from "./connect";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { Container } from "typedi";
import {
    AuthService,
    LoginInfo,
    SignupInfo,
    getAuthToken,
} from "./services/auth";
import { UploadService } from "./services/upload";
import cors from "cors";
import bodyParser from "body-parser";
import fileUpload, { UploadedFile } from "express-fileupload";
import session from "express-session";
import { PublicError } from "./utils";

function wrapAsync(handler: express.Handler) {
    return async (
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) => {
        try {
            await handler(req, res, next);
            if (!res.headersSent) {
                throw new Error("failed to send headers");
            }
        } catch (e) {
            if (e instanceof PublicError) {
                console.info(e);
                res.status(400).send({
                    message: e.message,
                });
            } else {
                console.error(e);
                res.status(500).send({
                    message: "an internal error occurred",
                });
            }
        }
    };
}

// register 3rd party IOC container
export async function createApp() {
    // gets the graphql server schema
    const schema = await createSQLiteServerSchema();
    const authService = Container.get(AuthService);
    const app = express();

    // sets up cors
    app.use(
        cors({
            origin: [
                "http://localhost:4000",
                "http://localhost:3000",
                /yiblet\.com$/,
            ],
            credentials: true,
        })
    );
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(
        session({
            name: config.session.name,
            secret: config.session.secret,
            resave: false,
            saveUninitialized: false,
        })
    );

    app.use(
        fileUpload({
            // limits to 50M
            limits: { fileSize: 50 * 1024 * 1024 },
        })
    );

    app.get("/cors-test", (req, res) => {
        res.status(200).send("this should return a OK 200 if cors works");
    });

    app.post(
        "/signup",
        wrapAsync(async (req, res) => {
            const signup = new SignupInfo();
            signup.email = req?.body?.email;
            signup.password = req?.body?.password;
            signup.password2 = req?.body?.password2;
            signup.firstname = req?.body?.firstname;
            signup.lastname = req?.body?.lastname;
            const user = await authService.signup(signup);
            const token = await authService.genToken(user);
            res.status(200).send({
                token: token,
            });
        })
    );

    app.post(
        "/login",
        wrapAsync(async (req, res) => {
            const login = new LoginInfo();
            login.email = req?.body?.email;
            login.password = req?.body?.password;
            const user = await authService.login(login);
            const token = await authService.genToken(user);
            res.status(200).send({
                token: token,
            });
        })
    );

    app.post(
        "/refresh",
        wrapAsync(async (req, res) => {
            const token = getAuthToken(req);
            const user = await authService.verify(token);
            const newToken = await authService.genToken(user);
            res.status(200).send({
                token: newToken,
            });
        })
    );

    app.post(
        "/upload",
        wrapAsync(async (req, res) => {
            const uploadService = Container.get(UploadService);
            let file: UploadedFile;
            if (!req.files.data) {
                throw new PublicError("must pass in file");
            }

            if (Array.isArray(req.files.data)) {
                file = req.files.data[0];
            } else {
                file = req.files.data;
            }
            const fileResult = await uploadService.upload(file.name, file.data);
            res.status(200).send({
                fileId: fileResult.id,
            });
        })
    );

    app.get("/logout", (req, res) => {
        res.redirect("/");
    });

    const server = new ApolloServer({ ...schema });
    server.applyMiddleware({ app, path: "/graphql" });
    return app;
}