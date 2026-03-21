// backend/controllers/payment.controller.ts
import crypto from "crypto";
import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

export const initiateEsewaPayment = async (req: Request, res: Response) => {
  try {
    const { resourceId } = req.body;
    const userId = (req as any).user.sub;

    // 1. DEFINE EXACT STRINGS
    const amountValue = "100"; // No decimals, no spaces
    const productCode = "EPAYTEST";
    const txnUuid = `${userId}-${resourceId}-${Date.now()}`;
    const secret = "8gBm/:&EnhH.1/q";

    // 2. CREATE HASH (Order matters: total_amount, transaction_uuid, product_code)
    const hashString = `total_amount=${amountValue},transaction_uuid=${txnUuid},product_code=${productCode}`;

    const signature = crypto
      .createHmac("sha256", secret)
      .update(hashString)
      .digest("base64");

    // 3. RETURN RESPONSE (Ensure keys match the form fields eSewa expects)
    res.json({
      amount: amountValue,
      tax_amount: "0",
      total_amount: amountValue, // MUST match the hashString exactly
      transaction_uuid: txnUuid,
      product_code: productCode,
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
// backend/src/controllers/payment.controller.ts

export const verifyEsewaPayment = async (req: Request, res: Response) => {
  try {
    console.log("Full Body Received:", req.body);

    // CHANGE THIS LINE to match your frontend key
    const { encodedData } = req.body;

    if (!encodedData) {
      console.error("❌ Error: 'encodedData' field is missing");
      return res
        .status(400)
        .json({ message: "Payload missing 'encodedData' field" });
    }

    // Now use encodedData here
    const decodedString = Buffer.from(encodedData, "base64").toString("utf-8");
    const decodedData = JSON.parse(decodedString);

    console.log("Decoded eSewa Data:", decodedData);

    // ... rest of your logic (splitting uuid, prisma create, etc.)
    const [uId, resId] = decodedData.transaction_uuid.split("-");

    await prisma.purchase.upsert({
      where: {
        userId_resourceId: {
          userId: parseInt(uId),
          resourceId: resId,
        },
      },
      update: {
        amount: parseFloat(decodedData.total_amount.replace(/,/g, "")),
      },
      create: {
        userId: parseInt(uId),
        resourceId: resId,
        amount: parseFloat(decodedData.total_amount.replace(/,/g, "")),
      },
    });

    return res
      .status(200)
      .json({ success: true, message: "Purchase recorded!" });
  } catch (error) {
    console.error("CRITICAL VERIFY ERROR:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
