import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <section className="bg-primary-50 bg-dotted-pattern bg-contain py-5 md:py-10 ">
        <div className="wrapper grid grid-cols-1 gap-5 md:grid-cols-2 2xl:gap-0">
          <div className="flex flex-col justify-center gap-8 ">
            <h1 className=" h1-bold ">Host with Ease, Connect with Guests: Your Events, Our Platform!</h1>
            <p className="p-regular-20 md:p-regular-24">Eventers simplifies event planning with easy guest management, QR check-ins, and real-time tracking</p>
            <Button size="lg" asChild className="button w-full sm:w-fit">
              <Link href="#events">
                Explore Now
              </Link>
            </Button>
          </div>
          <Image src="/assets/images/hero.png" alt="hero Image" height={1000} width={1000} className="max-h-[70vh] object-contain object-center 3xl:max-h-[50vh]"></Image>
        </div>
      </section>
      <section id="events" className="wrapper my-8 flex flex-col gap-8 md:gap-12" >
        <h2 className=" h2-bold">
        Trusted by <br /> Thousands of Event Hosts
        </h2>
        <div className="flex w-full flex-col gap-5 md:flex-row">
          Search
          Cat
        </div>
      </section>
    </>
  );
}
