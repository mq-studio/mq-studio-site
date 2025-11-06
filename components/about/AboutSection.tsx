import Image from 'next/image';

export default function AboutSection() {
  return (
    <section className="py-16 bg-gradient-to-br from-[var(--studio-cream)] to-white">
      <div className="max-w-5xl mx-auto px-6">
        <h2 className="font-montserrat text-3xl font-bold text-center mb-12 text-[var(--ink-black)]">
          About Moura Quayle
        </h2>
        <div className="grid md:grid-cols-[300px_1fr] gap-8 items-start">
          {/* Photo */}
          <div className="mx-auto md:mx-0">
            <Image
              src="/images/moura/YWCA.jpg"
              alt="Moura Quayle"
              width={300}
              height={388}
              className="rounded-lg shadow-lg"
              priority
            />
          </div>

          {/* Bio Text */}
          <div className="space-y-6 font-lora text-[var(--charcoal-wash)] leading-relaxed">
            <p>
              Moura Quayle is a landscape architect, academic, and artist whose work spans
              governance, design, and creative expression. Her career has been defined by a
              commitment to interdisciplinary thinking and collaborative practice.
            </p>
            <p>
              As a Professor Emerita at the University of British Columbia School of Architecture
              and Landscape Architecture, Moura has contributed extensively to scholarship in
              landscape governance, community design, and urban planning. Her research explores
              the intersections of policy, place, and people.
            </p>
            <p>
              Beyond academia, Moura is an accomplished watercolor artist and calligrapher.
              Her visual work reflects the same attention to detail and emotional depth that
              characterizes her scholarly pursuits—a testament to the philosophy that thinking,
              feeling, and doing are inseparable.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
