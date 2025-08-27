const fs = require('fs');
const path = require('path');
const http = require('http');

// Test configuration
const BASE_URL = 'http://localhost:3000';
const RESULTS_DIR = './screenshots/validation-results';

// All pages to test with their expected components and features
const PAGES = [
    {
        path: '/',
        name: 'Home Page',
        critical: true,
        expectedComponents: ['Hero', 'Services', 'ProcessOverview', 'CaseStudiesPreview', 'Team', 'Testimonials', 'Contact'],
        expectedFeatures: ['ROI Calculator', 'Call to Action', 'Company Stats', 'Navigation Menu']
    },
    {
        path: '/about',
        name: 'About Page',
        critical: true,
        expectedComponents: ['About Section', 'Team Overview', 'Mission Statement'],
        expectedFeatures: ['Company History', 'Values', 'Leadership']
    },
    {
        path: '/services',
        name: 'Services Page',
        critical: true,
        expectedComponents: ['Services Grid', 'Service Details', 'ROI Information'],
        expectedFeatures: ['Service Categories', 'Benefits', 'Pricing Information']
    },
    {
        path: '/process',
        name: 'Process Page',
        critical: false,
        expectedComponents: ['Process Timeline', 'Step Details'],
        expectedFeatures: ['Methodology', 'Timeline', 'Process Steps']
    },
    {
        path: '/case-studies',
        name: 'Case Studies Page',
        critical: false,
        expectedComponents: ['Case Study Cards', 'Results Display'],
        expectedFeatures: ['Success Stories', 'ROI Results', 'Client Testimonials']
    },
    {
        path: '/team',
        name: 'Team Page',
        critical: false,
        expectedComponents: ['Team Member Cards', 'Profile Information'],
        expectedFeatures: ['Team Bios', 'Credentials', 'Experience']
    },
    {
        path: '/frameworks',
        name: 'Frameworks Page',
        critical: false,
        expectedComponents: ['Framework Gallery', 'Framework Viewer'],
        expectedFeatures: ['Interactive Frameworks', 'Framework Details', 'PDF Viewer']
    },
    {
        path: '/resources',
        name: 'Resources Page',
        critical: false,
        expectedComponents: ['Resource List', 'Download Links'],
        expectedFeatures: ['Whitepapers', 'Tools', 'Documentation']
    },
    {
        path: '/investors',
        name: 'Investors Page',
        critical: false,
        expectedComponents: ['Investment Information', 'Financial Data'],
        expectedFeatures: ['Investment Opportunities', 'Financial Performance', 'Partnership Info']
    },
    {
        path: '/contact',
        name: 'Contact Page',
        critical: true,
        expectedComponents: ['Contact Form', 'Contact Information'],
        expectedFeatures: ['Form Validation', 'Contact Details', 'Location Information']
    }
];

class FinalValidator {
    constructor() {
        this.results = {
            summary: {},
            pages: [],
            components: [],
            seo: [],
            performance: [],
            accessibility: [],
            security: [],
            responsive: [],
            issues: [],
            recommendations: [],
            timestamp: new Date().toISOString()
        };

        // Ensure results directory exists
        if (!fs.existsSync(RESULTS_DIR)) {
            fs.mkdirSync(RESULTS_DIR, { recursive: true });
        }
    }

    async runFinalValidation() {
        console.log('🚀 Running Final Comprehensive TeamX Website Validation');
        console.log('='.repeat(70));
        console.log(`📊 Testing ${PAGES.length} pages with comprehensive validation`);
        console.log(`🌐 Base URL: ${BASE_URL}`);
        console.log(`📁 Results Directory: ${RESULTS_DIR}`);
        console.log('='.repeat(70));

        // Test each page comprehensively
        for (const page of PAGES) {
            await this.validatePage(page);
        }

        // Run additional system tests
        await this.validateSystemFeatures();
        
        // Generate final report
        await this.generateFinalReport();

        console.log('\n✅ Final validation completed successfully!');
        return this.results;
    }

    async validatePage(pageInfo) {
        console.log(`\n📄 Validating ${pageInfo.name} (${pageInfo.path})...`);
        
        const pageResults = {
            ...pageInfo,
            timestamp: new Date().toISOString(),
            tests: {
                navigation: {},
                content: {},
                seo: {},
                performance: {},
                accessibility: {},
                components: {},
                features: {}
            },
            issues: [],
            score: 0
        };

        try {
            // Get page content
            const response = await this.makeHttpRequest(pageInfo.path);
            
            if (response.statusCode !== 200) {
                pageResults.issues.push({
                    type: 'Critical Error',
                    severity: 'High',
                    issue: `Page returned HTTP ${response.statusCode}`,
                    impact: 'Page inaccessible to users'
                });
                this.results.pages.push(pageResults);
                return;
            }

            const content = response.body;
            const loadTime = response.loadTime || 0;

            // Run all validation tests
            pageResults.tests.navigation = await this.testNavigation(pageInfo, response);
            pageResults.tests.content = await this.testContent(pageInfo, content);
            pageResults.tests.seo = await this.testSEO(pageInfo, content);
            pageResults.tests.performance = await this.testPerformance(pageInfo, response, loadTime);
            pageResults.tests.accessibility = await this.testAccessibility(pageInfo, content);
            pageResults.tests.components = await this.testComponents(pageInfo, content);
            pageResults.tests.features = await this.testFeatures(pageInfo, content);

            // Calculate page score
            pageResults.score = this.calculatePageScore(pageResults.tests);

            // Collect issues
            this.collectPageIssues(pageResults, pageInfo);

        } catch (error) {
            console.error(`❌ Error validating ${pageInfo.name}: ${error.message}`);
            pageResults.issues.push({
                type: 'Validation Error',
                severity: 'High',
                issue: error.message,
                impact: 'Unable to complete validation'
            });
        }

        this.results.pages.push(pageResults);
        this.printPageSummary(pageResults);
    }

    async testNavigation(pageInfo, response) {
        return {
            accessible: response.statusCode === 200,
            loadTime: response.loadTime || 0,
            contentLength: parseInt(response.headers['content-length']) || response.body?.length || 0,
            contentType: response.headers['content-type'] || 'unknown',
            statusCode: response.statusCode,
            serverHeader: response.headers['server'] || 'Not disclosed',
            hasRedirect: response.statusCode >= 300 && response.statusCode < 400
        };
    }

    async testContent(pageInfo, content) {
        const wordCount = content.replace(/<[^>]*>/g, ' ').split(/\s+/).filter(w => w.length > 0).length;
        
        return {
            wordCount,
            hasHealthcareTerms: this.checkHealthcareTerms(content),
            hasCanadianContext: this.checkCanadianContext(content),
            hasROIContent: this.checkROIContent(content),
            hasCallToAction: this.checkCallToAction(content),
            hasProfessionalTone: wordCount > 100, // Basic check
            hasContactInformation: content.includes('@') || content.includes('phone') || content.includes('contact'),
            contentQuality: this.assessContentQuality(content, pageInfo)
        };
    }

    async testSEO(pageInfo, content) {
        const title = this.extractTitle(content);
        const metaDescription = this.extractMetaContent(content, 'description');
        const h1Count = (content.match(/<h1[^>]*>/gi) || []).length;
        const h1Content = this.extractTag(content, 'h1');

        return {
            title,
            titleLength: title ? title.length : 0,
            hasTitle: !!title && title.length > 0,
            titleOptimal: title && title.length >= 30 && title.length <= 60,
            metaDescription,
            metaDescriptionLength: metaDescription ? metaDescription.length : 0,
            hasMetaDescription: !!metaDescription,
            metaDescriptionOptimal: metaDescription && metaDescription.length >= 120 && metaDescription.length <= 160,
            h1Count,
            h1Content,
            hasProperH1: h1Count === 1,
            hasViewportMeta: content.includes('name="viewport"'),
            hasCanonical: content.includes('rel="canonical"'),
            hasOpenGraph: this.checkOpenGraphTags(content),
            hasStructuredData: content.includes('application/ld+json'),
            hasRobotsMeta: content.includes('name="robots"'),
            internalLinks: this.countInternalLinks(content),
            externalLinks: this.countExternalLinks(content),
            imageAltTags: this.checkImageAltTags(content)
        };
    }

    async testPerformance(pageInfo, response, loadTime) {
        const contentSize = parseInt(response.headers['content-length']) || response.body?.length || 0;
        
        return {
            loadTime,
            contentSize,
            sizeOptimal: contentSize < 500000, // Less than 500KB
            hasCompression: response.headers['content-encoding']?.includes('gzip') || 
                           response.headers['content-encoding']?.includes('br'),
            hasCaching: !!response.headers['cache-control'],
            hasEtag: !!response.headers['etag'],
            hasLastModified: !!response.headers['last-modified'],
            cacheControl: response.headers['cache-control'] || 'Not set',
            compressionType: response.headers['content-encoding'] || 'None'
        };
    }

    async testAccessibility(pageInfo, content) {
        const images = (content.match(/<img[^>]*>/gi) || []);
        const imagesWithAlt = images.filter(img => img.includes('alt=')).length;
        const totalImages = images.length;

        return {
            imagesWithAlt,
            totalImages,
            altTagCoverage: totalImages > 0 ? Math.round((imagesWithAlt / totalImages) * 100) : 100,
            hasSkipLinks: content.includes('skip to') || content.includes('skip-'),
            ariaLabels: (content.match(/aria-label/gi) || []).length,
            ariaDescribedBy: (content.match(/aria-describedby/gi) || []).length,
            ariaHidden: (content.match(/aria-hidden/gi) || []).length,
            hasLangAttribute: content.includes('lang="'),
            hasProperHeadings: this.checkHeadingHierarchy(content),
            formLabels: this.checkFormLabels(content),
            colorContrast: 'Not tested - requires browser analysis'
        };
    }

    async testComponents(pageInfo, content) {
        const componentResults = {};
        
        for (const component of pageInfo.expectedComponents) {
            componentResults[component] = this.testSpecificComponent(component, content);
        }

        return {
            expectedComponents: pageInfo.expectedComponents.length,
            componentsDetected: Object.values(componentResults).filter(c => c.detected).length,
            componentResults,
            componentsCoverage: Math.round((Object.values(componentResults).filter(c => c.detected).length / pageInfo.expectedComponents.length) * 100)
        };
    }

    async testFeatures(pageInfo, content) {
        const featureResults = {};
        
        for (const feature of pageInfo.expectedFeatures) {
            featureResults[feature] = this.testSpecificFeature(feature, content);
        }

        return {
            expectedFeatures: pageInfo.expectedFeatures.length,
            featuresDetected: Object.values(featureResults).filter(f => f.present).length,
            featureResults,
            featuresCoverage: Math.round((Object.values(featureResults).filter(f => f.present).length / pageInfo.expectedFeatures.length) * 100)
        };
    }

    testSpecificComponent(componentName, content) {
        const lowerContent = content.toLowerCase();
        let detected = false;
        let confidence = 0;
        let evidence = [];

        switch (componentName) {
            case 'Hero':
                detected = content.includes('<h1') || content.includes('hero');
                evidence = ['H1 tag present', 'Hero section detected'];
                confidence = detected ? 90 : 10;
                break;
            
            case 'Services':
                detected = lowerContent.includes('service') && (lowerContent.includes('grid') || lowerContent.includes('card'));
                evidence = ['Services content found', 'Grid or card layout detected'];
                confidence = detected ? 85 : 20;
                break;

            case 'Contact Form':
                detected = content.includes('<form') && content.includes('input') && content.includes('textarea');
                evidence = ['Form element present', 'Input fields detected'];
                confidence = detected ? 95 : 5;
                break;

            case 'Framework Gallery':
                detected = lowerContent.includes('framework') && (lowerContent.includes('gallery') || lowerContent.includes('grid'));
                evidence = ['Framework content found', 'Gallery layout detected'];
                confidence = detected ? 80 : 15;
                break;

            default:
                detected = lowerContent.includes(componentName.toLowerCase());
                evidence = [`${componentName} content references found`];
                confidence = detected ? 70 : 30;
        }

        return { detected, confidence, evidence };
    }

    testSpecificFeature(featureName, content) {
        const lowerContent = content.toLowerCase();
        let present = false;
        let functional = 'Unknown';
        let notes = [];

        switch (featureName) {
            case 'ROI Calculator':
                present = lowerContent.includes('roi') || lowerContent.includes('calculator') || content.includes('250%');
                functional = present ? 'Likely' : 'No';
                notes = present ? ['ROI content detected'] : ['No ROI calculator found'];
                break;

            case 'Call to Action':
                present = lowerContent.includes('contact us') || lowerContent.includes('get started') || 
                         lowerContent.includes('learn more') || content.includes('btn');
                functional = present ? 'Yes' : 'No';
                notes = present ? ['CTA buttons/links detected'] : ['No clear CTAs found'];
                break;

            case 'Navigation Menu':
                present = content.includes('<nav') || content.includes('menu');
                functional = present ? 'Yes' : 'No';
                notes = present ? ['Navigation elements found'] : ['No navigation detected'];
                break;

            case 'Form Validation':
                present = content.includes('required') || content.includes('validation');
                functional = present ? 'Likely' : 'Unknown';
                notes = present ? ['Validation attributes found'] : ['No validation detected'];
                break;

            default:
                present = lowerContent.includes(featureName.toLowerCase().replace(/\s+/g, ''));
                functional = 'Unknown';
                notes = [`Feature search for "${featureName}"`];
        }

        return { present, functional, notes };
    }

    calculatePageScore(tests) {
        let score = 0;
        let totalPoints = 0;

        // Navigation (20 points)
        if (tests.navigation.accessible) score += 10;
        if (tests.navigation.loadTime < 3000) score += 5;
        if (tests.navigation.contentLength > 0) score += 5;
        totalPoints += 20;

        // SEO (25 points)
        if (tests.seo.hasTitle) score += 5;
        if (tests.seo.titleOptimal) score += 3;
        if (tests.seo.hasMetaDescription) score += 5;
        if (tests.seo.metaDescriptionOptimal) score += 3;
        if (tests.seo.hasProperH1) score += 4;
        if (tests.seo.hasViewportMeta) score += 2;
        if (tests.seo.hasOpenGraph) score += 3;
        totalPoints += 25;

        // Content (20 points)
        if (tests.content.hasHealthcareTerms) score += 5;
        if (tests.content.hasCallToAction) score += 5;
        if (tests.content.hasROIContent) score += 5;
        if (tests.content.wordCount > 200) score += 3;
        if (tests.content.hasContactInformation) score += 2;
        totalPoints += 20;

        // Performance (15 points)
        if (tests.performance.loadTime < 2000) score += 5;
        if (tests.performance.sizeOptimal) score += 5;
        if (tests.performance.hasCompression) score += 3;
        if (tests.performance.hasCaching) score += 2;
        totalPoints += 15;

        // Accessibility (10 points)
        if (tests.accessibility.altTagCoverage >= 90) score += 5;
        if (tests.accessibility.ariaLabels > 0) score += 2;
        if (tests.accessibility.hasProperHeadings) score += 3;
        totalPoints += 10;

        // Components (10 points)
        if (tests.components.componentsCoverage >= 80) score += 10;
        else if (tests.components.componentsCoverage >= 60) score += 7;
        else if (tests.components.componentsCoverage >= 40) score += 4;
        totalPoints += 10;

        return Math.round((score / totalPoints) * 100);
    }

    collectPageIssues(pageResults, pageInfo) {
        const tests = pageResults.tests;

        // Navigation issues
        if (!tests.navigation.accessible) {
            pageResults.issues.push({
                type: 'Navigation Error',
                severity: 'High',
                issue: `Page not accessible (HTTP ${tests.navigation.statusCode})`,
                impact: 'Users cannot access the page'
            });
        }

        if (tests.navigation.loadTime > 3000) {
            pageResults.issues.push({
                type: 'Performance Warning',
                severity: 'Medium',
                issue: `Slow load time: ${tests.navigation.loadTime}ms`,
                impact: 'Poor user experience'
            });
        }

        // SEO issues
        if (!tests.seo.hasTitle) {
            pageResults.issues.push({
                type: 'SEO Error',
                severity: 'High',
                issue: 'Missing page title',
                impact: 'Poor search engine visibility'
            });
        }

        if (!tests.seo.hasMetaDescription && pageInfo.critical) {
            pageResults.issues.push({
                type: 'SEO Warning',
                severity: 'Medium',
                issue: 'Missing meta description on critical page',
                impact: 'Reduced search result click-through rate'
            });
        }

        if (tests.seo.h1Count !== 1) {
            pageResults.issues.push({
                type: 'SEO Warning',
                severity: 'Medium',
                issue: `Incorrect H1 count: ${tests.seo.h1Count} (should be 1)`,
                impact: 'Suboptimal SEO structure'
            });
        }

        // Content issues
        if (!tests.content.hasCallToAction && pageInfo.critical) {
            pageResults.issues.push({
                type: 'Content Warning',
                severity: 'Medium',
                issue: 'Critical page missing clear call-to-action',
                impact: 'Reduced conversion potential'
            });
        }

        // Accessibility issues
        if (tests.accessibility.altTagCoverage < 80) {
            pageResults.issues.push({
                type: 'Accessibility Warning',
                severity: 'Medium',
                issue: `Low alt tag coverage: ${tests.accessibility.altTagCoverage}%`,
                impact: 'Poor accessibility for screen readers'
            });
        }

        // Add issues to global results
        this.results.issues.push(...pageResults.issues);
    }

    async validateSystemFeatures() {
        console.log('\n🔧 Validating system-wide features...');

        // Test robots.txt
        try {
            const robotsResponse = await this.makeHttpRequest('/robots.txt');
            this.results.seo.push({
                feature: 'robots.txt',
                status: robotsResponse.statusCode === 200 ? 'Present' : 'Missing',
                content: robotsResponse.statusCode === 200 ? robotsResponse.body.slice(0, 200) : null
            });
        } catch (error) {
            this.results.issues.push({
                type: 'SEO Warning',
                severity: 'Low',
                issue: 'robots.txt not accessible',
                impact: 'Search engines may not understand crawling preferences'
            });
        }

        // Test sitemap.xml
        try {
            const sitemapResponse = await this.makeHttpRequest('/sitemap.xml');
            const urlCount = sitemapResponse.statusCode === 200 ? 
                (sitemapResponse.body.match(/<url>/g) || []).length : 0;
            
            this.results.seo.push({
                feature: 'sitemap.xml',
                status: sitemapResponse.statusCode === 200 ? 'Present' : 'Missing',
                urlCount
            });
        } catch (error) {
            this.results.issues.push({
                type: 'SEO Warning',
                severity: 'Medium',
                issue: 'sitemap.xml not accessible',
                impact: 'Search engines may have difficulty indexing all pages'
            });
        }

        // Test API health
        try {
            const healthResponse = await this.makeHttpRequest('/api/health');
            this.results.performance.push({
                feature: 'Health Check API',
                status: healthResponse.statusCode === 200 ? 'Working' : 'Failed',
                response: healthResponse.statusCode === 200 ? JSON.parse(healthResponse.body) : null
            });
        } catch (error) {
            this.results.issues.push({
                type: 'System Warning',
                severity: 'Low',
                issue: 'Health check API not working',
                impact: 'Monitoring and diagnostics unavailable'
            });
        }
    }

    async generateFinalReport() {
        console.log('\n📊 Generating final validation report...');

        // Calculate overall statistics
        const totalPages = this.results.pages.length;
        const successfulPages = this.results.pages.filter(p => p.tests?.navigation?.accessible).length;
        const criticalPagesFailed = this.results.pages.filter(p => p.critical && !p.tests?.navigation?.accessible).length;
        const averageScore = Math.round(
            this.results.pages.reduce((sum, p) => sum + (p.score || 0), 0) / totalPages
        );
        const totalIssues = this.results.issues.length;
        const highSeverityIssues = this.results.issues.filter(i => i.severity === 'High').length;

        this.results.summary = {
            totalPages,
            successfulPages,
            failedPages: totalPages - successfulPages,
            criticalPagesFailed,
            averageScore,
            totalIssues,
            highSeverityIssues,
            mediumSeverityIssues: this.results.issues.filter(i => i.severity === 'Medium').length,
            lowSeverityIssues: this.results.issues.filter(i => i.severity === 'Low').length,
            validationTimestamp: this.results.timestamp,
            overallStatus: this.determineOverallStatus(averageScore, criticalPagesFailed, highSeverityIssues)
        };

        // Generate recommendations
        this.results.recommendations = this.generateRecommendations();

        // Save comprehensive results
        const reportPath = path.join(RESULTS_DIR, 'final-comprehensive-validation.json');
        fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));

        // Print final summary
        this.printFinalSummary();
        
        console.log(`\n📄 Complete validation report saved: ${reportPath}`);
        
        return this.results;
    }

    determineOverallStatus(averageScore, criticalPagesFailed, highSeverityIssues) {
        if (criticalPagesFailed > 0 || highSeverityIssues > 5) {
            return 'Critical Issues - Immediate Attention Required';
        } else if (averageScore >= 85 && highSeverityIssues === 0) {
            return 'Excellent - Production Ready';
        } else if (averageScore >= 70 && highSeverityIssues <= 2) {
            return 'Good - Minor Improvements Recommended';
        } else if (averageScore >= 50) {
            return 'Fair - Several Issues Need Attention';
        } else {
            return 'Poor - Significant Issues Require Resolution';
        }
    }

    generateRecommendations() {
        const recommendations = [];
        
        // Critical issues first
        if (this.results.summary.criticalPagesFailed > 0) {
            recommendations.push({
                priority: 'Critical',
                category: 'Accessibility',
                title: 'Fix Critical Page Failures',
                description: `${this.results.summary.criticalPagesFailed} critical pages are not accessible`,
                impact: 'High - Users cannot access essential functionality',
                effort: 'High',
                timeframe: 'Immediate'
            });
        }

        // High severity issues
        if (this.results.summary.highSeverityIssues > 0) {
            recommendations.push({
                priority: 'High',
                category: 'Technical',
                title: 'Resolve High Severity Issues',
                description: `${this.results.summary.highSeverityIssues} high severity issues found`,
                impact: 'High - Affects user experience and SEO',
                effort: 'Medium',
                timeframe: '1-2 weeks'
            });
        }

        // SEO improvements
        const seoIssues = this.results.issues.filter(i => i.type.includes('SEO')).length;
        if (seoIssues > 0) {
            recommendations.push({
                priority: 'Medium',
                category: 'SEO',
                title: 'Improve SEO Implementation',
                description: `${seoIssues} SEO-related issues need attention`,
                impact: 'Medium - Affects search visibility',
                effort: 'Low',
                timeframe: '1 week'
            });
        }

        // Performance optimizations
        const perfIssues = this.results.issues.filter(i => i.type.includes('Performance')).length;
        if (perfIssues > 0) {
            recommendations.push({
                priority: 'Medium',
                category: 'Performance',
                title: 'Optimize Website Performance',
                description: `${perfIssues} performance issues identified`,
                impact: 'Medium - Affects user experience',
                effort: 'Medium',
                timeframe: '2-3 weeks'
            });
        }

        // Accessibility improvements
        const a11yIssues = this.results.issues.filter(i => i.type.includes('Accessibility')).length;
        if (a11yIssues > 0) {
            recommendations.push({
                priority: 'Medium',
                category: 'Accessibility',
                title: 'Enhance Accessibility',
                description: `${a11yIssues} accessibility issues need attention`,
                impact: 'Medium - Affects user inclusivity',
                effort: 'Low',
                timeframe: '1 week'
            });
        }

        return recommendations;
    }

    printFinalSummary() {
        const summary = this.results.summary;
        
        console.log('\n' + '='.repeat(70));
        console.log('🏆 FINAL TEAMX WEBSITE VALIDATION REPORT');
        console.log('='.repeat(70));
        console.log(`📊 Overall Score: ${summary.averageScore}/100`);
        console.log(`📄 Pages Tested: ${summary.totalPages}`);
        console.log(`✅ Successful Pages: ${summary.successfulPages}`);
        console.log(`❌ Failed Pages: ${summary.failedPages}`);
        console.log(`🔴 Critical Failures: ${summary.criticalPagesFailed}`);
        console.log(`⚠️ Total Issues: ${summary.totalIssues} (High: ${summary.highSeverityIssues}, Medium: ${summary.mediumSeverityIssues}, Low: ${summary.lowSeverityIssues})`);
        console.log(`📈 Status: ${summary.overallStatus}`);
        console.log('='.repeat(70));
        
        if (summary.overallStatus.includes('Excellent')) {
            console.log('🟢 🎉 Congratulations! Your website is production-ready with excellent quality scores.');
        } else if (summary.overallStatus.includes('Good')) {
            console.log('🟡 💪 Your website is in good shape with minor improvements recommended.');
        } else if (summary.overallStatus.includes('Fair')) {
            console.log('🟠 🔧 Your website needs attention in several areas for optimal performance.');
        } else {
            console.log('🔴 ⚠️ Critical issues require immediate attention before production deployment.');
        }
        
        console.log('\n🎯 Top Recommendations:');
        this.results.recommendations.slice(0, 3).forEach((rec, index) => {
            console.log(`${index + 1}. [${rec.priority}] ${rec.title}`);
            console.log(`   📝 ${rec.description}`);
        });
    }

    printPageSummary(pageResults) {
        const score = pageResults.score || 0;
        const issues = pageResults.issues.length;
        const status = score >= 80 ? '🟢' : score >= 60 ? '🟡' : '🔴';
        
        console.log(`   ${status} Score: ${score}/100 | Issues: ${issues} | Load: ${pageResults.tests.navigation?.loadTime || 0}ms`);
    }

    // Helper methods (same as previous implementations)
    makeHttpRequest(pagePath) {
        return new Promise((resolve, reject) => {
            const startTime = Date.now();
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
                        body: body,
                        loadTime: Date.now() - startTime
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

    checkHealthcareTerms(content) {
        const terms = ['healthcare', 'health care', 'medical', 'clinical', 'wellness', 'therapy', 'treatment'];
        return terms.some(term => content.toLowerCase().includes(term));
    }

    checkCanadianContext(content) {
        const terms = ['canada', 'canadian', 'ontario', 'toronto'];
        return terms.some(term => content.toLowerCase().includes(term));
    }

    checkROIContent(content) {
        const terms = ['roi', 'return on investment', '250%', 'investment', 'value'];
        return terms.some(term => content.toLowerCase().includes(term));
    }

    checkCallToAction(content) {
        const terms = ['contact us', 'get started', 'learn more', 'schedule', 'book'];
        return terms.some(term => content.toLowerCase().includes(term)) || content.includes('btn');
    }

    extractTitle(content) {
        const match = content.match(/<title[^>]*>([^<]*)<\/title>/i);
        return match ? match[1].trim() : null;
    }

    extractMetaContent(content, name) {
        const regex = new RegExp(`<meta[^>]*name=['"]${name}['"][^>]*content=['"]([^'"]*?)['"]`, 'i');
        const match = content.match(regex);
        return match ? match[1] : null;
    }

    extractTag(content, tagName) {
        const regex = new RegExp(`<${tagName}[^>]*>([^<]*)</${tagName}>`, 'i');
        const match = content.match(regex);
        return match ? match[1].trim().replace(/<[^>]*>/g, '') : null;
    }

    checkOpenGraphTags(content) {
        return content.includes('og:title') && content.includes('og:description');
    }

    countInternalLinks(content) {
        const regex = /<a[^>]*href=['"]([^'"]*?)['"][^>]*>/gi;
        let count = 0;
        let match;
        
        while ((match = regex.exec(content)) !== null) {
            const href = match[1];
            if (href.startsWith('/') || href.startsWith('#') || href.includes('localhost')) {
                count++;
            }
        }
        
        return count;
    }

    countExternalLinks(content) {
        const regex = /<a[^>]*href=['"]([^'"]*?)['"][^>]*>/gi;
        let count = 0;
        let match;
        
        while ((match = regex.exec(content)) !== null) {
            const href = match[1];
            if (href.startsWith('http') && !href.includes('localhost')) {
                count++;
            }
        }
        
        return count;
    }

    checkImageAltTags(content) {
        const totalImages = (content.match(/<img[^>]*>/gi) || []).length;
        const imagesWithAlt = (content.match(/<img[^>]*alt\s*=\s*['"][^'">]*['"][^>]*>/gi) || []).length;
        
        return {
            total: totalImages,
            withAlt: imagesWithAlt,
            coverage: totalImages > 0 ? Math.round((imagesWithAlt / totalImages) * 100) : 100
        };
    }

    checkHeadingHierarchy(content) {
        const h1Count = (content.match(/<h1[^>]*>/gi) || []).length;
        return h1Count === 1; // Should have exactly one H1
    }

    checkFormLabels(content) {
        const forms = (content.match(/<form[^>]*>/gi) || []).length;
        const labels = (content.match(/<label[^>]*>/gi) || []).length;
        return { forms, labels, hasLabels: labels > 0 };
    }

    assessContentQuality(content, pageInfo) {
        const wordCount = content.replace(/<[^>]*>/g, ' ').split(/\s+/).filter(w => w.length > 0).length;
        const hasImages = content.includes('<img');
        const hasStructure = content.includes('<h2') || content.includes('<h3');
        
        let score = 0;
        if (wordCount > 200) score += 25;
        if (wordCount > 500) score += 25;
        if (hasImages) score += 25;
        if (hasStructure) score += 25;
        
        return { score, wordCount, hasImages, hasStructure };
    }
}

// Run the final validation if called directly
if (require.main === module) {
    const validator = new FinalValidator();
    validator.runFinalValidation().catch(console.error);
}

module.exports = FinalValidator;