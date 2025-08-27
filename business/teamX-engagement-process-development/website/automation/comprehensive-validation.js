const { chromium, firefox, webkit } = require('playwright');
const fs = require('fs');
const path = require('path');

// Test configuration
const BASE_URL = 'http://localhost:3000';
const SCREENSHOT_DIR = './screenshots/validation-results';
const VIEWPORT_SIZES = {
    mobile: { width: 375, height: 667 },
    tablet: { width: 768, height: 1024 },
    desktop: { width: 1920, height: 1080 }
};

// Ensure screenshot directory exists
if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

// All pages to test
const PAGES = [
    '/',
    '/about',
    '/services',
    '/process',
    '/case-studies',
    '/team',
    '/frameworks',
    '/resources',
    '/investors',
    '/contact'
];

class TeamXValidator {
    constructor() {
        this.results = {
            navigation: [],
            interactive: [],
            responsive: [],
            performance: [],
            accessibility: [],
            seo: [],
            security: [],
            issues: [],
            screenshots: []
        };
    }

    async runAllTests() {
        console.log('🚀 Starting comprehensive TeamX website validation...');
        
        // Test with different browsers
        const browsers = [
            { name: 'chromium', instance: chromium },
            { name: 'firefox', instance: firefox },
            { name: 'webkit', instance: webkit }
        ];

        for (const browser of browsers) {
            console.log(`\n📱 Testing with ${browser.name}...`);
            await this.runBrowserTests(browser);
        }

        // Generate and save results
        await this.generateReport();
        
        console.log('\n✅ Comprehensive validation completed!');
        return this.results;
    }

    async runBrowserTests(browser) {
        const browserInstance = await browser.instance.launch({ headless: true });
        
        try {
            // Test different viewport sizes
            for (const [viewportName, viewport] of Object.entries(VIEWPORT_SIZES)) {
                console.log(`  📊 Testing ${viewportName} viewport (${viewport.width}x${viewport.height})...`);
                
                const context = await browserInstance.newContext({ viewport });
                const page = await context.newPage();

                // Test all pages
                for (const pagePath of PAGES) {
                    await this.testPage(page, pagePath, browser.name, viewportName);
                }

                await context.close();
            }
        } finally {
            await browserInstance.close();
        }
    }

    async testPage(page, pagePath, browserName, viewport) {
        const startTime = Date.now();
        
        try {
            // Navigate to page
            const response = await page.goto(`${BASE_URL}${pagePath}`, { 
                waitUntil: 'networkidle',
                timeout: 30000 
            });

            // Record navigation result
            const loadTime = Date.now() - startTime;
            const navigationResult = {
                page: pagePath,
                browser: browserName,
                viewport,
                status: response.status(),
                loadTime,
                success: response.ok()
            };
            this.results.navigation.push(navigationResult);

            if (!response.ok()) {
                this.results.issues.push({
                    type: 'Navigation Error',
                    page: pagePath,
                    browser: browserName,
                    viewport,
                    issue: `HTTP ${response.status()}`
                });
                return;
            }

            // Wait for page to fully load
            await page.waitForLoadState('domcontentloaded');

            // Take screenshot
            const screenshotName = `${pagePath.replace('/', 'home').replace('/', '-')}-${browserName}-${viewport}.png`;
            const screenshotPath = path.join(SCREENSHOT_DIR, screenshotName);
            await page.screenshot({ path: screenshotPath, fullPage: true });
            this.results.screenshots.push({
                page: pagePath,
                browser: browserName,
                viewport,
                path: screenshotPath
            });

            // Test interactive elements based on page
            await this.testInteractiveElements(page, pagePath, browserName, viewport);
            
            // Test responsive design
            await this.testResponsiveDesign(page, pagePath, browserName, viewport);
            
            // Test performance
            await this.testPerformance(page, pagePath, browserName, viewport);
            
            // Test accessibility
            await this.testAccessibility(page, pagePath, browserName, viewport);
            
            // Test SEO elements
            await this.testSEO(page, pagePath, browserName, viewport);

        } catch (error) {
            this.results.issues.push({
                type: 'Test Error',
                page: pagePath,
                browser: browserName,
                viewport,
                issue: error.message
            });
        }
    }

    async testInteractiveElements(page, pagePath, browserName, viewport) {
        const interactiveTests = [];

        try {
            // Test navigation menu
            const navMenu = await page.$('nav');
            if (navMenu) {
                const navLinks = await page.$$('nav a');
                interactiveTests.push({
                    element: 'Navigation Menu',
                    count: navLinks.length,
                    working: navLinks.length > 0
                });
            }

            // Test buttons
            const buttons = await page.$$('button, .btn, [role="button"]');
            for (const button of buttons.slice(0, 3)) { // Test first 3 buttons
                const isVisible = await button.isVisible();
                const isEnabled = await button.isEnabled();
                interactiveTests.push({
                    element: 'Button',
                    visible: isVisible,
                    enabled: isEnabled,
                    working: isVisible && isEnabled
                });
            }

            // Test forms (contact page)
            if (pagePath === '/contact') {
                const forms = await page.$$('form');
                for (const form of forms) {
                    const inputs = await form.$$('input, textarea');
                    interactiveTests.push({
                        element: 'Contact Form',
                        inputs: inputs.length,
                        working: inputs.length > 0
                    });
                }
            }

            // Test ROI calculator (if present)
            const roiCalculator = await page.$('[data-testid="roi-calculator"], .roi-calculator');
            if (roiCalculator) {
                const calculatorInputs = await page.$$('input[type="number"], input[type="range"]');
                interactiveTests.push({
                    element: 'ROI Calculator',
                    inputs: calculatorInputs.length,
                    working: calculatorInputs.length > 0
                });
            }

            // Test framework viewer modal
            const frameworkLinks = await page.$$('[data-framework], .framework-link');
            if (frameworkLinks.length > 0) {
                interactiveTests.push({
                    element: 'Framework Viewer',
                    count: frameworkLinks.length,
                    working: frameworkLinks.length > 0
                });
            }

        } catch (error) {
            this.results.issues.push({
                type: 'Interactive Element Test Error',
                page: pagePath,
                browser: browserName,
                viewport,
                issue: error.message
            });
        }

        this.results.interactive.push({
            page: pagePath,
            browser: browserName,
            viewport,
            tests: interactiveTests
        });
    }

    async testResponsiveDesign(page, pagePath, browserName, viewport) {
        const responsiveTests = [];

        try {
            // Check if content is properly sized
            const bodyRect = await page.evaluate(() => {
                const body = document.body;
                return {
                    width: body.scrollWidth,
                    height: body.scrollHeight,
                    hasHorizontalScroll: body.scrollWidth > window.innerWidth
                };
            });

            responsiveTests.push({
                test: 'No Horizontal Scroll',
                passed: !bodyRect.hasHorizontalScroll,
                details: `Body width: ${bodyRect.width}, Viewport: ${VIEWPORT_SIZES[viewport].width}`
            });

            // Check mobile menu (for mobile viewport)
            if (viewport === 'mobile') {
                const mobileMenu = await page.$('[data-mobile-menu], .mobile-menu, .hamburger');
                responsiveTests.push({
                    test: 'Mobile Menu Present',
                    passed: !!mobileMenu,
                    details: mobileMenu ? 'Mobile menu found' : 'No mobile menu detected'
                });
            }

            // Check text readability
            const minFontSize = await page.evaluate(() => {
                const elements = document.querySelectorAll('p, span, div, a');
                let minSize = Infinity;
                elements.forEach(el => {
                    const fontSize = parseFloat(window.getComputedStyle(el).fontSize);
                    if (fontSize && fontSize < minSize) minSize = fontSize;
                });
                return minSize === Infinity ? 16 : minSize;
            });

            responsiveTests.push({
                test: 'Readable Text Size',
                passed: minFontSize >= (viewport === 'mobile' ? 14 : 12),
                details: `Minimum font size: ${minFontSize}px`
            });

        } catch (error) {
            this.results.issues.push({
                type: 'Responsive Design Test Error',
                page: pagePath,
                browser: browserName,
                viewport,
                issue: error.message
            });
        }

        this.results.responsive.push({
            page: pagePath,
            browser: browserName,
            viewport,
            tests: responsiveTests
        });
    }

    async testPerformance(page, pagePath, browserName, viewport) {
        const performanceTests = [];

        try {
            // Measure Core Web Vitals
            const webVitals = await page.evaluate(() => {
                return new Promise((resolve) => {
                    const observer = new PerformanceObserver((list) => {
                        const entries = list.getEntries();
                        const vitals = {};
                        
                        entries.forEach(entry => {
                            if (entry.entryType === 'largest-contentful-paint') {
                                vitals.LCP = entry.startTime;
                            }
                            if (entry.entryType === 'first-input') {
                                vitals.FID = entry.processingStart - entry.startTime;
                            }
                            if (entry.entryType === 'layout-shift' && !entry.hadRecentInput) {
                                vitals.CLS = (vitals.CLS || 0) + entry.value;
                            }
                        });
                        
                        resolve(vitals);
                    });
                    
                    observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });
                    
                    // Fallback timeout
                    setTimeout(() => resolve({}), 5000);
                });
            });

            // Check image optimization
            const imageStats = await page.evaluate(() => {
                const images = document.querySelectorAll('img');
                const stats = {
                    total: images.length,
                    withAlt: 0,
                    optimized: 0,
                    lazy: 0
                };

                images.forEach(img => {
                    if (img.alt) stats.withAlt++;
                    if (img.loading === 'lazy') stats.lazy++;
                    if (img.src.includes('.webp') || img.src.includes('.avif')) stats.optimized++;
                });

                return stats;
            });

            performanceTests.push({
                test: 'Core Web Vitals',
                LCP: webVitals.LCP || 'N/A',
                FID: webVitals.FID || 'N/A',
                CLS: webVitals.CLS || 'N/A'
            });

            performanceTests.push({
                test: 'Image Optimization',
                total: imageStats.total,
                withAlt: imageStats.withAlt,
                lazy: imageStats.lazy,
                optimized: imageStats.optimized
            });

        } catch (error) {
            this.results.issues.push({
                type: 'Performance Test Error',
                page: pagePath,
                browser: browserName,
                viewport,
                issue: error.message
            });
        }

        this.results.performance.push({
            page: pagePath,
            browser: browserName,
            viewport,
            tests: performanceTests
        });
    }

    async testAccessibility(page, pagePath, browserName, viewport) {
        const accessibilityTests = [];

        try {
            // Check for proper heading hierarchy
            const headings = await page.evaluate(() => {
                const headingTags = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
                const headings = [];
                headingTags.forEach(tag => {
                    const elements = document.querySelectorAll(tag);
                    elements.forEach(el => headings.push({ tag, text: el.textContent.trim().slice(0, 50) }));
                });
                return headings;
            });

            accessibilityTests.push({
                test: 'Heading Hierarchy',
                headings: headings.length,
                hasH1: headings.some(h => h.tag === 'h1'),
                structure: headings.map(h => h.tag).join(', ')
            });

            // Check for ARIA labels
            const ariaElements = await page.evaluate(() => {
                return {
                    ariaLabel: document.querySelectorAll('[aria-label]').length,
                    ariaDescribedBy: document.querySelectorAll('[aria-describedby]').length,
                    ariaHidden: document.querySelectorAll('[aria-hidden]').length,
                    role: document.querySelectorAll('[role]').length
                };
            });

            accessibilityTests.push({
                test: 'ARIA Implementation',
                ...ariaElements
            });

            // Check color contrast (basic check)
            const colorContrast = await page.evaluate(() => {
                const elements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, a, button, span');
                let lowContrastCount = 0;
                
                for (let i = 0; i < Math.min(elements.length, 20); i++) {
                    const el = elements[i];
                    const styles = window.getComputedStyle(el);
                    const color = styles.color;
                    const backgroundColor = styles.backgroundColor;
                    
                    // Simple contrast check (would need more sophisticated algorithm for real implementation)
                    if (color === 'rgb(0, 0, 0)' && backgroundColor === 'rgb(0, 0, 0)') {
                        lowContrastCount++;
                    }
                }
                
                return { checked: Math.min(elements.length, 20), lowContrast: lowContrastCount };
            });

            accessibilityTests.push({
                test: 'Color Contrast Check',
                ...colorContrast
            });

        } catch (error) {
            this.results.issues.push({
                type: 'Accessibility Test Error',
                page: pagePath,
                browser: browserName,
                viewport,
                issue: error.message
            });
        }

        this.results.accessibility.push({
            page: pagePath,
            browser: browserName,
            viewport,
            tests: accessibilityTests
        });
    }

    async testSEO(page, pagePath, browserName, viewport) {
        const seoTests = [];

        try {
            // Check meta tags
            const metaTags = await page.evaluate(() => {
                return {
                    title: document.title,
                    description: document.querySelector('meta[name="description"]')?.content || '',
                    keywords: document.querySelector('meta[name="keywords"]')?.content || '',
                    ogTitle: document.querySelector('meta[property="og:title"]')?.content || '',
                    ogDescription: document.querySelector('meta[property="og:description"]')?.content || '',
                    ogImage: document.querySelector('meta[property="og:image"]')?.content || '',
                    canonical: document.querySelector('link[rel="canonical"]')?.href || '',
                    viewport: document.querySelector('meta[name="viewport"]')?.content || ''
                };
            });

            seoTests.push({
                test: 'Meta Tags',
                ...metaTags,
                hasTitle: !!metaTags.title,
                hasDescription: !!metaTags.description,
                hasOgTags: !!(metaTags.ogTitle && metaTags.ogDescription)
            });

            // Check structured data
            const structuredData = await page.evaluate(() => {
                const scripts = document.querySelectorAll('script[type="application/ld+json"]');
                return {
                    count: scripts.length,
                    types: Array.from(scripts).map(script => {
                        try {
                            const data = JSON.parse(script.textContent);
                            return data['@type'] || 'Unknown';
                        } catch {
                            return 'Invalid JSON';
                        }
                    })
                };
            });

            seoTests.push({
                test: 'Structured Data',
                ...structuredData
            });

            // Check internal links
            const linkStats = await page.evaluate(() => {
                const links = document.querySelectorAll('a[href]');
                const stats = {
                    total: links.length,
                    internal: 0,
                    external: 0,
                    noText: 0
                };

                links.forEach(link => {
                    const href = link.href;
                    if (href.startsWith(window.location.origin) || href.startsWith('/')) {
                        stats.internal++;
                    } else {
                        stats.external++;
                    }
                    if (!link.textContent.trim()) {
                        stats.noText++;
                    }
                });

                return stats;
            });

            seoTests.push({
                test: 'Link Analysis',
                ...linkStats
            });

        } catch (error) {
            this.results.issues.push({
                type: 'SEO Test Error',
                page: pagePath,
                browser: browserName,
                viewport,
                issue: error.message
            });
        }

        this.results.seo.push({
            page: pagePath,
            browser: browserName,
            viewport,
            tests: seoTests
        });
    }

    async generateReport() {
        const reportData = {
            timestamp: new Date().toISOString(),
            summary: {
                totalPages: PAGES.length,
                totalBrowsers: 3,
                totalViewports: 3,
                totalTests: this.results.navigation.length,
                issuesFound: this.results.issues.length,
                screenshotsTaken: this.results.screenshots.length
            },
            results: this.results
        };

        // Save detailed results as JSON
        const resultsPath = path.join(SCREENSHOT_DIR, 'validation-results.json');
        fs.writeFileSync(resultsPath, JSON.stringify(reportData, null, 2));

        console.log(`\n📊 Results saved to: ${resultsPath}`);
        console.log(`📸 Screenshots saved to: ${SCREENSHOT_DIR}`);
        
        return reportData;
    }
}

// Run the validation if called directly
if (require.main === module) {
    const validator = new TeamXValidator();
    validator.runAllTests().catch(console.error);
}

module.exports = TeamXValidator;