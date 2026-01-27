import { memo } from 'react';
import { Link } from '@tanstack/react-router';

interface HeroProps {
  heroImage: {
    webp?: string;
    png: string;
    alt: string;
  };
}

const Hero = ({ heroImage }: HeroProps) => {
  return (
    <section className="bg-secondary px-4 pb-16 pt-6 sm:px-8 sm:py-24">
      <div className="mx-auto grid max-w-[75rem] grid-cols-1 items-center gap-8 py-8 sm:gap-12 md:gap-16 md:py-2 lg:grid-cols-2 lg:gap-24 xl:max-w-[81.25rem]">
        {/* LEFT */}
        <div className="text-center lg:text-left">
          <h1 className="mb-8 font-custom text-[2.1rem] font-bold leading-[1.05] tracking-[-0.5px] text-[#333] xl:text-[3rem]">
            Manage your business smarter, faster, better
          </h1>

          <p className="mb-12 font-custom text-base font-normal leading-[1.6] md:text-xl">
            Everything you need to track inventory, users, and operations — all
            in one place.
          </p>

          <div className="flex justify-center gap-4 whitespace-nowrap lg:justify-start">
            <Link
              to="/signin"
              className="font-custom rounded-lg bg-primary px-4 py-2 text-lg font-bold text-secondary hover:bg-primary/85 sm:px-8 sm:py-4 sm:text-xl"
            >
              Get Started
            </Link>

            <Link
              to="/#how-it-works"
              hash="how-it-works"
              className="font-custom rounded-lg bg-primary px-4 py-2 text-lg font-bold text-secondary hover:bg-primary/85 sm:px-8 sm:py-4 sm:text-xl"
            >
              How it works
            </Link>
          </div>

          {/* STATIC METRIC */}
          <div className="mt-8 flex items-center justify-center lg:mt-16 lg:justify-start">
            <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 sm:h-12 sm:w-12">
              <svg
                className="h-5 w-5 text-primary sm:h-6 sm:w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1z"
                />
              </svg>
            </div>

            <div>
              <p className="text-xl font-bold text-primary sm:text-2xl lg:text-3xl">
                300+
              </p>
              <p className="text-xs font-medium text-gray-600 sm:text-sm lg:text-base">
                customers visited our website
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="mt-8 flex w-full justify-center overflow-hidden lg:mt-0">
          <picture className="w-full max-w-full">
            {heroImage.webp && (
              <source srcSet={heroImage.webp} type="image/webp" />
            )}
            <img
              src={heroImage.png}
              alt={heroImage.alt}
              className="h-auto w-full max-w-full object-contain object-center"
              loading="eager"
            />
          </picture>
        </div>
      </div>
    </section>
  );
};

export default memo(Hero);
