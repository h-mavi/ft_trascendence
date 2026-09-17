
import http from "http";
import https from "https";
import url from "url";
import fs from "fs";
import { openSync } from 'fs';
import express from "express";
import {Server as SocketIO} from "socket.io";
import jwt from "jsonwebtoken";
import cors from 'cors';
import passport from './passport.js';
import { parse } from "cookie";
import cookieParser from 'cookie-parser';
import multer from 'multer';
import path from "path";
import sharp from 'sharp';

// SECTION: vars
const app = express();
const server = http.createServer(app);
const logfd = openSync("../log", 'a+');
const PORT = process.env.PORT || 8080;
const ALLOWED_URL = process.env.ALLOWED_URL?.split(',') ?? ['http://localhost:5173'];

// SECTION: connections
import { redis } from "./redis.js";
import crypto from "crypto";
import { sendEmail, bodyOTP, bodyRegistration } from "./emailSender.js"

redis.on("error", (stream) =>
{
	if (process.env.IGNORE_REDIS == "true")
		return ;
	console.error(stream);
});

// SECTION - external inclusions
const include = {http, https, redis, url, fs, multer, sharp, path, express, SocketIO, app, server, parse, cookieParser};

// SECTION - macro
import * as Macro from "../Macro/macro.js";

// SECTION - Enums
import * as Enums from "../Macro/enums.js";

const conn = { redis, crypto, sendEmail, bodyOTP, bodyRegistration };
const auth = { jwt, cors, passport };

export { include, Macro, Enums, conn, auth, logfd, PORT, ALLOWED_URL};
