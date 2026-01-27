import Hero from './Hero';
import { howItWorksData, demoVideoData, footerData } from './data';
import Navbar from './Navbar';
import HowItWorks from './HowItWorks';
import DemoVideo from './DemoVideo';
import Footer from './Footer';

const LandingPage = () => {
  return (
    <div className="min-h-screen ">
      <Navbar />
      <Hero
        heroImage={{
          webp: '/hero-min.webp',
          png: '/hero-image.png',
          alt: 'Hero Image',
        }}
      />
      <HowItWorks
        title={howItWorksData.title}
        subtitle={howItWorksData.subtitle}
        steps={howItWorksData.steps}
      />
      <DemoVideo
        eyebrow={demoVideoData.eyebrow}
        title={demoVideoData.title}
        description={demoVideoData.description}
        videoId={demoVideoData.videoId}
        videoTitle={demoVideoData.videoTitle}
        detailsTitle={demoVideoData.detailsTitle}
        detailsDescription={demoVideoData.detailsDescription}
        ctaText={demoVideoData.ctaText}
        ctaHref={demoVideoData.ctaHref}
      />
      <Footer
        companyName={footerData.companyName}
        year={footerData.year}
        logoSrc={footerData.logo}
        logoAlt={footerData.logoAlt}
        description={footerData.description}
        contact={footerData.contact}
        navColumns={footerData.navColumns}
        socialLinks={footerData.socialLinks}
      />
    </div>
  );
};

export default LandingPage;
