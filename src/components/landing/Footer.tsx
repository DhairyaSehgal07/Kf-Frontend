import { memo } from 'react';
import type { ReactNode } from 'react';

interface FooterNavLink {
  text: string;
  href: string;
}

interface FooterNavColumn {
  title: string;
  links: FooterNavLink[];
}

interface FooterSocialLink {
  icon: ReactNode;
  href: string;
  label: string;
}

interface FooterContact {
  address: string;
  phones: string[];
  email: string;
}

interface FooterProps {
  companyName: string;
  year: string;
  logoSrc: string;
  logoAlt: string;
  description: string;
  contact: FooterContact;
  navColumns: FooterNavColumn[];
  socialLinks: FooterSocialLink[];
}

const Footer = ({
  companyName,
  year,
  logoSrc,
  logoAlt,
  description,
  contact,
  navColumns,
  socialLinks,
}: FooterProps) => {
  return (
    <footer className="border-t border-gray-200 bg-secondary">
      {/* Main footer */}
      <div className="mx-auto max-w-[75rem] px-8 py-16 sm:px-8 lg:px-16">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-5 lg:gap-12">
          {/* Company info */}
          <div className="lg:col-span-2 space-y-6">
            <a href="/" className="inline-block">
              <img src={logoSrc} alt={logoAlt} className="h-10 w-auto" />
            </a>

            <p className="font-custom max-w-md text-sm leading-relaxed text-gray-600">
              {description}
            </p>

            {/* Social links */}
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="group p-2 text-gray-500 transition-all hover:text-primary"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="font-custom text-sm font-semibold uppercase tracking-wider text-gray-900">
              Contact us
            </h3>

            <div className="space-y-3 text-sm">
              <p className="font-custom leading-relaxed text-gray-600">{contact.address}</p>

              <div className="space-y-2">
                {contact.phones.map((phone) => (
                  <p key={phone}>
                    <a
                      href={`tel:${phone}`}
                      className="text-gray-600 transition-colors hover:text-primary"
                    >
                      {phone}
                    </a>
                  </p>
                ))}

                <p>
                  <a
                    href={`mailto:${contact.email}`}
                    className="text-gray-600 transition-colors hover:text-primary"
                  >
                    {contact.email}
                  </a>
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          {navColumns.map((column) => (
            <div key={column.title} className="space-y-4">
              <h3 className="font-custom text-sm font-semibold uppercase tracking-wider text-gray-900">
                {column.title}
              </h3>

              <ul className="space-y-3">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className="font-custom text-sm text-gray-600 transition-colors hover:text-primary"
                    >
                      {link.text}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-200 bg-white/50">
        <div className="mx-auto max-w-[75rem] px-8 py-6 sm:px-8 lg:px-16">
          <div className="flex flex-col items-center justify-between space-y-3 sm:flex-row sm:space-y-0">
            <p className="font-custom text-sm text-gray-500">
              © {year} {companyName}. All rights reserved.
            </p>

            <div className="flex space-x-6 text-sm">
              <a
                href="/privacy"
                className="font-custom text-gray-500 transition-colors hover:text-primary"
              >
                Privacy Policy
              </a>
              <a
                href="/support"
                className="font-custom text-gray-500 transition-colors hover:text-primary"
              >
                Terms of Service
              </a>
              <a
                href="/cookies"
                className="font-custom text-gray-500 transition-colors hover:text-primary"
              >
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default memo(Footer);
