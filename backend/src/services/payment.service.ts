import crypto from "crypto";
import { prisma } from "../lib/prisma.js";
import { ServiceError } from "../errors/service.error.js";

const ESEWA_PRODUCT_CODE = "EPAYTEST";
const ESEWA_SECRET = "8gBm/:&EnhH.1/q";

export const initiateEsewaService = async (userId: number, resourceId: string) => {
  const resource = await prisma.resource.findUnique({
    where: { id: resourceId },
    select: { price: true },
  });

  if (!resource) throw new ServiceError("Resource not found", 404);

  const amount = Math.max(Math.round(resource.price ?? 100), 10);
  const amountValue = String(amount);
  const txnUuid = `${userId}-${resourceId}-${Date.now()}`;

  const hashString = `total_amount=${amountValue},transaction_uuid=${txnUuid},product_code=${ESEWA_PRODUCT_CODE}`;
  const signature = crypto
    .createHmac("sha256", ESEWA_SECRET)
    .update(hashString)
    .digest("base64");

  return {
    amount: amountValue,
    tax_amount: "0",
    total_amount: amountValue,
    transaction_uuid: txnUuid,
    product_code: ESEWA_PRODUCT_CODE,
    product_service_charge: "0",
    product_delivery_charge: "0",
    success_url: `${process.env.FRONTEND_URL}/payment/success`,
    failure_url: `${process.env.FRONTEND_URL}/payment/failure`,
    signed_field_names: "total_amount,transaction_uuid,product_code",
    signature,
  };
};

export const verifyEsewaService = async (encodedData: string) => {
  if (!encodedData) throw new ServiceError("Payload missing encodedData field", 400);

  const decodedData = JSON.parse(
    Buffer.from(encodedData, "base64").toString("utf-8")
  );

  const [uId, resId] = decodedData.transaction_uuid.split("-");
  const totalAmount = parseFloat(decodedData.total_amount.replace(/,/g, ""));
  const creatorEarnings = totalAmount * 0.8;

  const result = await prisma.$transaction(async (tx) => {
    const purchase = await tx.purchase.upsert({
      where: { userId_resourceId: { userId: parseInt(uId), resourceId: resId } },
      update: { amount: totalAmount },
      create: { userId: parseInt(uId), resourceId: resId, amount: totalAmount },
    });

    const resource = await tx.resource.findUnique({
      where: { id: resId },
      select: { creatorId: true },
    });

    if (!resource) throw new Error("Resource not found during payment verification");

    await tx.user.update({
      where: { userId: resource.creatorId },
      data: { totalEarnings: { increment: creatorEarnings } },
    });

    return { purchase, resId };
  });

  return { resourceId: result.resId, totalAmount, creatorEarnings };
};
