const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const util = require('util');

const execAsync = util.promisify(exec);

// Test configuration
const BASE_URL = 'http://localhost:3000';
const RESULTS_DIR = './screenshots/validation-results';

class VisualComponentTester {
    constructor() {
        this.results = {
            components: [],
            interactions: [],
            responsiveDesign: [],
            visualConsistency: [],
            issues: [],
            timestamp: new Date().toISOString()
        };

        // Ensure results directory exists
        if (!fs.existsSync(RESULTS_DIR)) {
            fs.mkdirSync(RESULTS_DIR, { recursive: true });
        }
    }

    async runVisualTests() {
        console.log('🎨 Starting visual component testing...');
        
        // Test main pages with component focus
        const testPages = [
            { path: '/', name: 'Home Page', components: ['Hero', 'Services', 'ProcessOverview', 'CaseStudiesPreview', 'Team', 'Testimonials', 'Contact'] },
            { path: '/frameworks', name: 'Frameworks Page', components: ['FrameworkGallery', 'FrameworkViewer'] },
            { path: '/contact', name: 'Contact Page', components: ['Contact Form', 'Contact Information'] }
        ];

        for (const page of testPages) {
            await this.testPageComponents(page);
        }

        // Test responsive design
        await this.testResponsiveDesign();
        
        // Analyze visual consistency
        await this.analyzeVisualConsistency();

        await this.generateVisualReport();
        console.log('\n✅ Visual component testing completed!');
        return this.results;
    }

    async testPageComponents(pageInfo) {
        console.log(`🧩 Testing components on ${pageInfo.name}...`);
        
        try {
            const response = await this.makeHttpRequest(pageInfo.path);
            if (response.statusCode !== 200) {
                this.results.issues.push({
                    type: 'Component Test Error',
                    page: pageInfo.path,
                    issue: `Page returned ${response.statusCode}`
                });
                return;
            }

            const content = response.body;
            
            // Test each expected component
            for (const component of pageInfo.components) {
                await this.testComponent(pageInfo.path, component, content);
            }

        } catch (error) {
            this.results.issues.push({
                type: 'Page Component Test Error',
                page: pageInfo.path,
                issue: error.message
            });
        }
    }

    async testComponent(pagePath, componentName, pageContent) {
        const componentTest = {
            page: pagePath,
            component: componentName,
            timestamp: new Date().toISOString()
        };

        switch (componentName) {
            case 'Hero':
                componentTest.results = this.testHeroComponent(pageContent);
                break;
            case 'Services':
                componentTest.results = this.testServicesComponent(pageContent);
                break;
            case 'ProcessOverview':
                componentTest.results = this.testProcessComponent(pageContent);
                break;
            case 'CaseStudiesPreview':
                componentTest.results = this.testCaseStudiesComponent(pageContent);
                break;
            case 'Team':
                componentTest.results = this.testTeamComponent(pageContent);
                break;
            case 'Testimonials':
                componentTest.results = this.testTestimonialsComponent(pageContent);
                break;
            case 'Contact':
                componentTest.results = this.testContactComponent(pageContent);
                break;
            case 'FrameworkGallery':
                componentTest.results = this.testFrameworkGalleryComponent(pageContent);
                break;
            case 'Contact Form':
                componentTest.results = this.testContactFormComponent(pageContent);
                break;
            default:
                componentTest.results = { tested: false, reason: 'No specific test defined' };
        }

        this.results.components.push(componentTest);
    }

    testHeroComponent(content) {
        const results = {
            hasH1: content.includes('<h1') || content.includes('<motion.h1'),
            hasH1Content: /Healthcare Consulting|Excellence/i.test(content),
            hasCTAButtons: content.includes('Start Your Transformation') && content.includes('Explore Services'),
            hasStats: content.includes('150+') && content.includes('250%') && content.includes('15+'),
            hasGradientBackground: content.includes('bg-gradient') || content.includes('gradient'),
            hasAnimation: content.includes('motion.') || content.includes('framer-motion'),
            hasHeroSection: content.includes('id="home"') || content.includes('Hero'),
            responsive: content.includes('sm:') && content.includes('lg:'),
            accessibility: {
                hasAriaHidden: content.includes('aria-hidden="true"'),
                hasProperHeading: true // H1 is present
            }
        };

        // Check for issues
        if (!results.hasH1) {
            this.results.issues.push({
                type: 'Component Error',
                component: 'Hero',
                issue: 'Missing H1 heading tag'
            });
        }

        if (!results.hasCTAButtons) {
            this.results.issues.push({
                type: 'Component Warning',
                component: 'Hero',
                issue: 'Missing call-to-action buttons'
            });
        }

        return results;
    }

    testServicesComponent(content) {
        return {
            hasServicesSection: content.includes('Services') || content.includes('service'),
            hasServiceCards: content.includes('card') || content.includes('grid'),
            hasHealthcareServices: /healthcare|medical|clinic/i.test(content),
            responsive: content.includes('grid-cols') && content.includes('sm:') && content.includes('lg:'),
            hasIcons: content.includes('icon') || content.includes('svg'),
            hasDescriptions: content.length > 1000 // Basic check for content
        };
    }

    testProcessComponent(content) {
        return {
            hasProcessSteps: content.includes('step') || content.includes('phase'),
            hasTimeline: content.includes('timeline') || content.includes('process'),
            hasProcessNumbers: /1\.|2\.|3\.|4\./.test(content) || /Step 1|Step 2|Step 3|Step 4/.test(content),
            interactive: content.includes('hover') || content.includes('animation'),
            responsive: content.includes('sm:') && content.includes('lg:')
        };
    }

    testCaseStudiesComponent(content) {
        return {
            hasCaseStudies: /case study|case studies/i.test(content),
            hasResults: content.includes('%') || content.includes('improvement'),
            hasROIData: content.includes('ROI') || content.includes('250%') || content.includes('return'),
            hasClientTestimonials: content.includes('testimonial') || content.includes('client'),
            hasMetrics: /\d+%|\$\d+|improved by/.test(content)
        };
    }

    testTeamComponent(content) {
        return {
            hasTeamMembers: content.includes('team') || content.includes('member'),
            hasProfileImages: content.includes('<img') && content.includes('profile'),
            hasTeamBios: content.includes('bio') || content.includes('experience'),
            hasCredentials: content.includes('credential') || content.includes('certification'),
            responsive: content.includes('grid') && content.includes('sm:') && content.includes('lg:')
        };
    }

    testTestimonialsComponent(content) {
        return {
            hasTestimonials: /testimonial|review|feedback/i.test(content),
            hasClientNames: content.includes('client') || content.includes('name'),
            hasRatings: content.includes('star') || content.includes('rating') || content.includes('★'),
            hasCarousel: content.includes('carousel') || content.includes('slide'),
            hasQuotes: content.includes('"') || content.includes('"') || content.includes('"')
        };
    }

    testContactComponent(content) {
        return {
            hasContactForm: content.includes('<form') || content.includes('form'),
            hasFormFields: content.includes('<input') && content.includes('<textarea'),
            hasContactInfo: content.includes('phone') || content.includes('email') || content.includes('address'),
            hasFormValidation: content.includes('required') || content.includes('validation'),
            hasSubmitButton: content.includes('submit') || content.includes('Send'),
            responsive: content.includes('sm:') && content.includes('lg:')
        };
    }

    testFrameworkGalleryComponent(content) {
        return {
            hasFrameworkItems: content.includes('framework') || content.includes('canvas'),
            hasFilteringCapability: content.includes('filter') || content.includes('category'),
            hasFrameworkViewer: content.includes('viewer') || content.includes('modal'),
            hasFrameworkFiles: content.includes('.html') && content.includes('framework'),
            interactive: content.includes('click') || content.includes('open')
        };
    }

    testContactFormComponent(content) {
        return {
            hasNameField: content.includes('name') && content.includes('input'),
            hasEmailField: content.includes('email') && content.includes('input'),
            hasMessageField: content.includes('message') && content.includes('textarea'),
            hasRequiredFields: content.includes('required'),
            hasFormValidation: content.includes('validation') || content.includes('error'),
            hasSuccessHandling: content.includes('success') || content.includes('thank'),
            hasProperLabels: content.includes('<label') || content.includes('placeholder')
        };
    }

    async testResponsiveDesign() {
        console.log('📱 Testing responsive design...');
        
        // Test viewport meta tag presence
        try {
            const homeResponse = await this.makeHttpRequest('/');
            const hasViewportMeta = homeResponse.body.includes('name="viewport"');
            
            this.results.responsiveDesign.push({
                test: 'Viewport Meta Tag',
                passed: hasViewportMeta,
                description: hasViewportMeta ? 'Viewport meta tag present' : 'Missing viewport meta tag'
            });

            // Test responsive CSS classes
            const responsiveClasses = [
                'sm:', 'md:', 'lg:', 'xl:', '2xl:',
                'grid-cols-1', 'grid-cols-2', 'grid-cols-3',
                'flex-col', 'flex-row',
                'hidden sm:block', 'block sm:hidden'
            ];

            let responsiveClassCount = 0;
            responsiveClasses.forEach(className => {
                if (homeResponse.body.includes(className)) {
                    responsiveClassCount++;
                }
            });

            this.results.responsiveDesign.push({
                test: 'Responsive CSS Classes',
                passed: responsiveClassCount >= 5,
                description: `Found ${responsiveClassCount} responsive CSS patterns`,
                classesFound: responsiveClassCount
            });

            // Test mobile-specific elements
            const hasMobileMenu = homeResponse.body.includes('mobile-menu') || 
                                 homeResponse.body.includes('hamburger') ||
                                 homeResponse.body.includes('menu-toggle');

            this.results.responsiveDesign.push({
                test: 'Mobile Navigation',
                passed: hasMobileMenu,
                description: hasMobileMenu ? 'Mobile menu elements detected' : 'No mobile menu elements found'
            });

        } catch (error) {
            this.results.issues.push({
                type: 'Responsive Design Test Error',
                issue: error.message
            });
        }
    }

    async analyzeVisualConsistency() {
        console.log('🎨 Analyzing visual consistency...');
        
        try {
            const homeResponse = await this.makeHttpRequest('/');
            const content = homeResponse.body;

            // Test color consistency
            const colorClasses = [
                'teamx-navy', 'teamx-blue', 'teamx-charcoal',
                'teamx-warm-gray', 'teamx-light-slate',
                'teamx-health-teal', 'teamx-trust-green'
            ];

            let colorConsistency = 0;
            colorClasses.forEach(color => {
                if (content.includes(color)) {
                    colorConsistency++;
                }
            });

            this.results.visualConsistency.push({
                test: 'Color Palette Consistency',
                passed: colorConsistency >= 4,
                description: `Found ${colorConsistency}/${colorClasses.length} brand colors in use`,
                colorsFound: colorConsistency
            });

            // Test typography consistency
            const fontClasses = [
                'font-bold', 'font-semibold', 'font-medium',
                'text-sm', 'text-base', 'text-lg', 'text-xl',
                'text-2xl', 'text-3xl', 'text-4xl'
            ];

            let typographyConsistency = 0;
            fontClasses.forEach(font => {
                if (content.includes(font)) {
                    typographyConsistency++;
                }
            });

            this.results.visualConsistency.push({
                test: 'Typography Consistency',
                passed: typographyConsistency >= 6,
                description: `Found ${typographyConsistency}/${fontClasses.length} typography classes`,
                typographyFound: typographyConsistency
            });

            // Test spacing consistency
            const spacingClasses = [
                'p-', 'px-', 'py-', 'm-', 'mx-', 'my-',
                'space-y-', 'space-x-', 'gap-'
            ];

            let spacingConsistency = 0;
            spacingClasses.forEach(spacing => {
                if (content.includes(spacing)) {
                    spacingConsistency++;
                }
            });

            this.results.visualConsistency.push({
                test: 'Spacing Consistency',
                passed: spacingConsistency >= 6,
                description: `Found ${spacingConsistency}/${spacingClasses.length} spacing patterns`,
                spacingFound: spacingConsistency
            });

            // Test animation consistency
            const animationPatterns = [
                'motion.', 'animate', 'transition', 'duration-', 'ease-', 'hover:'
            ];

            let animationConsistency = 0;
            animationPatterns.forEach(pattern => {
                if (content.includes(pattern)) {
                    animationConsistency++;
                }
            });

            this.results.visualConsistency.push({
                test: 'Animation Consistency',
                passed: animationConsistency >= 4,
                description: `Found ${animationConsistency}/${animationPatterns.length} animation patterns`,
                animationsFound: animationConsistency
            });

        } catch (error) {
            this.results.issues.push({
                type: 'Visual Consistency Test Error',
                issue: error.message
            });
        }
    }

    makeHttpRequest(pagePath) {
        return new Promise((resolve, reject) => {
            const http = require('http');
            const fullUrl = `${BASE_URL}${pagePath}`;

            const req = http.get(fullUrl, (res) => {
                let body = '';
                
                res.on('data', (chunk) => {
                    body += chunk;
                });

                res.on('end', () => {
                    resolve({
                        statusCode: res.statusCode,
                        statusMessage: res.statusMessage,
                        headers: res.headers,
                        body: body
                    });
                });
            });

            req.on('error', (error) => {
                reject(error);
            });

            req.setTimeout(30000, () => {
                req.destroy();
                reject(new Error('Request timeout'));
            });
        });
    }

    async generateVisualReport() {
        const summary = {
            totalComponents: this.results.components.length,
            componentsWithIssues: this.results.components.filter(c => 
                Object.values(c.results).some(v => v === false)
            ).length,
            responsiveTestsPassed: this.results.responsiveDesign.filter(r => r.passed).length,
            responsiveTestsTotal: this.results.responsiveDesign.length,
            visualConsistencyScore: this.results.visualConsistency.filter(v => v.passed).length,
            visualConsistencyTotal: this.results.visualConsistency.length,
            totalIssues: this.results.issues.length
        };

        const reportData = {
            timestamp: this.results.timestamp,
            summary,
            components: this.results.components,
            responsiveDesign: this.results.responsiveDesign,
            visualConsistency: this.results.visualConsistency,
            interactions: this.results.interactions,
            issues: this.results.issues,
            recommendations: this.generateVisualRecommendations()
        };

        // Save detailed results
        const resultsPath = path.join(RESULTS_DIR, 'visual-component-test-results.json');
        fs.writeFileSync(resultsPath, JSON.stringify(reportData, null, 2));

        this.printVisualSummary(summary);
        console.log(`\n📊 Visual test results saved to: ${resultsPath}`);
        
        return reportData;
    }

    generateVisualRecommendations() {
        const recommendations = [];
        
        // Component recommendations
        const componentIssues = this.results.issues.filter(i => i.type.includes('Component'));
        if (componentIssues.length > 0) {
            recommendations.push({
                category: 'Components',
                priority: 'High',
                issue: `${componentIssues.length} component issues found`,
                recommendation: 'Review component implementation and fix missing elements',
                affectedComponents: [...new Set(componentIssues.map(i => i.component))]
            });
        }

        // Responsive design recommendations
        const responsiveFailed = this.results.responsiveDesign.filter(r => !r.passed);
        if (responsiveFailed.length > 0) {
            recommendations.push({
                category: 'Responsive Design',
                priority: 'High',
                issue: `${responsiveFailed.length} responsive design tests failed`,
                recommendation: 'Implement proper responsive breakpoints and mobile-first design',
                failedTests: responsiveFailed.map(r => r.test)
            });
        }

        // Visual consistency recommendations
        const visualFailed = this.results.visualConsistency.filter(v => !v.passed);
        if (visualFailed.length > 0) {
            recommendations.push({
                category: 'Visual Consistency',
                priority: 'Medium',
                issue: `${visualFailed.length} visual consistency tests failed`,
                recommendation: 'Standardize color palette, typography, and spacing across all components',
                inconsistentAreas: visualFailed.map(v => v.test)
            });
        }

        return recommendations;
    }

    printVisualSummary(summary) {
        console.log('\n' + '='.repeat(60));
        console.log('🎨 VISUAL COMPONENT TEST SUMMARY');
        console.log('='.repeat(60));
        console.log(`🧩 Components Tested: ${summary.totalComponents}`);
        console.log(`⚠️ Components with Issues: ${summary.componentsWithIssues}`);
        console.log(`📱 Responsive Tests: ${summary.responsiveTestsPassed}/${summary.responsiveTestsTotal} passed`);
        console.log(`🎨 Visual Consistency: ${summary.visualConsistencyScore}/${summary.visualConsistencyTotal} passed`);
        console.log(`🔍 Total Issues Found: ${summary.totalIssues}`);
        
        const overallScore = Math.round(
            ((summary.responsiveTestsPassed / Math.max(summary.responsiveTestsTotal, 1)) * 40) +
            ((summary.visualConsistencyScore / Math.max(summary.visualConsistencyTotal, 1)) * 30) +
            (((summary.totalComponents - summary.componentsWithIssues) / Math.max(summary.totalComponents, 1)) * 30)
        );
        
        console.log(`🏆 Overall Visual Score: ${overallScore}/100`);
        
        if (overallScore >= 85) {
            console.log('🟢 Status: Excellent visual implementation');
        } else if (overallScore >= 70) {
            console.log('🟡 Status: Good with room for improvement');
        } else if (overallScore >= 50) {
            console.log('🟠 Status: Fair - needs attention');
        } else {
            console.log('🔴 Status: Poor - requires significant work');
        }
        
        console.log('='.repeat(60));
    }
}

// Run the visual testing if called directly
if (require.main === module) {
    const tester = new VisualComponentTester();
    tester.runVisualTests().catch(console.error);
}

module.exports = VisualComponentTester;