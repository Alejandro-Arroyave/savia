import { CareType, NotificationKind, NotificationStatus } from "@prisma/client";
import { builder } from "../builder.js";

export const CareTypeEnum = builder.enumType(CareType, { name: "CareType" });
export const NotificationKindEnum = builder.enumType(NotificationKind, { name: "NotificationKind" });
export const NotificationStatusEnum = builder.enumType(NotificationStatus, {
  name: "NotificationStatus",
});
