import type { Request, Response } from "express";
import { initiateEsewaService, verifyEsewaService } from "../services/payment.service.js";

export const initiateEsewaPayment = async (req: Request, res: Response) => {
  try {
    const { resourceId } = req.body;
    const userId = Number((req as any).user.sub);
    const payload = await initiateEsewaService(userId, resourceId);
    res.json(payload);
  } catch (err: any) {
    res.status(err.statusCode || 500).json({ message: err.message || "Initialization error" });
  }
};

export const verifyEsewaPayment = async (req: Request, res: Response) => {
  try {
    const { encodedData } = req.body;
    const result = await verifyEsewaService(encodedData);
    res.status(200).json({
      success: true,
      message: "Purchase recorded and creator balance updated!",
      resourceId: result.resourceId,
    });
  } catch (err: any) {
    console.error("Payment verify error:", err);
    res.status(err.statusCode || 500).json({ message: err.message || "Internal Server Error" });
  }
};
