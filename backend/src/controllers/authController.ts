import type { Request, Response } from "express";

import authService from "../services/authService.js"
import type { CreateUserDTO } from "../types/user.types.js";

const registerUser = async (req:Request<{}, {}, CreateUserDTO>, res:Response)=> {

    try {
        const data = await authService.createUser(req.body);    
    } catch (error) {
        
    }
}

export default {registerUser};