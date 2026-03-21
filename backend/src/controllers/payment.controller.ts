// backend/controllers/payment.controller.ts
import crypto from "crypto";
import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

export const initiateEsewaPayment = async (req: Request, res: Response) => {
  try {
    const { resourceId } = req.body;
    // @ts-ignore
    const userId = req.user.id; // Ensure your auth middleware provides this

    const amount = "100";
    const tax_amount = "0";
    const total_amount = "100";
    const product_code = "EPAYTEST";
    const secret = "8gBm/:&EnhH.1/q";

    // CRITICAL: Format this to match your verify split logic
    // Format: userId-resourceId-timestamp
    const transaction_uuid = `${userId}-${resourceId}-${Date.now()}`;

    const hashString = `total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${product_code}`;

    const signature = crypto
      .createHmac("sha256", secret)
      .update(hashString)
      .digest("base64");

    res.json({
      amount,
      tax_amount,
      total_amount,
      transaction_uuid,
      product_code,
      product_service_charge: "0",
      product_delivery_charge: "0",
      success_url: "http://localhost:3000/payment/success",
      failure_url: "http://localhost:3000/payment/failure",
      signed_field_names: "total_amount,transaction_uuid,product_code",
      signature,
      payment_url: "https://rc-epay.esewa.com.np/api/epay/main/v2/form",
    });
  } catch (err) {
    res.status(500).json({ message: "Initialization error" });
  }
};

export const verifyEsewaPayment = async (req: Request, res: Response) => {
  try {
    const { data } = req.body;
    if (!data) return res.status(400).json({ message: "No data received" });

    // 1. Decode eSewa Response
    const decodedString = Buffer.from(data, "base64").toString("utf-8");
    const decodedData = JSON.parse(decodedString);

    console.log("✅ eSewa Decoded Data:", decodedData);

    if (decodedData.status !== "COMPLETE") {
      return res.status(400).json({ message: "Payment status not complete" });
    }

    // 2. Extract UUID Parts safely
    const parts = decodedData.transaction_uuid.split("-");
    const userId = parts[0];
    const resourceId = parts[1];

    console.log(
      `🔍 Attempting to save: User ${userId}, Resource ${resourceId}`,
    );

    // 3. Save to Database with Type Safety
    const newPurchase = await prisma.purchase.create({
      data: {
        // If your schema uses Strings for IDs, remove parseInt()
        // If your schema uses Integers, keep it but check for NaN
        userId: isNaN(Number(userId)) ? userId : parseInt(userId),
        resourceId: resourceId,
        amount: parseFloat(decodedData.total_amount.replace(/,/g, "")),
        status: "COMPLETED",
        // Optional: Save the eSewa transaction ref for your records
        transactionId: decodedData.transaction_code,
      },
    });

    console.log("🎉 Purchase successful:", newPurchase.id);
    return res.status(200).json({ success: true, message: "Access unlocked" });
  } catch (error) {
    // THIS LOG IS CRITICAL - Look at your terminal for this!
    console.error("❌ VERIFICATION CRASHED:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
