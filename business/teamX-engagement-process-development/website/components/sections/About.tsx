import {
  AcademicCapIcon,
  BuildingOfficeIcon,
  GlobeAmericasIcon,
  TrophyIcon,
} from '@heroicons/react/24/outline'

const stats = [
  { id: 1, name: 'Healthcare Organizations Transformed', value: '100+' },
  { id: 2, name: 'Average ROI Improvement', value: '250%' },
  { id: 3, name: 'Years of Industry Excellence', value: '15+' },
  { id: 4, name: 'Client Satisfaction Rate', value: '98%' },
]

const values = [
  {
    name: 'Excellence',
    description: 'We deliver exceptional results through rigorous methodologies and proven frameworks.',
    icon: TrophyIcon,
  },
  {
    name: 'Expertise',
    description: 'Deep healthcare industry knowledge combined with cutting-edge consulting practices.',
    icon: AcademicCapIcon,
  },
  {
    name: 'Partnership',
    description: 'We work alongside your team as trusted partners committed to your success.',
    icon: BuildingOfficeIcon,
  },
  {
    name: 'Impact',
    description: 'Creating sustainable value and measurable outcomes that transform organizations.',
    icon: GlobeAmericasIcon,
  },
]

export default function About() {
  return (
    <section id="about" className="bg-teamx-background py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-teamx-navy">About TeamX</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-teamx-charcoal sm:text-4xl">
            Healthcare Consulting Leaders
          </p>
          <p className="mt-6 text-lg leading-8 text-teamx-warm-gray">
            With over 15 years of experience in healthcare consulting, TeamX has established itself 
            as the premier partner for healthcare organizations seeking transformative growth and 
            operational excellence.
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
            {values.map((value) => (
              <div key={value.name} className="relative pl-16">
                <dt className="text-base font-semibold leading-7 text-teamx-charcoal">
                  <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-primary">
                    <value.icon className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  {value.name}
                </dt>
                <dd className="mt-2 text-base leading-7 text-teamx-warm-gray">
                  {value.description}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="mx-auto mt-16 max-w-7xl sm:mt-20 lg:mt-24">
          <div className="rounded-2xl bg-white p-8 ring-1 ring-teamx-light-slate/20 shadow-soft">
            <div className="mx-auto max-w-2xl text-center mb-12">
              <h3 className="text-2xl font-bold tracking-tight text-teamx-charcoal">
                Proven Track Record
              </h3>
              <p className="mt-4 text-lg leading-8 text-teamx-warm-gray">
                Our results speak for themselves. Here&apos;s what we&apos;ve achieved with our clients.
              </p>
            </div>
            
            <dl className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 text-center sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.id} className="flex flex-col gap-y-4">
                  <dt className="text-base leading-7 text-teamx-warm-gray">{stat.name}</dt>
                  <dd className="text-3xl font-bold leading-9 tracking-tight text-teamx-navy sm:text-4xl">
                    {stat.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <div className="mx-auto mt-16 max-w-4xl sm:mt-20 lg:mt-24">
          <div className="bg-white rounded-2xl p-8 ring-1 ring-teamx-light-slate/20 shadow-soft">
            <h3 className="text-2xl font-bold tracking-tight text-teamx-charcoal mb-6">
              Our Methodology
            </h3>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
              <div className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-teamx-navy text-white font-bold text-lg mb-4">
                  1
                </div>
                <h4 className="text-lg font-semibold text-teamx-charcoal mb-2">Assess</h4>
                <p className="text-sm text-teamx-warm-gray">
                  Comprehensive analysis of current state, challenges, and opportunities
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-teamx-navy text-white font-bold text-lg mb-4">
                  2
                </div>
                <h4 className="text-lg font-semibold text-teamx-charcoal mb-2">Design</h4>
                <p className="text-sm text-teamx-warm-gray">
                  Develop tailored solutions and strategic roadmaps for transformation
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-teamx-navy text-white font-bold text-lg mb-4">
                  3
                </div>
                <h4 className="text-lg font-semibold text-teamx-charcoal mb-2">Implement</h4>
                <p className="text-sm text-teamx-warm-gray">
                  Execute solutions with continuous monitoring and optimization
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}