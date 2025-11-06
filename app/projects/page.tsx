'use client';

import Link from 'next/link';

interface ProjectItem {
  title: string;
  organization: string;
  date?: string;
  url: string;
  description?: string;
}

const projectItems: ProjectItem[] = [
  {
    title: 'ASLA Firm Design Study',
    organization: 'American Society of Landscape Architects',
    date: '2012',
    url: 'https://www.asla.org/ContentDetail.aspx?id=33714',
    description: 'Research study on landscape architecture firm design practices and organizational structures.'
  },
  {
    title: 'The Politics of Park Design',
    organization: 'UBC Press',
    date: '2002',
    url: 'https://www.ubcpress.ca/the-politics-of-park-design',
    description: 'Exploring the intersection of policy, community engagement, and landscape design in public spaces.'
  },
  {
    title: 'Envisioning Communities',
    organization: 'Island Press',
    date: '2001',
    url: 'https://islandpress.org/books/envisioning-communities',
    description: 'Collaborative planning approaches for sustainable community development.'
  },
  {
    title: 'CELA Conference on Landscape Architecture Education',
    organization: 'Council of Educators in Landscape Architecture',
    url: 'https://www.thecela.org/',
    description: 'Leadership in landscape architecture education and professional development.'
  },
  {
    title: 'LAF Case Study Investigations',
    organization: 'Landscape Architecture Foundation',
    url: 'https://www.lafoundation.org/research/landscape-performance-series/',
    description: 'Case studies documenting landscape performance and impact metrics.'
  },
  {
    title: 'Vancouver Greenest City Action Plan',
    organization: 'City of Vancouver',
    date: '2011',
    url: 'https://vancouver.ca/green-vancouver/greenest-city-action-plan.aspx',
    description: 'Strategic planning for urban sustainability and environmental goals.'
  },
  {
    title: 'SFU Centre for Dialogue',
    organization: 'Simon Fraser University',
    date: '2010-2014',
    url: 'https://www.sfu.ca/dialogue.html',
    description: 'Leadership as Director, fostering dialogue on critical public policy issues.'
  },
  {
    title: 'UBC Campus Vision 2030',
    organization: 'University of British Columbia',
    date: '2018',
    url: 'https://planning.ubc.ca/vancouver/campus-plans-policies/campus-vision-2050',
    description: 'Strategic planning for campus development, enrolment, and academic facilities.'
  },
  {
    title: 'Metro Vancouver Regional Parks Strategy',
    organization: 'Metro Vancouver',
    url: 'https://metrovancouver.org/services/parks-regional-parks',
    description: 'Advisory work on regional parks planning and governance.'
  },
  {
    title: 'Pacific Spirit Regional Park Advisory Committee',
    organization: 'Metro Vancouver',
    url: 'https://metrovancouver.org/services/parks-regional-parks/parks-greenways/pacific-spirit-regional-park',
    description: 'Community engagement and stewardship for Pacific Spirit Regional Park.'
  },
  {
    title: 'BC Society of Landscape Architects',
    organization: 'BCSLA',
    url: 'https://www.bcsla.org/',
    description: 'Professional engagement and advocacy for landscape architecture in British Columbia.'
  },
  {
    title: 'Canadian Society of Landscape Architects',
    organization: 'CSLA',
    url: 'https://www.csla-aapc.ca/',
    description: 'National leadership in landscape architecture policy and professional standards.'
  },
  {
    title: 'International Federation of Landscape Architects',
    organization: 'IFLA',
    url: 'https://www.iflaonline.org/',
    description: 'Global collaboration on landscape architecture education and practice.'
  },
  {
    title: 'Women in Design Leadership Initiative',
    organization: 'Various Organizations',
    description: 'Mentorship and advocacy for women in design professions and leadership roles.'
  }
];

export default function ProjectsPage() {
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
              <a href="/press" className="hover:text-[var(--moura-teal)] transition-colors">Press</a>
              <span className="mx-2">·</span>
              <a href="/projects" className="text-[var(--moura-teal)]">Projects</a>
              <span className="mx-2">·</span>
              <a href="/search" className="hover:text-[var(--moura-teal)] transition-colors">Search</a>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="mb-12">
          <h1 className="font-montserrat text-4xl font-bold mb-4 text-[var(--ink-black)]">
            Projects & Collaborations
          </h1>
          <p className="font-lora text-lg text-[var(--charcoal-wash)] leading-relaxed">
            Selected collaborative projects, advisory roles, and professional leadership spanning
            landscape architecture, urban planning, governance, and design education.
          </p>
        </div>

        <div className="space-y-6">
          {projectItems.map((project, index) => (
            <article key={index} className="bg-white p-6 rounded-lg border border-[var(--border)] hover:shadow-md transition-shadow">
              <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2 mb-3">
                <h3 className="font-montserrat text-xl font-semibold text-[var(--ink-black)]">
                  <a href={project.url} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--moura-teal)] transition-colors">
                    {project.title}
                  </a>
                </h3>
                {project.date && (
                  <span className="font-montserrat text-sm text-[var(--muted-foreground)] whitespace-nowrap">
                    {project.date}
                  </span>
                )}
              </div>
              <div className="font-montserrat text-sm font-medium text-[var(--scholar-blue)] mb-3">
                {project.organization}
              </div>
              {project.description && (
                <p className="font-lora text-[var(--charcoal-wash)] leading-relaxed">
                  {project.description}
                </p>
              )}
            </article>
          ))}
        </div>

        {/* Call to Action */}
        <div className="mt-16 p-8 bg-gradient-to-br from-[var(--rice-paper)] to-[var(--studio-cream)] rounded-lg border border-[var(--border)]">
          <h2 className="font-montserrat text-2xl font-semibold mb-4 text-[var(--ink-black)]">
            Interested in Collaboration?
          </h2>
          <p className="font-lora text-[var(--charcoal-wash)] leading-relaxed mb-6">
            Moura welcomes opportunities for collaboration on projects at the intersection of
            design, governance, and strategic leadership.
          </p>
          <a
            href="mailto:moura@mouraquayle.ca"
            className="inline-block px-6 py-3 bg-[var(--moura-teal)] text-white font-montserrat font-medium rounded-lg hover:bg-[var(--scholar-blue)] transition-colors duration-300"
          >
            Get in Touch
          </a>
        </div>
      </main>
    </>
  );
}
