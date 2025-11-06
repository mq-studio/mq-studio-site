'use client';

import Link from 'next/link';

interface PressItem {
  title: string;
  publication: string;
  date: string;
  url: string;
  type: 'interview' | 'review' | 'article' | 'announcement';
  excerpt?: string;
}

const pressItems: PressItem[] = [
  // Book Reviews
  {
    title: 'Designed Leadership',
    publication: 'Porchlight Book Company - Editor\'s Choice',
    date: 'July 14, 2017',
    url: 'https://www.porchlightbooks.com/blogs/book-reviews/designed-leadership',
    type: 'review',
    excerpt: 'A comprehensive guide to integrating design thinking into modern leadership practices. Quayle\'s background in landscape architecture, urban policy, and academic leadership distinguishes this work, offering greater breadth of knowledge and understanding.'
  },
  {
    title: 'Principled Governance: When Everything Matters',
    publication: 'The British Columbia Review',
    date: 'January 22, 2023',
    url: 'https://thebcreview.ca/2023/01/22/1706-dombrowski-fushtey/',
    type: 'review',
    excerpt: 'Described as "punchy and profound," this review by Theo Dombrowski praises the book\'s accessible approach to complex governance issues, noting it "sails breezily past the irritating mire of boardroom jargon."'
  },

  // Media Articles & Interviews
  {
    title: 'The Centre for Dialogue welcomes new director Dr. Moura Quayle',
    publication: 'Simon Fraser University',
    date: 'June 3, 2010',
    url: 'https://www.sfu.ca/dialogue/about/moura-quayle.html',
    type: 'announcement'
  },
  {
    title: 'Quayle tapped to lead SFU Centre for Dialogue',
    publication: 'UBC Faculty of Applied Science',
    date: 'June 2010',
    url: 'https://apsc.ubc.ca/news/2010/06/quayle-tapped-lead-sfu-centre-dialogue',
    type: 'announcement'
  },
  {
    title: 'DesignTO festival features UBC expert on designed leadership',
    publication: 'UBC Faculty of Applied Science',
    date: 'January 19, 2018',
    url: 'https://apsc.ubc.ca/news/2018/01/designto-festival-features-ubc-expert-designed-leadership',
    type: 'article'
  },
  {
    title: 'Moura Quayle Appointed Associate Provost for Enrolment and Academic Facilities',
    publication: 'UBC News',
    date: 'March 2, 2018',
    url: 'https://news.ubc.ca/2018/03/02/moura-quayle-appointed-associate-provost-for-enrolment-and-academic-facilities/',
    type: 'announcement'
  },
  {
    title: 'Moura Quayle: Designing our life\'s work',
    publication: 'UBC Today',
    date: 'November 1, 2021',
    url: 'https://ubctoday.ubc.ca/one-on-one/november-1-2021/moura-quayle',
    type: 'interview',
    excerpt: 'An in-depth conversation about design thinking, leadership, and the intersections of academia and creative practice.'
  },
  {
    title: 'BC YWCA honours 5 women of distinction',
    publication: 'Richmond News',
    date: 'May 9, 2009',
    url: 'https://www.richmond-news.com/bc-ywca-honours-5-women-of-distinction-3084651',
    type: 'article'
  },
  {
    title: 'Five women honoured as part of YWCA Women of Distinction Awards',
    publication: 'Vancouver Sun',
    date: 'May 8, 2009',
    url: 'https://vancouversun.com/news/staff-blogs/five-women-honoured-as-part-of-ywca-women-of-distinction-awards',
    type: 'article'
  },
  {
    title: 'Design and creative leadership',
    publication: 'UBC SALA',
    date: '2017',
    url: 'https://sala.ubc.ca/news-events/news/design-and-creative-leadership',
    type: 'article'
  },
  {
    title: 'A Passion for Policy: An Interview with Moura Quayle',
    publication: 'Landscape Architecture Magazine',
    date: 'August 2013',
    url: 'https://landscapearchitecturemagazine.org/2013/08/01/a-passion-for-policy/',
    type: 'interview',
    excerpt: 'Exploring the connections between landscape architecture, policy, and governance.'
  },
  {
    title: 'The Other 23 Hours: Educational Planning for the Whole Student Experience',
    publication: 'Planning for Higher Education',
    date: '2016',
    url: 'https://www.scup.org/resource/the-other-23-hours-educational-planning-for-the-whole-student-experience/',
    type: 'article'
  },
  {
    title: 'UBC appoints new Associate Provost for Enrolment and Academic Facilities',
    publication: 'UBC Provost & VP Academic',
    date: 'March 2, 2018',
    url: 'https://academic.ubc.ca/archived-announcements/ubc-appoints-new-associate-provost-enrolment-and-academic-facilities',
    type: 'announcement'
  },
  {
    title: 'Moura Quayle on Landscape Architecture Policy',
    publication: 'Design Talks Podcast',
    date: '2014',
    url: 'https://designtalkspodcast.com/moura-quayle',
    type: 'interview'
  }
];

export default function PressPage() {
  const reviews = pressItems.filter(item => item.type === 'review');
  const interviews = pressItems.filter(item => item.type === 'interview');
  const articles = pressItems.filter(item => item.type === 'article');
  const announcements = pressItems.filter(item => item.type === 'announcement');

  return (
    <>
      <header className="border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="mb-2 sm:mb-0">
              <Link href="/" className="flex items-center gap-3 font-montserrat font-semibold text-lg">
                <span className="w-6 h-6 bg-gradient-to-br from-[var(--moura-teal)] to-[var(--scholar-blue)] rounded-full"></span>
                MQ STUDIO
              </Link>
              <div className="font-lora text-sm text-[var(--charcoal-wash)] mt-1">
                Feeling · Thinking · Doing
              </div>
            </div>
            <nav className="font-montserrat text-sm">
              <a href="/gallery/artworks" className="hover:text-[var(--moura-teal)] transition-colors">Artworks</a>
              <span className="mx-2">·</span>
              <a href="/gallery/publications" className="hover:text-[var(--moura-teal)] transition-colors">Publications</a>
              <span className="mx-2">·</span>
              <a href="/musings" className="hover:text-[var(--moura-teal)] transition-colors">Musings</a>
              <span className="mx-2">·</span>
              <a href="/press" className="text-[var(--moura-teal)]">Press</a>
              <span className="mx-2">·</span>
              <a href="/projects" className="hover:text-[var(--moura-teal)] transition-colors">Projects</a>
              <span className="mx-2">·</span>
              <a href="/search" className="hover:text-[var(--moura-teal)] transition-colors">Search</a>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="mb-12">
          <h1 className="font-montserrat text-4xl font-bold mb-4 text-[var(--ink-black)]">
            Press & Recognition
          </h1>
          <p className="font-lora text-lg text-[var(--charcoal-wash)] leading-relaxed">
            Media coverage, interviews, and professional reviews of Moura Quayle's work in
            leadership, design, governance, and academia.
          </p>
        </div>

        {/* Book Reviews */}
        {reviews.length > 0 && (
          <section className="mb-16">
            <h2 className="font-montserrat text-2xl font-semibold mb-6 text-[var(--scholar-blue)] border-b border-[var(--border)] pb-2">
              Book Reviews
            </h2>
            <div className="space-y-6">
              {reviews.map((item, index) => (
                <article key={index} className="bg-gradient-to-br from-[var(--rice-paper)] to-white p-6 rounded-lg border border-[var(--border)] hover:shadow-md transition-shadow">
                  <h3 className="font-montserrat text-xl font-semibold mb-2 text-[var(--ink-black)]">
                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--moura-teal)] transition-colors">
                      {item.title}
                    </a>
                  </h3>
                  <div className="font-montserrat text-sm text-[var(--muted-foreground)] mb-3">
                    {item.publication} · {item.date}
                  </div>
                  {item.excerpt && (
                    <p className="font-lora text-[var(--charcoal-wash)] leading-relaxed mb-3">
                      {item.excerpt}
                    </p>
                  )}
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-montserrat text-sm text-[var(--moura-teal)] hover:text-[var(--scholar-blue)] transition-colors"
                  >
                    Read full review →
                  </a>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* Interviews */}
        {interviews.length > 0 && (
          <section className="mb-16">
            <h2 className="font-montserrat text-2xl font-semibold mb-6 text-[var(--vibrant-magenta)] border-b border-[var(--border)] pb-2">
              Interviews & Features
            </h2>
            <div className="space-y-4">
              {interviews.map((item, index) => (
                <article key={index} className="bg-white p-5 rounded-lg border border-[var(--border)] hover:border-[var(--vibrant-magenta)] transition-colors">
                  <h3 className="font-montserrat text-lg font-semibold mb-2 text-[var(--ink-black)]">
                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--vibrant-magenta)] transition-colors">
                      {item.title}
                    </a>
                  </h3>
                  <div className="font-montserrat text-sm text-[var(--muted-foreground)] mb-2">
                    {item.publication} · {item.date}
                  </div>
                  {item.excerpt && (
                    <p className="font-lora text-sm text-[var(--charcoal-wash)] leading-relaxed">
                      {item.excerpt}
                    </p>
                  )}
                </article>
              ))}
            </div>
          </section>
        )}

        {/* Articles */}
        {articles.length > 0 && (
          <section className="mb-16">
            <h2 className="font-montserrat text-2xl font-semibold mb-6 text-[var(--moura-teal)] border-b border-[var(--border)] pb-2">
              Media Coverage
            </h2>
            <div className="space-y-4">
              {articles.map((item, index) => (
                <article key={index} className="bg-white p-5 rounded-lg border border-[var(--border)] hover:border-[var(--moura-teal)] transition-colors">
                  <h3 className="font-montserrat text-lg font-semibold mb-2 text-[var(--ink-black)]">
                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--moura-teal)] transition-colors">
                      {item.title}
                    </a>
                  </h3>
                  <div className="font-montserrat text-sm text-[var(--muted-foreground)]">
                    {item.publication} · {item.date}
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* Announcements */}
        {announcements.length > 0 && (
          <section className="mb-16">
            <h2 className="font-montserrat text-2xl font-semibold mb-6 text-[var(--ink-black)] border-b border-[var(--border)] pb-2">
              Announcements & Appointments
            </h2>
            <div className="space-y-4">
              {announcements.map((item, index) => (
                <article key={index} className="bg-white p-5 rounded-lg border border-[var(--border)] hover:border-[var(--scholar-blue)] transition-colors">
                  <h3 className="font-montserrat text-lg font-semibold mb-2 text-[var(--ink-black)]">
                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--scholar-blue)] transition-colors">
                      {item.title}
                    </a>
                  </h3>
                  <div className="font-montserrat text-sm text-[var(--muted-foreground)]">
                    {item.publication} · {item.date}
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </main>
    </>
  );
}
