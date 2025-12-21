import type { Request, Response } from "express";

import authService from "../services/authService.js"
import type { CreateUserDTO } from "../types/user.types.js";

const registerUser = async (req:Request<{}, {}, CreateUserDTO>, res:Response)=> {

    try {
            console.log("Reached Controller")
        const data = await authService.createUser(req.body);  
        res.status(201).json(data);  
    } catch (error) {
        res.status(501).send("Error creating user");
    }
}

export default {registerUser};