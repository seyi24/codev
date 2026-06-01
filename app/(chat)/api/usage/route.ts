import { auth } from "@/app/(auth)/auth";
import { GUEST_LIFETIME_MESSAGE_LIMIT } from "@/lib/ai/entitlements";
import { getLifetimeMessageCountByUserId } from "@/lib/db/queries";
import { guestRegex } from "@/lib/constants";
import { ChatbotError } from "@/lib/errors";

export type UsageResponse = {
  isGuest: boolean;
  used: number;
  limit: number;
  remaining: number;
};

export async function GET() {
  const session = await auth();

  if (!session?.user) {
    return new ChatbotError("unauthorized:chat").toResponse();
  }

  const isGuest = guestRegex.test(session.user.email ?? "");

  if (!isGuest) {
    return Response.json({
      isGuest: false,
      used: 0,
      limit: 0,
      remaining: 0,
    } satisfies UsageResponse);
  }

  const used = await getLifetimeMessageCountByUserId({ id: session.user.id });
  const limit = GUEST_LIFETIME_MESSAGE_LIMIT;
  const remaining = Math.max(0, limit - used);

  return Response.json({
    isGuest: true,
    used,
    limit,
    remaining,
  } satisfies UsageResponse);
}
