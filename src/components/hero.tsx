import React from "react";
import { Button } from "./ui/button";

const Hero = () => {
  return (
    <section className="py-16 lg:py-32 bg-slate-200">
      <div className="max-w-6xl mx-auto  p-4">
        <div className="">
          <h1 className="text-4xl font-semibold">
            Invest wisely with Wise Investing
          </h1>
          <h3 className="mt-4">Empowering you to make informed decisions</h3>
          <Button className="mt-10">Get Started</Button>
        </div>
        {/* <div>
          <h1>Image</h1>
        </div> */}
      </div>
    </section>
  );
};

export default Hero;
