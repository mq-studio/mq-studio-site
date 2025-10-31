/**
 * Hero component for MQ Studio homepage
 * Implements the triadic framework (THINKING/FEELING/DOING) with accessibility
 * Based on specs/001-homepage-hero/spec.md acceptance criteria
 */

import React from 'react';
import { TOKENS } from '../design/tokens';

export interface HeroProps {
  className?: string;
}

export const Hero: React.FC<HeroProps> = ({ className = '' }) => {
  return (
    <section
      data-testid="hero"
      role="region"
      aria-label="Today at MQ Studio"
      data-layout="triad"
      data-bg-token="ricePaper"
      className={className}
      style={{
        backgroundColor: TOKENS.colors.ricePaper,
        padding: TOKENS.spacing.xl,
        fontFamily: TOKENS.fonts.body,
      }}
    >
      {/* Three simultaneous content zones */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: TOKENS.spacing.lg }}>

        {/* Current Artwork - FEELING pathway */}
        <div data-testid="hero-artwork" style={{ padding: TOKENS.spacing.md }}>
          <a
            href="/artworks"
            style={{
              textDecoration: 'none',
              color: TOKENS.colors.inkBlack,
              display: 'block',
            }}
            aria-label="View current artwork in gallery"
          >
            <h3 style={{
              fontFamily: TOKENS.fonts.heading,
              color: TOKENS.colors.livingPink,
              marginBottom: TOKENS.spacing.sm,
            }}>
              Current Artwork
            </h3>
            <div
              role="img"
              aria-label="Watercolour expressing emergence and connection through flowing blues and teals"
              style={{
                width: '100%',
                height: '200px',
                backgroundColor: TOKENS.colors.studioCream,
                border: `1px solid ${TOKENS.colors.lightGray}`,
                borderRadius: TOKENS.borderRadius.base,
                marginBottom: TOKENS.spacing.sm,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: TOKENS.colors.charcoalWash,
              }}
            >
              [Watercolour: Tidal Connections]
            </div>
            <p style={{ fontSize: '0.9rem', color: TOKENS.colors.charcoalWash }}>
              Latest piece exploring the fluid boundaries between thought and feeling...
            </p>
          </a>
        </div>

        {/* Recent Writing - THINKING pathway */}
        <div data-testid="hero-writing" style={{ padding: TOKENS.spacing.md }}>
          <a
            href="/publications"
            style={{
              textDecoration: 'none',
              color: TOKENS.colors.inkBlack,
              display: 'block',
            }}
            aria-label="Read recent writing in publications"
          >
            <h3 style={{
              fontFamily: TOKENS.fonts.heading,
              color: TOKENS.colors.scholarBlue,
              marginBottom: TOKENS.spacing.sm,
            }}>
              Recent Writing
            </h3>
            <blockquote style={{
              fontStyle: 'italic',
              borderLeft: `3px solid ${TOKENS.colors.scholarBlue}`,
              paddingLeft: TOKENS.spacing.md,
              marginBottom: TOKENS.spacing.sm,
              color: TOKENS.colors.charcoalWash,
            }}>
              &quot;The governance of public space requires both systematic thinking and intuitive understanding...&quot;
            </blockquote>
            <p style={{ fontSize: '0.9rem', color: TOKENS.colors.charcoalWash }}>
              From &quot;Boundaries and Belonging&quot; - <strong>Read more...</strong>
            </p>
          </a>
        </div>

        {/* Today's Reflection - DOING pathway */}
        <div data-testid="hero-reflection" style={{ padding: TOKENS.spacing.md }}>
          <a
            href="/musings"
            style={{
              textDecoration: 'none',
              color: TOKENS.colors.inkBlack,
              display: 'block',
            }}
            aria-label="Explore current reflections and musings"
          >
            <h3 style={{
              fontFamily: TOKENS.fonts.heading,
              color: TOKENS.colors.mouraTeal,
              marginBottom: TOKENS.spacing.sm,
            }}>
              Today&apos;s Reflection
            </h3>
            <p style={{
              fontSize: '1rem',
              lineHeight: '1.5',
              color: TOKENS.colors.inkBlack,
              marginBottom: TOKENS.spacing.sm,
            }}>
              I&apos;m noticing how yesterday&apos;s conversation with David about systematic approaches suddenly illuminates this morning&apos;s brush strokes...
            </p>
            <p style={{ fontSize: '0.8rem', color: TOKENS.colors.charcoalWash }}>
              Current work-in-progress • September 2024
            </p>
          </a>
        </div>
      </div>

      {/* Triadic CTAs */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: TOKENS.spacing.lg,
        marginTop: TOKENS.spacing.xl,
        flexWrap: 'wrap',
      }}>
        <button
          data-testid="hero-cta-thinking"
          style={{
            backgroundColor: TOKENS.colors.scholarBlue,
            color: 'white',
            border: 'none',
            padding: `${TOKENS.spacing.sm} ${TOKENS.spacing.lg}`,
            borderRadius: TOKENS.borderRadius.base,
            fontFamily: TOKENS.fonts.heading,
            fontSize: '1rem',
            cursor: 'pointer',
            minWidth: '44px',
            minHeight: '44px',
          }}
          onFocus={(e) => { e.target.style.outline = `2px solid ${TOKENS.focus.ring}`; }}
          onBlur={(e) => { e.target.style.outline = 'none'; }}
          aria-label="Explore thinking pathway - governance papers and intellectual work"
        >
          THINKING
        </button>

        <button
          data-testid="hero-cta-feeling"
          style={{
            backgroundColor: TOKENS.colors.livingPink,
            color: 'white',
            border: 'none',
            padding: `${TOKENS.spacing.sm} ${TOKENS.spacing.lg}`,
            borderRadius: TOKENS.borderRadius.base,
            fontFamily: TOKENS.fonts.heading,
            fontSize: '1rem',
            cursor: 'pointer',
            minWidth: '44px',
            minHeight: '44px',
          }}
          onFocus={(e) => { e.target.style.outline = `2px solid ${TOKENS.focus.ring}`; }}
          onBlur={(e) => { e.target.style.outline = 'none'; }}
          aria-label="Explore feeling pathway - watercolours and artistic expressions"
        >
          FEELING
        </button>

        <button
          data-testid="hero-cta-doing"
          style={{
            backgroundColor: TOKENS.colors.mouraTeal,
            color: 'white',
            border: 'none',
            padding: `${TOKENS.spacing.sm} ${TOKENS.spacing.lg}`,
            borderRadius: TOKENS.borderRadius.base,
            fontFamily: TOKENS.fonts.heading,
            fontSize: '1rem',
            cursor: 'pointer',
            minWidth: '44px',
            minHeight: '44px',
          }}
          onFocus={(e) => { e.target.style.outline = `2px solid ${TOKENS.focus.ring}`; }}
          onBlur={(e) => { e.target.style.outline = 'none'; }}
          aria-label="Explore doing pathway - calligraphy and creative practice"
        >
          DOING
        </button>
      </div>

      {/* Resonance slot */}
      <div
        data-testid="hero-resonance"
        style={{
          marginTop: TOKENS.spacing.xl,
          padding: TOKENS.spacing.lg,
          backgroundColor: TOKENS.colors.studioCream,
          borderRadius: TOKENS.borderRadius.base,
          borderLeft: `4px solid ${TOKENS.colors.mouraTeal}`,
        }}
      >
        <h4 style={{
          fontFamily: TOKENS.fonts.heading,
          color: TOKENS.colors.mouraTeal,
          marginBottom: TOKENS.spacing.sm,
        }}>
          Currently exploring how...
        </h4>
        <p style={{
          fontStyle: 'italic',
          color: TOKENS.colors.charcoalWash,
          lineHeight: '1.6',
        }}>
          This 1992 paper on public space governance suddenly speaks to yesterday&apos;s painting about boundaries - both questioning where one thing ends and another begins.
        </p>
      </div>

      {/* Marginalia slot */}
      <div
        data-testid="hero-marginalia"
        style={{
          marginTop: TOKENS.spacing.lg,
          padding: TOKENS.spacing.md,
          borderLeft: `2px solid ${TOKENS.colors.scholarBlue}`,
          backgroundColor: 'rgba(44, 89, 133, 0.05)',
        }}
      >
        <blockquote style={{
          fontFamily: TOKENS.fonts.body,
          fontStyle: 'italic',
          color: TOKENS.colors.scholarBlue,
          margin: 0,
          fontSize: '0.9rem',
        }}>
          &quot;The most systematic approach sometimes reveals the most fluid truths.&quot;
        </blockquote>
        <cite style={{
          display: 'block',
          textAlign: 'right',
          marginTop: TOKENS.spacing.xs,
          fontSize: '0.8rem',
          color: TOKENS.colors.charcoalWash,
        }}>
          — David Fushtey
        </cite>
      </div>
    </section>
  );
};
