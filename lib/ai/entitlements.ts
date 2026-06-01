import type { UserType } from "@/app/(auth)/auth";

/** Guest users may send this many user messages before sign-in is required. */
export const GUEST_LIFETIME_MESSAGE_LIMIT = 5;

type Entitlements = {
  maxMessagesPerHour: number;
};

export const entitlementsByUserType: Record<UserType, Entitlements> = {
  guest: {
    maxMessagesPerHour: GUEST_LIFETIME_MESSAGE_LIMIT,
  },
  regular: {
    maxMessagesPerHour: 50,
  },
};

export function isGuestUserType(userType: UserType | undefined): boolean {
  return userType === "guest";
}
