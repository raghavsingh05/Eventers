import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="h-full w-full flex items-center justify-center mt-16">
      <SignIn />
    </div>
  )
}
