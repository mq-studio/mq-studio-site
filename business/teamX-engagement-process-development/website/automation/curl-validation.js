const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const util = require('util');

const execAsync = util.promisify(exec);

// Test configuration
const BASE_URL = 'http://localhost:3000';
const RESULTS_DIR = './screenshots/validation-results';

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
    '/contact',
    '/api/health'
];

class TeamXCurlValidator {
    constructor() {
        this.results = {
            navigation: [],
            performance: [],
            seo: [],
            security: [],
            issues: [],
            timestamp: new Date().toISOString()
        };

        // Ensure results directory exists
        if (!fs.existsSync(RESULTS_DIR)) {
            fs.mkdirSync(RESULTS_DIR, { recursive: true });
        }
    }

    async runAllTests() {
        console.log('🚀 Starting comprehensive TeamX website validation with curl...');
        
        for (const pagePath of PAGES) {
            await this.testPage(pagePath);
        }

        await this.generateReport();
        console.log('\n✅ Curl-based validation completed!');
        return this.results;
    }

    async testPage(pagePath) {
        console.log(`📄 Testing page: ${pagePath}`);
        
        const startTime = Date.now();
        
        try {
            // Test page accessibility and performance
            const curlCommand = `curl -w "@/dev/stdin" -o /dev/null -s "${BASE_URL}${pagePath}" <<< 'time_namelookup:      %{time_namelookup}s
time_connect:         %{time_connect}s
time_appconnect:      %{time_appconnect}s
time_pretransfer:     %{time_pretransfer}s
time_redirect:        %{time_redirect}s
time_starttransfer:   %{time_starttransfer}s
time_total:           %{time_total}s
speed_download:       %{speed_download} bytes/sec
speed_upload:         %{speed_upload} bytes/sec
http_code:            %{http_code}
response_code:        %{response_code}
content_type:         %{content_type}
size_download:        %{size_download} bytes'`;

            const { stdout: performanceData, stderr } = await execAsync(curlCommand);
            
            if (stderr) {
                console.warn(`Warning for ${pagePath}: ${stderr}`);
            }

            const perfMetrics = this.parsePerformanceData(performanceData);
            const loadTime = Date.now() - startTime;

            // Record navigation result
            this.results.navigation.push({
                page: pagePath,
                status: perfMetrics.http_code,
                loadTime,
                success: perfMetrics.http_code === 200,
                contentType: perfMetrics.content_type,
                size: perfMetrics.size_download
            });

            // Record performance
            this.results.performance.push({
                page: pagePath,
                ...perfMetrics,
                totalTime: loadTime
            });

            // Fetch actual content for content analysis
            if (perfMetrics.http_code === 200) {
                await this.analyzePageContent(pagePath);
            }

        } catch (error) {
            console.error(`Error testing ${pagePath}:`, error.message);
            this.results.issues.push({
                type: 'Page Test Error',
                page: pagePath,
                issue: error.message
            });
        }
    }

    parsePerformanceData(data) {
        const metrics = {};
        const lines = data.split('\n');
        
        lines.forEach(line => {
            const [key, value] = line.split(/:\s+/);
            if (key && value) {
                const cleanKey = key.trim().replace('time_', '');
                let cleanValue = value.trim();
                
                if (cleanValue.endsWith('s')) {
                    cleanValue = parseFloat(cleanValue);
                } else if (cleanValue.includes('bytes')) {
                    cleanValue = parseInt(cleanValue);
                }
                
                metrics[cleanKey] = cleanValue;
            }
        });
        
        return metrics;
    }

    async analyzePageContent(pagePath) {
        try {
            // Fetch page content
            const { stdout: content } = await execAsync(`curl -s "${BASE_URL}${pagePath}"`);
            
            // Basic SEO analysis
            const seoAnalysis = {
                page: pagePath,
                hasTitle: content.includes('<title>') && !content.includes('<title></title>'),
                hasMetaDescription: content.includes('<meta name="description"'),
                hasOpenGraph: content.includes('og:title') || content.includes('og:description'),
                hasViewport: content.includes('name="viewport"'),
                hasCanonical: content.includes('rel="canonical"'),
                titleLength: this.extractTitle(content)?.length || 0,
                hasStructuredData: content.includes('application/ld+json'),
                imageCount: (content.match(/<img/g) || []).length,
                linkCount: (content.match(/<a\s+href/g) || []).length,
                hasH1: content.includes('<h1'),
                contentLength: content.length
            };

            this.results.seo.push(seoAnalysis);

            // Basic security analysis
            const securityAnalysis = {
                page: pagePath,
                hasCSP: content.includes('Content-Security-Policy'),
                hasHSTS: false, // Would need to check headers
                hasXFrameOptions: false, // Would need to check headers
                hasNoSniff: false, // Would need to check headers
                hasInlineScripts: content.includes('<script>'),
                hasInlineStyles: content.includes('<style>'),
                formCount: (content.match(/<form/g) || []).length,
                inputCount: (content.match(/<input/g) || []).length
            };

            this.results.security.push(securityAnalysis);

            // Content quality checks
            this.analyzeContentQuality(pagePath, content);

        } catch (error) {
            this.results.issues.push({
                type: 'Content Analysis Error',
                page: pagePath,
                issue: error.message
            });
        }
    }

    extractTitle(content) {
        const titleMatch = content.match(/<title>(.*?)<\/title>/);
        return titleMatch ? titleMatch[1].trim() : null;
    }

    analyzeContentQuality(pagePath, content) {
        const issues = [];

        // Check for healthcare-specific content
        const healthcareTerms = [
            'healthcare', 'health care', 'naturopathic', 'wellness', 
            'medical', 'clinic', 'patient', 'treatment', 'therapy'
        ];
        
        const hasHealthcareContent = healthcareTerms.some(term => 
            content.toLowerCase().includes(term.toLowerCase())
        );

        if (!hasHealthcareContent && pagePath !== '/api/health') {
            issues.push({
                type: 'Content Quality',
                page: pagePath,
                issue: 'No healthcare-related terminology found'
            });
        }

        // Check for ROI-related content
        if (pagePath === '/' || pagePath === '/services') {
            const roiTerms = ['roi', 'return on investment', '250%', 'efficiency', 'cost savings'];
            const hasROIContent = roiTerms.some(term => 
                content.toLowerCase().includes(term.toLowerCase())
            );

            if (!hasROIContent) {
                issues.push({
                    type: 'Content Quality',
                    page: pagePath,
                    issue: 'No ROI-related content found where expected'
                });
            }
        }

        // Check for proper Canadian context
        const canadianTerms = ['canada', 'canadian', 'ontario', 'toronto'];
        const hasCanadianContext = canadianTerms.some(term => 
            content.toLowerCase().includes(term.toLowerCase())
        );

        // This is optional for most pages
        if (pagePath === '/about' || pagePath === '/contact') {
            if (!hasCanadianContext) {
                issues.push({
                    type: 'Content Quality',
                    page: pagePath,
                    issue: 'No Canadian geographic context found'
                });
            }
        }

        // Add issues to results
        this.results.issues.push(...issues);
    }

    async testSecurityHeaders() {
        console.log('🔒 Testing security headers...');
        
        try {
            for (const pagePath of PAGES.slice(0, 3)) { // Test first 3 pages
                const command = `curl -I -s "${BASE_URL}${pagePath}"`;
                const { stdout: headers } = await execAsync(command);
                
                const securityHeaders = {
                    page: pagePath,
                    headers: headers,
                    hasCSP: headers.includes('Content-Security-Policy'),
                    hasHSTS: headers.includes('Strict-Transport-Security'),
                    hasXFrameOptions: headers.includes('X-Frame-Options'),
                    hasXContentType: headers.includes('X-Content-Type-Options'),
                    hasReferrerPolicy: headers.includes('Referrer-Policy'),
                    serverInfo: this.extractServerInfo(headers)
                };

                this.results.security.push(securityHeaders);
            }
        } catch (error) {
            this.results.issues.push({
                type: 'Security Headers Test Error',
                issue: error.message
            });
        }
    }

    extractServerInfo(headers) {
        const serverMatch = headers.match(/Server: (.+)/);
        const poweredByMatch = headers.match(/X-Powered-By: (.+)/);
        
        return {
            server: serverMatch ? serverMatch[1].trim() : 'Not disclosed',
            poweredBy: poweredByMatch ? poweredByMatch[1].trim() : 'Not disclosed'
        };
    }

    async generateReport() {
        await this.testSecurityHeaders();

        const summary = {
            totalPages: PAGES.length,
            successfulPages: this.results.navigation.filter(n => n.success).length,
            failedPages: this.results.navigation.filter(n => !n.success).length,
            totalIssues: this.results.issues.length,
            averageLoadTime: this.results.navigation.reduce((acc, n) => acc + n.loadTime, 0) / this.results.navigation.length,
            totalContentSize: this.results.navigation.reduce((acc, n) => acc + (n.size || 0), 0)
        };

        const reportData = {
            timestamp: this.results.timestamp,
            summary,
            results: this.results,
            recommendations: this.generateRecommendations()
        };

        // Save detailed results as JSON
        const resultsPath = path.join(RESULTS_DIR, 'curl-validation-results.json');
        fs.writeFileSync(resultsPath, JSON.stringify(reportData, null, 2));

        console.log(`\n📊 Curl validation results saved to: ${resultsPath}`);
        console.log(`📈 Summary: ${summary.successfulPages}/${summary.totalPages} pages successful`);
        console.log(`⚠️ Issues found: ${summary.totalIssues}`);
        console.log(`⏱️ Average load time: ${Math.round(summary.averageLoadTime)}ms`);
        
        return reportData;
    }

    generateRecommendations() {
        const recommendations = [];
        
        // Performance recommendations
        const slowPages = this.results.navigation.filter(n => n.loadTime > 2000);
        if (slowPages.length > 0) {
            recommendations.push({
                category: 'Performance',
                priority: 'High',
                issue: `${slowPages.length} pages load slowly (>2s)`,
                recommendation: 'Optimize images, enable compression, use CDN'
            });
        }

        // SEO recommendations
        const pagesWithoutTitle = this.results.seo.filter(s => !s.hasTitle);
        if (pagesWithoutTitle.length > 0) {
            recommendations.push({
                category: 'SEO',
                priority: 'High',
                issue: `${pagesWithoutTitle.length} pages missing titles`,
                recommendation: 'Add unique, descriptive titles to all pages'
            });
        }

        const pagesWithoutMeta = this.results.seo.filter(s => !s.hasMetaDescription);
        if (pagesWithoutMeta.length > 0) {
            recommendations.push({
                category: 'SEO',
                priority: 'Medium',
                issue: `${pagesWithoutMeta.length} pages missing meta descriptions`,
                recommendation: 'Add compelling meta descriptions for better search results'
            });
        }

        // Security recommendations
        const pagesWithoutCSP = this.results.security.filter(s => !s.hasCSP);
        if (pagesWithoutCSP.length > 0) {
            recommendations.push({
                category: 'Security',
                priority: 'Medium',
                issue: 'Missing Content Security Policy headers',
                recommendation: 'Implement CSP headers to prevent XSS attacks'
            });
        }

        return recommendations;
    }
}

// Run the validation if called directly
if (require.main === module) {
    const validator = new TeamXCurlValidator();
    validator.runAllTests().catch(console.error);
}

module.exports = TeamXCurlValidator;