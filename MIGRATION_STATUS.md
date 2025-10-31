# Content Migration Status - MQ Studio

**Last Updated:** 2025-10-27

## Migration Summary

### ✅ Completed Migrations

#### Shufa Calligraphy (7 pieces - ALL MIGRATED)
All Shufa pieces have been successfully migrated to `content/artworks/`:

1. **shufa-calligraphy-1.md** - Long Life (IMG_4147.jpeg)
2. **shufa-calligraphy-2.md** - Happiness Scroll (IMG_4148.jpeg)
3. **shufa-longevity.md** - Longevity Character (IMG_4197.jpeg)
4. **shufa-seal-script.md** - Seal Script (IMG_4199.jpeg)
5. **shufa-flow-like-water.md** - Flow Like Water (IMG_4200.jpeg)
6. **shufa-harmony-character.md** - Harmony Character (IMG_4201.jpeg)
7. **shufa-mountain-stillness.md** - Mountain Stillness (IMG_4202.jpeg)

**Tags used:** ["Shufa", "Chinese art", "ink"] (NOT "calligraphy")
**Location:** All images in `public/images/artworks/shufa-*.jpg`

#### Landscape Designs - JPEG Only (5 pieces migrated)
Successfully migrated JPEG format landscape designs to `content/artworks/`:

1. **landscape-design-107.md** (MQ-107.jpeg)
2. **landscape-design-238.md** (MQ-238.jpg)
3. **landscape-design-242.md** (MQ-242.jpg)
4. **landscape-design-270.md** (MQ-270.jpeg)
5. **landscape-design-293.md** (MQ-293.jpeg)

**Tags used:** ["landscape architecture", "design", "planning"]
**Location:** All images in `public/images/artworks/landscape-design-*.jpg`

### ⏳ Pending: TIF Landscape Files (36 files)

The following TIF files from the landscape archive require conversion to JPEG format before they can be migrated. These files are located at:
`/mnt/c/Users/RichardHart/Dropbox/RDH OneDrive transfers/moura_quayle_website/LANDSCAPE DESIGN ARCHIVE/`

**TIF Files Requiring Conversion:**
- MQ-06.tif
- MQ-07.tif
- MQ-08.tif
- MQ-09.tif
- MQ-43.tif
- MQ-45.tif
- MQ-48.tif
- MQ-59.tif
- MQ-66.tif
- MQ-67.tif
- MQ-094.tif
- MQ-096.tif
- MQ-097.tif
- MQ-099.tif
- MQ-100.tif
- MQ-101.tif
- MQ-102.tif
- MQ-104.tif
- MQ-109.tif
- MQ-111.tif
- MQ-112.tif
- MQ-127.tif
- MQ-133.tif
- MQ-144.tif
- MQ-145.tif
- MQ-146.tif
- MQ-147.tif
- MQ-175.tif
- MQ-176.tif
- MQ-273.tif
- MQ-278.tif
- MQ-288.tif
- MQ-292.tif (duplicate: MQ-292 2.tif exists)
- MQ-297.tif

**Note:** MQ-292 2.tif and MQ-293 2.jpeg are duplicates and should be skipped.

### Conversion Instructions

**Option 1: Manual Conversion (Windows/Mac)**
1. Open each TIF file in an image editor (Photoshop, GIMP, Paint.NET)
2. Export/Save As JPEG with quality 90%
3. Name as `landscape-design-{number}.jpg` (e.g., `landscape-design-06.jpg`)
4. Copy to `public/images/artworks/`
5. Create corresponding markdown file in `content/artworks/`

**Option 2: Batch Conversion (ImageMagick)**
```bash
# If ImageMagick is installed:
cd "/mnt/c/Users/RichardHart/Dropbox/RDH OneDrive transfers/moura_quayle_website/LANDSCAPE DESIGN ARCHIVE"
for f in MQ-*.tif; do
  num=$(echo "$f" | sed 's/MQ-//;s/.tif//')
  convert "$f" -quality 90 "landscape-design-${num}.jpg"
done
```

**Option 3: Python PIL (if Pillow installed)**
```python
from PIL import Image
from pathlib import Path

source = Path("/mnt/c/Users/RichardHart/Dropbox/RDH OneDrive transfers/moura_quayle_website/LANDSCAPE DESIGN ARCHIVE")
target = Path("public/images/artworks")

for tif_file in source.glob("MQ-*.tif"):
    num = tif_file.stem.replace("MQ-", "")
    img = Image.open(tif_file)
    rgb = img.convert('RGB')
    rgb.save(target / f"landscape-design-{num}.jpg", 'JPEG', quality=90)
```

### Markdown Template for Additional Landscapes

When creating entries for converted TIF files, use this template:

```markdown
---
title: "Landscape Design Study MQ-{NUMBER}"
slug: "landscape-design-{number}"
description: "Landscape architecture design drawing from archive - [concept/planning/spatial] study"
date: "date unknown"
tags: ["landscape architecture", "design", "planning"]
featured: false
medium: "archived design drawing"
imageUrl: "/images/artworks/landscape-design-{number}.jpg"
year: 2024
availability: "archive"
artistStatement: "This landscape design drawing represents one of many conceptual studies in the studio's archive. Each drawing captures a moment of spatial thinking - exploring relationships between built and natural environments, circulation patterns, and the integration of functional and aesthetic considerations. These archived studies document the iterative design process through which ideas are tested, refined, and evolved. [AI GENERATED - PLACEHOLDER]"
---

A landscape architecture design study from the studio archive, catalogued as MQ-{NUMBER}. This drawing represents conceptual work exploring site planning, spatial relationships, and landscape integration.

As part of a larger body of design work, this piece demonstrates the studio's approach to landscape architecture - considering ecological systems, human experience, cultural context, and aesthetic composition as interconnected elements of place-making.

The archive designation (MQ-{NUMBER}) indicates this is part of a systematic documentation of design work spanning multiple projects and time periods.

[AI GENERATED - PLACEHOLDER]
```

### Dual Entry Considerations

**Currently:** All landscape designs are catalogued as artworks only.

**For Future Consideration:** Some of these design studies may warrant dual entries as both:
- **Artwork** (design drawing as artistic expression)
- **Project** (realized or proposed landscape project)

**When to create dual entries:**
- If the design represents a specific completed project with client/location
- If additional project context (client, budget, impact) is known
- If the work has both artistic merit AND professional project documentation

**Project Template (if needed):**
```yaml
---
title: "[Project Name]"
date: "2024-01-01"
client: "To be determined"
location: "Vancouver, BC"
status: "completed"
featured: false
tags: ["landscape architecture", "design"]
images: ["/images/projects/landscape-design-{number}.jpg"]
---

[AI GENERATED - PLACEHOLDER]
Project description based on design study MQ-{NUMBER}.
```

## Archive Files

### Source Directories
- **Landscapes:** `/mnt/c/Users/RichardHart/Dropbox/RDH OneDrive transfers/moura_quayle_website/LANDSCAPE DESIGN ARCHIVE/`
- **Shufa:** `/mnt/c/Users/RichardHart/Dropbox/RDH OneDrive transfers/moura_quayle_website/SHUFA ARCHIVE/`

### Already Migrated (Do NOT Duplicate)
- **Landscape artworks:** university-excellence-sketch, northgate-concept, orchard-landscape-sketch, university-landscape-sketch
- **Landscape projects:** university-landscape-concept
- **Shufa:** All 7 pieces (see list above)
