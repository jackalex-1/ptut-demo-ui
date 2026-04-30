import Image from "next/image";
import { ChatContainer } from "./components/chat/ChatContainer";

export default function Home() {
  return (
    <main className="page-wrapper">
      <Image
        src="/logo_ptut.jpg"
        alt=""
        fill
        className="bg-image"
        priority
        quality={85}
      />
      <div className="bg-video-overlay" />
      <ChatContainer />
    </main>
  );
}
