import { NextResponse } from 'next/server';
import { ImageResponse } from 'next/og';

type Params = {
  params: {
    width: string;
    height: string;
  };
};

const MAX_DIMENSION = 1600;
const MIN_DIMENSION = 50;

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

function parseDimension(value: string): number | null {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) {
    return null;
  }

  if (parsed < MIN_DIMENSION) {
    return MIN_DIMENSION;
  }

  if (parsed > MAX_DIMENSION) {
    return MAX_DIMENSION;
  }

  return parsed;
}

export async function GET(_request: Request, { params }: Params) {
  const width = parseDimension(params.width);
  const height = parseDimension(params.height);

  if (!width || !height) {
    return NextResponse.json({ error: 'Invalid placeholder dimensions' }, { status: 400 });
  }

  const fontSize = Math.max(Math.min(Math.min(width, height) / 6, 42), 18);

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          width: '100%',
          height: '100%',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f5f3eb',
          color: '#4a4a4a',
          fontSize,
          fontWeight: 600,
          fontFamily: 'sans-serif',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          border: '3px dashed rgba(0, 0, 0, 0.15)',
        }}
      >
        MQ Studio Placeholder
      </div>
    ),
    { width, height }
  );
}
