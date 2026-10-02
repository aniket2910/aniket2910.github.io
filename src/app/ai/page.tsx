import type { Metadata } from "next";
import { Section } from "@/components/ui/section";
import { ChatPanel } from "@/components/labs/chat/chat-panel";

export const metadata: Metadata = {
  title: "Chat with my portfolio",
};

export default function AiPage() {
  return (
    <main className="min-h-screen">
      <Section index="AI" title="Chat with my portfolio">
        <p className="mb-8 max-w-prose text-muted">
          Ask a question about my experience, my skills, or the kind of role
          I&apos;m looking for. It answers grounded only in my profile, keeps
          context across follow-ups, and politely declines anything off-topic.
          Anything it can&apos;t answer, it says so honestly.
        </p>
        <ChatPanel />
      </Section>
    </main>
  );
}
