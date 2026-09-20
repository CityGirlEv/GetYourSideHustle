import React, { useEffect, useState } from 'react';
import { ChevronDown, FileText } from 'lucide-react';
import { launchPageContentOffset } from '../lib/headerClearance';
import { PAGE_CANVAS_CLASS } from '../lib/brandUi';
import {
  flattenLaunchFaqs,
  groupLaunchSections,
  launchPageById,
  type LaunchPageId,
  type LaunchSection,
} from '../lib/launchPages';
import { applyDocumentMeta, formatPublicPageTitle } from '../lib/pageMeta';
import { HOUSE_BRAND_KICKER, HOUSE_BRAND_NAME } from '../lib/teeSalesPlaybook';
import { Logo } from './Logo';
import { MailingListSignup } from './MailingListSignup';
import { ContactForm } from './ContactForm';

interface LaunchPageProps {
  pageId: LaunchPageId;
  embedded?: boolean;
}

function LaunchSectionCopy({ section }: { section: LaunchSection }) {
  const paragraphs = Array.isArray(section.body) ? section.body : [section.body];
  return (
    <div className="mb-4 last:mb-0">
      <h2 className="text-lg font-serif font-black uppercase tracking-tight text-[#1F1917] mb-3">{section.heading}</h2>
      {paragraphs.map((paragraph) => (
        <p key={paragraph} className="text-sm text-[#3F3832] font-medium leading-relaxed mb-2 last:mb-0">
          {paragraph}
        </p>
      ))}
      {section.link ? (
        <a
          href={section.link.href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-[44px] items-center text-sm font-black uppercase tracking-wider text-[#C2410C] hover:text-[#9A3412]"
        >
          {section.link.label}
        </a>
      ) : null}
    </div>
  );
}

export const LaunchPage: React.FC<LaunchPageProps> = ({ pageId, embedded = false }) => {
  const page = launchPageById(pageId);
  const faqs = flattenLaunchFaqs(page);
  const groups = page.faqGroups?.length ? page.faqGroups : faqs.length ? [{ heading: '', items: faqs }] : [];
  const [openFaq, setOpenFaq] = useState(0);
  const compact = Boolean(page.compactHero);
  const heading = page.headline ?? page.title;

  useEffect(() => {
    return applyDocumentMeta({
      title: page.metaTitle ?? formatPublicPageTitle(page.title),
      description: page.metaDescription ?? page.lede,
    });
  }, [page.lede, page.metaDescription, page.metaTitle, page.title]);

  let faqIndex = -1;
  const sectionCards = groupLaunchSections(page.sections).map((group) => (
    <article
      key={group.sections.map((section) => section.heading).join('|')}
      className="bg-white border-2 border-[#1F1917] rounded-3xl p-5 sm:p-6 overflow-hidden"
    >
      {group.image ? (
        <figure className="float-left mr-4 mb-3 w-[42%] max-w-[11.5rem] sm:max-w-[13rem]">
          <img
            src={group.image.src}
            alt={group.image.alt}
            className="w-full aspect-[3/4] object-cover object-top rounded-2xl border-2 border-[#1F1917]"
            data-testid={`${page.id}-inline-photo`}
          />
        </figure>
      ) : null}
      {group.sections.map((section) => (
        <LaunchSectionCopy key={section.heading} section={section} />
      ))}
    </article>
  ));

  return (
    <div
      className={`${PAGE_CANVAS_CLASS} ${embedded ? 'min-h-0' : `min-h-[60vh] ${launchPageContentOffset(page.id)}`}`}
      id={`${page.id}-page`}
      data-testid={`${page.id}-page`}
    >
      <section
        className={`bg-gradient-to-br from-[#FFF7ED] via-[#FFEDD5] to-[#FEF3C7] text-[#9A3412] border-b-4 border-[#EA580C] ${
          compact ? 'py-2.5 sm:py-3' : 'py-10 sm:py-14'
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`flex items-center ${compact ? 'gap-2.5' : 'flex-col sm:flex-row gap-6 sm:gap-8'}`}>
            <Logo
              variant="seal-only"
              size={compact ? 'sm' : 'xl'}
              className={`shrink-0 drop-shadow-lg ${compact ? '!w-8 !h-8 sm:!w-9 sm:!h-9' : '!w-24 !h-24 sm:!w-32 sm:!h-32'}`}
            />
            <div className={`${compact ? 'text-left min-w-0' : 'text-center sm:text-left space-y-3'}`}>
              {compact ? (
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#EA580C] text-white text-[9px] font-mono font-black uppercase tracking-wider leading-none">
                    <FileText className="w-3 h-3" /> {page.kicker}
                  </span>
                  <h1 className="font-serif font-black tracking-tighter leading-none text-[#9A3412] text-xl sm:text-2xl">
                    {heading}
                  </h1>
                </div>
              ) : (
                <>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#EA580C] text-white text-[10px] font-mono font-black uppercase tracking-wider">
                    <FileText className="w-3.5 h-3.5" /> {page.kicker}
                  </div>
                  <h1 className="font-serif font-black uppercase tracking-tight leading-tight text-[#9A3412] text-3xl sm:text-4xl lg:text-5xl">
                    {heading}
                  </h1>
                </>
              )}
              {compact ? (
                <p className="mt-0.5 text-xs sm:text-sm text-[#C2410C] font-medium leading-snug line-clamp-1">{page.lede}</p>
              ) : (
                <>
                  <p className="text-sm sm:text-base text-[#C2410C] font-medium max-w-2xl leading-relaxed">{page.lede}</p>
                  <p className="text-xs font-mono font-bold uppercase tracking-wider text-[#9A3412]">
                    {HOUSE_BRAND_NAME} — {HOUSE_BRAND_KICKER}
                  </p>
                </>
              )}
              {page.lastUpdated ? (
                <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#9A3412]">
                  Last updated: {page.lastUpdated}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <section
        className={`max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 ${
          compact ? 'pt-4 pb-8 sm:pt-5 sm:pb-10' : 'py-8 sm:py-10'
        }`}
      >
        {page.showContactForm ? (
          <div
            className="grid grid-cols-1 md:grid-cols-[minmax(0,32rem)_minmax(0,1fr)] gap-6 items-start"
            data-testid="contact-split"
          >
            <ContactForm />
            <div className="space-y-6 min-w-0">
              {sectionCards}
              {page.showMailingList ? <MailingListSignup compact /> : null}
            </div>
          </div>
        ) : (
          sectionCards
        )}

        {groups.length ? (
          <div className="space-y-6" data-testid="faq-list">
            {groups.map((group) => (
              <div key={group.heading || 'faq'} className="space-y-3">
                {group.heading ? (
                  <h2 className="text-lg font-serif font-black uppercase tracking-tight text-[#1F1917] px-1">
                    {group.heading}
                  </h2>
                ) : null}
                {group.items.map((item) => {
                  faqIndex += 1;
                  const index = faqIndex;
                  const open = openFaq === index;
                  return (
                    <div key={item.question} className="bg-white border-2 border-[#1F1917] rounded-3xl overflow-hidden">
                      <button
                        type="button"
                        className="w-full min-h-[44px] px-5 py-3 flex items-center justify-between gap-3 text-left cursor-pointer"
                        aria-expanded={open}
                        onClick={() => setOpenFaq(open ? -1 : index)}
                      >
                        <span className="text-sm font-black uppercase tracking-tight text-[#1F1917]">{item.question}</span>
                        <ChevronDown className={`w-4 h-4 shrink-0 text-[#C2410C] transition-transform ${open ? 'rotate-180' : ''}`} />
                      </button>
                      {open ? <p className="px-5 pb-4 text-sm text-[#3F3832] font-medium leading-relaxed">{item.answer}</p> : null}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        ) : null}

        {page.showMailingList && !page.showContactForm ? <MailingListSignup compact /> : null}
      </section>
    </div>
  );
};
