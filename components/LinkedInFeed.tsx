import Script from "next/script";
import { SOCIABLEKIT_EMBED_ID } from "@/lib/site-constants";
import { sociablekitLinkedInPagePostHostStyle } from "@/lib/sociablekit-linkedin-host-style";
import {
  SOCIABLEKIT_LINKEDIN_POSTS_DIV_CLASS,
  SOCIABLEKIT_LINKEDIN_POSTS_SCRIPT,
} from "@/lib/sociablekit";

export function LinkedInFeed() {
  return (
    <>
      <div
        className={`${SOCIABLEKIT_LINKEDIN_POSTS_DIV_CLASS} w-full min-h-[min(70vh,800px)]`}
        data-embed-id={SOCIABLEKIT_EMBED_ID}
        data-ui="new"
        style={sociablekitLinkedInPagePostHostStyle()}
      />
      <Script src={SOCIABLEKIT_LINKEDIN_POSTS_SCRIPT} strategy="lazyOnload" />
    </>
  );
}
