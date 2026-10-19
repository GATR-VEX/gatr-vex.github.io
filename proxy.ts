export { auth as proxy } from "@/auth";

export const config = {
  matcher: ["/members/:path*", "/api/prints/:path*"],
};
