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

// export const verifyEsewaPayment = async (req: Request, res: Response) => {
//   try {
//     console.log("Full Body Received:", req.body);

//     // CHANGE THIS LINE to match your frontend key
//     const { encodedData } = req.body;

//     if (!encodedData) {
//       console.error("❌ Error: 'encodedData' field is missing");
//       return res
//         .status(400)
//         .json({ message: "Payload missing 'encodedData' field" });
//     }

//     // Now use encodedData here
//     const decodedString = Buffer.from(encodedData, "base64").toString("utf-8");
//     const decodedData = JSON.parse(decodedString);

//     console.log("Decoded eSewa Data:", decodedData);

//     // ... rest of your logic (splitting uuid, prisma create, etc.)
//     const [uId, resId] = decodedData.transaction_uuid.split("-");

//     await prisma.purchase.upsert({
//       where: {
//         userId_resourceId: {
//           userId: parseInt(uId),
//           resourceId: resId,
//         },
//       },
//       update: {
//         amount: parseFloat(decodedData.total_amount.replace(/,/g, "")),
//       },
//       create: {
//         userId: parseInt(uId),
//         resourceId: resId,
//         amount: parseFloat(decodedData.total_amount.replace(/,/g, "")),
//       },
//     });
//     console.log("Resource ID: ",resId);
//     return res
//       .status(200)
//       .json({
//         success: true,
//         message: "Purchase recorded! 121212121",
//         resourceId: resId,
//       });
//   } catch (error) {
//     console.error("CRITICAL VERIFY ERROR:", error);
//     return res.status(500).json({ message: "Internal Server Error" });
//   }
// };
export const verifyEsewaPayment = async (req: Request, res: Response) => {
  try {
    const { encodedData } = req.body;
    if (!encodedData) {
      return res
        .status(400)
        .json({ message: "Payload missing 'encodedData' field" });
    }

    // 1. Decode eSewa Payload
    const decodedString = Buffer.from(encodedData, "base64").toString("utf-8");
    const decodedData = JSON.parse(decodedString);

    // 2. Parse UUID (Expects format: "userId-resourceId")
    const [uId, resId] = decodedData.transaction_uuid.split("-");
    const totalAmount = parseFloat(decodedData.total_amount.replace(/,/g, ""));

    // 3. Calculate 80/20 Split
    const creatorEarnings = totalAmount * 0.8;
    const platformFee = totalAmount * 0.2; // Keep this for your records/logs

    // 🚀 TRANSACTION START
    const result = await prisma.$transaction(async (tx) => {
      // A. Record/Update the Purchase record for the student
      const purchase = await tx.purchase.upsert({
        where: {
          userId_resourceId: {
            userId: parseInt(uId),
            resourceId: resId,
          },
        },
        update: { amount: totalAmount },
        create: {
          userId: parseInt(uId),
          resourceId: resId,
          amount: totalAmount,
        },
      });

      // B. Find the Resource to get the Creator's userId
      const resource = await tx.resource.findUnique({
        where: { id: resId },
        select: { creatorId: true },
      });

      if (!resource) {
        throw new Error("Resource not found during payment verification");
      }

      // C. Update Creator's Balance (using userId as per your schema)
      await tx.user.update({
        where: { userId: resource.creatorId },
        data: {
          totalEarnings: { increment: creatorEarnings },
        },
      });

      return { purchase, resId };
    });

    console.log(
      `✅ Payment Verified: ${totalAmount} NPR. Creator earned: ${creatorEarnings} NPR.`,
    );

    return res.status(200).json({
      success: true,
      message: "Purchase recorded and creator balance updated!",
      resourceId: result.resId,
    });
  } catch (error) {
    console.error("❌ CRITICAL VERIFY ERROR:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
