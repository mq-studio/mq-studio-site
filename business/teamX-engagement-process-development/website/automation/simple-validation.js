const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const util = require('util');
const http = require('http');
const https = require('https');
const url = require('url');

const execAsync = util.promisify(exec);

// Test configuration
const BASE_URL = 'http://localhost:3000';
const RESULTS_DIR = './screenshots/validation-results';

// All pages to test
const PAGES = [
    { path: '/', name: 'Home Page', critical: true },
    { path: '/about', name: 'About Page', critical: true },
    { path: '/services', name: 'Services Page', critical: true },
    { path: '/process', name: 'Process Page', critical: false },
    { path: '/case-studies', name: 'Case Studies Page', critical: false },
    { path: '/team', name: 'Team Page', critical: false },
    { path: '/frameworks', name: 'Frameworks Page', critical: false },
    { path: '/resources', name: 'Resources Page', critical: false },
    { path: '/investors', name: 'Investors Page', critical: false },
    { path: '/contact', name: 'Contact Page', critical: true },
    { path: '/api/health', name: 'Health API', critical: true }
];

class SimpleTeamXValidator {
    constructor() {
        this.results = {
            navigation: [],
            performance: [],
            seo: [],
            security: [],
            content: [],
            issues: [],
            timestamp: new Date().toISOString(),
            summary: {}
        };

        // Ensure results directory exists
        if (!fs.existsSync(RESULTS_DIR)) {
            fs.mkdirSync(RESULTS_DIR, { recursive: true });
        }
    }

    async runAllTests() {
        console.log('🚀 Starting comprehensive TeamX website validation...');
        console.log(`📊 Testing ${PAGES.length} pages at ${BASE_URL}`);
        
        for (const page of PAGES) {
            await this.testPage(page);
        }

        await this.runAdditionalTests();
        await this.generateReport();
        
        console.log('\n✅ Simple validation completed!');
        return this.results;
    }

    async testPage(pageInfo) {
        console.log(`📄 Testing ${pageInfo.name} (${pageInfo.path})...`);
        
        const startTime = Date.now();
        
        try {
            // Simple HTTP test
            const response = await this.makeHttpRequest(pageInfo.path);
            const loadTime = Date.now() - startTime;
            
            // Record navigation result
            const navigationResult = {
                page: pageInfo.path,
                name: pageInfo.name,
                critical: pageInfo.critical,
                status: response.statusCode,
                loadTime,
                success: response.statusCode >= 200 && response.statusCode < 300,
                contentType: response.headers['content-type'] || 'unknown',
                contentLength: response.headers['content-length'] || response.body?.length || 0,
                serverHeader: response.headers['server'] || 'Not disclosed'
            };
            
            this.results.navigation.push(navigationResult);

            if (!navigationResult.success) {
                this.results.issues.push({
                    type: 'Navigation Error',
                    severity: pageInfo.critical ? 'High' : 'Medium',
                    page: pageInfo.path,
                    issue: `HTTP ${response.statusCode}: ${response.statusMessage || 'Request failed'}`
                });
                return;
            }

            // Analyze content if successful
            if (response.body && response.headers['content-type']?.includes('text/html')) {
                await this.analyzePageContent(pageInfo, response.body);
                await this.analyzePageSEO(pageInfo, response.body);
                await this.analyzePagePerformance(pageInfo, response);
            }

        } catch (error) {
            console.error(`❌ Error testing ${pageInfo.name}:`, error.message);
            this.results.issues.push({
                type: 'Test Error',
                severity: pageInfo.critical ? 'High' : 'Medium',
                page: pageInfo.path,
                issue: error.message
            });
        }
    }

    makeHttpRequest(pagePath) {
        return new Promise((resolve, reject) => {
            const fullUrl = `${BASE_URL}${pagePath}`;
            const urlObj = new URL(fullUrl);
            const client = urlObj.protocol === 'https:' ? https : http;

            const req = client.get(fullUrl, (res) => {
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

    async analyzePageContent(pageInfo, content) {
        try {
            const contentAnalysis = {
                page: pageInfo.path,
                name: pageInfo.name,
                contentLength: content.length,
                wordCount: this.countWords(content),
                hasHealthcareTerms: this.checkHealthcareTerms(content),
                hasCanadianContext: this.checkCanadianContext(content),
                hasROIContent: this.checkROIContent(content),
                hasCallToAction: this.checkCallToAction(content),
                imageCount: (content.match(/<img/gi) || []).length,
                linkCount: (content.match(/<a\s+href/gi) || []).length,
                formCount: (content.match(/<form/gi) || []).length,
                buttonCount: (content.match(/<button/gi) || []).length + (content.match(/role="button"/gi) || []).length,
                headingStructure: this.analyzeHeadings(content),
                accessibility: this.checkBasicAccessibility(content)
            };

            this.results.content.push(contentAnalysis);

            // Check for content quality issues
            if (pageInfo.critical && !contentAnalysis.hasCallToAction) {
                this.results.issues.push({
                    type: 'Content Quality',
                    severity: 'Medium',
                    page: pageInfo.path,
                    issue: 'Critical page missing clear call-to-action elements'
                });
            }

            if (pageInfo.path === '/' || pageInfo.path === '/services') {
                if (!contentAnalysis.hasROIContent) {
                    this.results.issues.push({
                        type: 'Content Quality',
                        severity: 'Medium',
                        page: pageInfo.path,
                        issue: 'Missing ROI or value proposition content'
                    });
                }
            }

        } catch (error) {
            this.results.issues.push({
                type: 'Content Analysis Error',
                severity: 'Low',
                page: pageInfo.path,
                issue: error.message
            });
        }
    }

    async analyzePageSEO(pageInfo, content) {
        try {
            const title = this.extractTag(content, 'title');
            const metaDescription = this.extractMetaContent(content, 'description');
            const metaKeywords = this.extractMetaContent(content, 'keywords');
            
            const seoAnalysis = {
                page: pageInfo.path,
                name: pageInfo.name,
                title: title,
                titleLength: title ? title.length : 0,
                hasTitle: !!title && title.length > 0,
                metaDescription: metaDescription,
                metaDescriptionLength: metaDescription ? metaDescription.length : 0,
                hasMetaDescription: !!metaDescription,
                hasMetaKeywords: !!metaKeywords,
                hasViewportMeta: content.includes('name="viewport"'),
                hasCanonical: content.includes('rel="canonical"'),
                hasOpenGraph: this.checkOpenGraph(content),
                hasStructuredData: content.includes('application/ld+json'),
                h1Count: (content.match(/<h1[^>]*>/gi) || []).length,
                h1Content: this.extractTag(content, 'h1'),
                internalLinks: this.countInternalLinks(content),
                externalLinks: this.countExternalLinks(content),
                altTagsPresent: this.checkAltTags(content),
                robotsDirective: this.extractMetaContent(content, 'robots')
            };

            this.results.seo.push(seoAnalysis);

            // SEO Issues
            if (!seoAnalysis.hasTitle) {
                this.results.issues.push({
                    type: 'SEO Error',
                    severity: 'High',
                    page: pageInfo.path,
                    issue: 'Missing page title'
                });
            }

            if (seoAnalysis.titleLength > 60) {
                this.results.issues.push({
                    type: 'SEO Warning',
                    severity: 'Medium',
                    page: pageInfo.path,
                    issue: `Title too long (${seoAnalysis.titleLength} chars, recommended <60)`
                });
            }

            if (!seoAnalysis.hasMetaDescription && pageInfo.critical) {
                this.results.issues.push({
                    type: 'SEO Warning',
                    severity: 'Medium',
                    page: pageInfo.path,
                    issue: 'Missing meta description for critical page'
                });
            }

            if (seoAnalysis.h1Count !== 1) {
                this.results.issues.push({
                    type: 'SEO Warning',
                    severity: 'Medium',
                    page: pageInfo.path,
                    issue: `Should have exactly one H1 tag (found ${seoAnalysis.h1Count})`
                });
            }

        } catch (error) {
            this.results.issues.push({
                type: 'SEO Analysis Error',
                severity: 'Low',
                page: pageInfo.path,
                issue: error.message
            });
        }
    }

    async analyzePagePerformance(pageInfo, response) {
        const performanceAnalysis = {
            page: pageInfo.path,
            name: pageInfo.name,
            contentSize: response.body ? response.body.length : 0,
            hasGzip: response.headers['content-encoding']?.includes('gzip') || false,
            hasBr: response.headers['content-encoding']?.includes('br') || false,
            cacheControl: response.headers['cache-control'] || 'Not set',
            etag: response.headers['etag'] || 'Not set',
            lastModified: response.headers['last-modified'] || 'Not set',
            contentType: response.headers['content-type'] || 'Not set'
        };

        this.results.performance.push(performanceAnalysis);

        // Performance issues
        if (performanceAnalysis.contentSize > 1000000) { // >1MB
            this.results.issues.push({
                type: 'Performance Warning',
                severity: 'Medium',
                page: pageInfo.path,
                issue: `Large page size: ${Math.round(performanceAnalysis.contentSize / 1024)}KB`
            });
        }

        if (!performanceAnalysis.hasGzip && !performanceAnalysis.hasBr) {
            this.results.issues.push({
                type: 'Performance Warning',
                severity: 'Low',
                page: pageInfo.path,
                issue: 'Content not compressed (missing gzip/brotli)'
            });
        }
    }

    // Helper methods
    countWords(content) {
        // Remove HTML tags and count words
        const textContent = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
        return textContent.split(' ').filter(word => word.length > 0).length;
    }

    checkHealthcareTerms(content) {
        const healthcareTerms = [
            'healthcare', 'health care', 'naturopathic', 'wellness', 'medical',
            'clinic', 'patient', 'treatment', 'therapy', 'holistic', 'physician',
            'diagnosis', 'healing', 'integrative', 'functional medicine'
        ];
        
        const lowerContent = content.toLowerCase();
        return healthcareTerms.some(term => lowerContent.includes(term));
    }

    checkCanadianContext(content) {
        const canadianTerms = ['canada', 'canadian', 'ontario', 'toronto', 'vancouver', 'montreal'];
        const lowerContent = content.toLowerCase();
        return canadianTerms.some(term => lowerContent.includes(term));
    }

    checkROIContent(content) {
        const roiTerms = [
            'roi', 'return on investment', '250%', 'efficiency', 'cost savings',
            'value', 'benefit', 'investment', 'profit', 'revenue', 'growth'
        ];
        
        const lowerContent = content.toLowerCase();
        return roiTerms.some(term => lowerContent.includes(term));
    }

    checkCallToAction(content) {
        const ctaTerms = [
            'contact us', 'get started', 'learn more', 'book', 'schedule',
            'call now', 'click here', 'sign up', 'register', 'download'
        ];
        
        const lowerContent = content.toLowerCase();
        return ctaTerms.some(term => lowerContent.includes(term)) || 
               content.includes('btn') || content.includes('cta');
    }

    analyzeHeadings(content) {
        const headings = {};
        for (let i = 1; i <= 6; i++) {
            const regex = new RegExp(`<h${i}[^>]*>(.*?)</h${i}>`, 'gi');
            const matches = content.match(regex) || [];
            headings[`h${i}`] = matches.length;
        }
        return headings;
    }

    checkBasicAccessibility(content) {
        const imagesWithoutAlt = (content.match(/<img(?![^>]*alt\s*=)[^>]*>/gi) || []).length;
        const totalImages = (content.match(/<img/gi) || []).length;
        
        return {
            imagesWithAlt: totalImages - imagesWithoutAlt,
            imagesWithoutAlt: imagesWithoutAlt,
            totalImages: totalImages,
            hasSkipLinks: content.includes('skip'),
            ariaLabels: (content.match(/aria-label/gi) || []).length,
            ariaDescribedBy: (content.match(/aria-describedby/gi) || []).length
        };
    }

    extractTag(content, tagName) {
        const regex = new RegExp(`<${tagName}[^>]*>(.*?)</${tagName}>`, 'is');
        const match = content.match(regex);
        return match ? match[1].trim().replace(/<[^>]*>/g, '') : null;
    }

    extractMetaContent(content, name) {
        const regex = new RegExp(`<meta[^>]*name=['"]${name}['"][^>]*content=['"]([^'"]*?)['"]`, 'i');
        const match = content.match(regex);
        return match ? match[1] : null;
    }

    checkOpenGraph(content) {
        return {
            hasOgTitle: content.includes('og:title'),
            hasOgDescription: content.includes('og:description'),
            hasOgImage: content.includes('og:image'),
            hasOgUrl: content.includes('og:url'),
            hasOgType: content.includes('og:type')
        };
    }

    countInternalLinks(content) {
        const linkRegex = /<a\s+href=['"]([^'"]*?)['"][^>]*>/gi;
        let match;
        let internalCount = 0;
        
        while ((match = linkRegex.exec(content)) !== null) {
            const href = match[1];
            if (href.startsWith('/') || href.startsWith('#') || href.includes('localhost:3000')) {
                internalCount++;
            }
        }
        
        return internalCount;
    }

    countExternalLinks(content) {
        const linkRegex = /<a\s+href=['"]([^'"]*?)['"][^>]*>/gi;
        let match;
        let externalCount = 0;
        
        while ((match = linkRegex.exec(content)) !== null) {
            const href = match[1];
            if (href.startsWith('http') && !href.includes('localhost:3000')) {
                externalCount++;
            }
        }
        
        return externalCount;
    }

    checkAltTags(content) {
        const totalImages = (content.match(/<img/gi) || []).length;
        const imagesWithAlt = (content.match(/<img[^>]*alt\s*=\s*['"][^'">]*['"][^>]*>/gi) || []).length;
        
        return {
            total: totalImages,
            withAlt: imagesWithAlt,
            percentage: totalImages > 0 ? Math.round((imagesWithAlt / totalImages) * 100) : 100
        };
    }

    async runAdditionalTests() {
        console.log('🔒 Running additional tests...');

        // Test robots.txt
        try {
            const robotsResponse = await this.makeHttpRequest('/robots.txt');
            this.results.seo.push({
                page: '/robots.txt',
                name: 'Robots.txt',
                exists: robotsResponse.statusCode === 200,
                content: robotsResponse.statusCode === 200 ? robotsResponse.body.slice(0, 500) : null
            });
        } catch (error) {
            this.results.issues.push({
                type: 'SEO Warning',
                severity: 'Low',
                page: '/robots.txt',
                issue: 'robots.txt not accessible'
            });
        }

        // Test sitemap.xml
        try {
            const sitemapResponse = await this.makeHttpRequest('/sitemap.xml');
            this.results.seo.push({
                page: '/sitemap.xml',
                name: 'Sitemap.xml',
                exists: sitemapResponse.statusCode === 200,
                urlCount: sitemapResponse.statusCode === 200 ? 
                    (sitemapResponse.body.match(/<url>/g) || []).length : 0
            });
        } catch (error) {
            this.results.issues.push({
                type: 'SEO Warning',
                severity: 'Medium',
                page: '/sitemap.xml',
                issue: 'sitemap.xml not accessible'
            });
        }
    }

    async generateReport() {
        // Calculate summary statistics
        const navigation = this.results.navigation;
        const issues = this.results.issues;
        
        this.results.summary = {
            totalPages: PAGES.length,
            successfulPages: navigation.filter(n => n.success).length,
            failedPages: navigation.filter(n => !n.success).length,
            criticalPagesFailed: navigation.filter(n => !n.success && n.critical).length,
            totalIssues: issues.length,
            highSeverityIssues: issues.filter(i => i.severity === 'High').length,
            mediumSeverityIssues: issues.filter(i => i.severity === 'Medium').length,
            lowSeverityIssues: issues.filter(i => i.severity === 'Low').length,
            averageLoadTime: navigation.length > 0 ? 
                Math.round(navigation.reduce((acc, n) => acc + (n.loadTime || 0), 0) / navigation.length) : 0,
            totalContentSize: navigation.reduce((acc, n) => acc + (parseInt(n.contentLength) || 0), 0),
            pagesWithSEOIssues: [...new Set(issues.filter(i => i.type.includes('SEO')).map(i => i.page))].length,
            overallHealthScore: this.calculateHealthScore()
        };

        const reportData = {
            timestamp: this.results.timestamp,
            summary: this.results.summary,
            navigation: this.results.navigation,
            content: this.results.content,
            seo: this.results.seo,
            performance: this.results.performance,
            issues: this.results.issues,
            recommendations: this.generateRecommendations()
        };

        // Save detailed results as JSON
        const resultsPath = path.join(RESULTS_DIR, 'simple-validation-results.json');
        fs.writeFileSync(resultsPath, JSON.stringify(reportData, null, 2));

        this.printSummary();
        console.log(`\n📊 Full validation results saved to: ${resultsPath}`);
        
        return reportData;
    }

    calculateHealthScore() {
        const { navigation, issues } = this.results;
        let score = 100;

        // Deduct points for failed pages
        const failedCritical = navigation.filter(n => !n.success && n.critical).length;
        const failedNonCritical = navigation.filter(n => !n.success && !n.critical).length;
        
        score -= (failedCritical * 20); // -20 per failed critical page
        score -= (failedNonCritical * 10); // -10 per failed non-critical page

        // Deduct points for issues
        const highIssues = issues.filter(i => i.severity === 'High').length;
        const mediumIssues = issues.filter(i => i.severity === 'Medium').length;
        const lowIssues = issues.filter(i => i.severity === 'Low').length;

        score -= (highIssues * 10);
        score -= (mediumIssues * 5);
        score -= (lowIssues * 2);

        return Math.max(0, score);
    }

    generateRecommendations() {
        const recommendations = [];
        const { summary, issues } = this.results;

        // Critical recommendations
        if (summary.criticalPagesFailed > 0) {
            recommendations.push({
                category: 'Critical',
                priority: 'High',
                issue: `${summary.criticalPagesFailed} critical pages are not accessible`,
                recommendation: 'Fix server errors and ensure all critical pages load properly',
                pages: this.results.navigation.filter(n => !n.success && n.critical).map(n => n.page)
            });
        }

        // SEO recommendations
        const seoIssues = issues.filter(i => i.type.includes('SEO'));
        if (seoIssues.length > 0) {
            const topSEOIssues = [...new Set(seoIssues.map(i => i.issue))].slice(0, 3);
            recommendations.push({
                category: 'SEO',
                priority: 'High',
                issue: `${seoIssues.length} SEO issues found`,
                recommendation: 'Address missing titles, meta descriptions, and heading structure',
                topIssues: topSEOIssues
            });
        }

        // Performance recommendations
        const perfIssues = issues.filter(i => i.type.includes('Performance'));
        if (perfIssues.length > 0) {
            recommendations.push({
                category: 'Performance',
                priority: 'Medium',
                issue: `${perfIssues.length} performance issues found`,
                recommendation: 'Optimize large pages, enable compression, and implement caching',
                averageLoadTime: summary.averageLoadTime
            });
        }

        // Content recommendations
        const contentIssues = issues.filter(i => i.type.includes('Content'));
        if (contentIssues.length > 0) {
            recommendations.push({
                category: 'Content',
                priority: 'Medium',
                issue: `${contentIssues.length} content quality issues found`,
                recommendation: 'Add clear call-to-actions and ensure healthcare terminology is present'
            });
        }

        return recommendations;
    }

    printSummary() {
        const { summary } = this.results;
        
        console.log('\n' + '='.repeat(60));
        console.log('📊 TEAMX WEBSITE VALIDATION SUMMARY');
        console.log('='.repeat(60));
        console.log(`🌐 Total Pages Tested: ${summary.totalPages}`);
        console.log(`✅ Successful Pages: ${summary.successfulPages}`);
        console.log(`❌ Failed Pages: ${summary.failedPages}`);
        console.log(`🔴 Critical Pages Failed: ${summary.criticalPagesFailed}`);
        console.log(`⚠️ Total Issues: ${summary.totalIssues} (High: ${summary.highSeverityIssues}, Medium: ${summary.mediumSeverityIssues}, Low: ${summary.lowSeverityIssues})`);
        console.log(`⏱️ Average Load Time: ${summary.averageLoadTime}ms`);
        console.log(`📦 Total Content Size: ${Math.round(summary.totalContentSize / 1024)}KB`);
        console.log(`🏥 Overall Health Score: ${summary.overallHealthScore}/100`);
        
        if (summary.overallHealthScore >= 90) {
            console.log('🟢 Status: Excellent - Website is performing very well');
        } else if (summary.overallHealthScore >= 75) {
            console.log('🟡 Status: Good - Minor improvements recommended');
        } else if (summary.overallHealthScore >= 60) {
            console.log('🟠 Status: Fair - Several issues need attention');
        } else {
            console.log('🔴 Status: Poor - Critical issues require immediate attention');
        }
        
        console.log('='.repeat(60));
    }
}

// Run the validation if called directly
if (require.main === module) {
    const validator = new SimpleTeamXValidator();
    validator.runAllTests().catch(console.error);
}

module.exports = SimpleTeamXValidator;