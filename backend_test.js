const axios = require('axios');

class FBASenseAPITester {
    constructor(baseUrl = "https://fbasense.preview.emergentagent.com") {
        this.baseUrl = baseUrl;
        this.testsRun = 0;
        this.testsPassed = 0;
        this.results = [];
    }

    async runTest(name, method, endpoint, expectedStatus, data = null) {
        const url = `${this.baseUrl}${endpoint}`;
        const headers = { 'Content-Type': 'application/json' };

        this.testsRun++;
        console.log(`\n🔍 Testing ${name}...`);
        
        try {
            let response;
            if (method === 'GET') {
                response = await axios.get(url, { headers });
            } else if (method === 'POST') {
                response = await axios.post(url, data, { headers });
            }

            const success = response.status === expectedStatus;
            if (success) {
                this.testsPassed++;
                console.log(`✅ Passed - Status: ${response.status}`);
                this.results.push({ test: name, status: 'PASS', details: `Status: ${response.status}` });
                return { success: true, data: response.data };
            } else {
                console.log(`❌ Failed - Expected ${expectedStatus}, got ${response.status}`);
                this.results.push({ test: name, status: 'FAIL', details: `Expected ${expectedStatus}, got ${response.status}` });
                return { success: false, data: null };
            }

        } catch (error) {
            console.log(`❌ Failed - Error: ${error.message}`);
            this.results.push({ test: name, status: 'FAIL', details: error.message });
            return { success: false, data: null };
        }
    }

    async testHealthCheck() {
        const result = await this.runTest(
            "Health Check",
            "GET",
            "/api/health",
            200
        );
        
        if (result.success) {
            console.log(`📊 Demo Mode: ${result.data.demo_mode}`);
            console.log(`📝 Message: ${result.data.message}`);
        }
        
        return result.success;
    }

    async testDemoStatus() {
        return await this.runTest(
            "Demo Status",
            "GET",
            "/api/demo-status",
            200
        );
    }

    async testAuthEndpoints() {
        console.log('\n📋 Testing Authentication Endpoints...');
        
        // Test signup
        const signupResult = await this.runTest(
            "Auth Signup",
            "POST",
            "/api/auth/signup",
            200,
            { email: "test@example.com", password: "testpass123" }
        );

        // Test login
        const loginResult = await this.runTest(
            "Auth Login",
            "POST",
            "/api/auth/login",
            200,
            { email: "test@example.com", password: "testpass123" }
        );

        // Test logout
        const logoutResult = await this.runTest(
            "Auth Logout",
            "POST",
            "/api/auth/logout",
            200
        );

        return signupResult.success && loginResult.success && logoutResult.success;
    }

    async testInventoryEndpoints() {
        console.log('\n📦 Testing Inventory Endpoints...');
        
        // Test get inventory
        const getResult = await this.runTest(
            "Get Inventory",
            "GET",
            "/api/inventory",
            200
        );

        // Test create inventory (should fail in demo mode)
        const createResult = await this.runTest(
            "Create Inventory Item",
            "POST",
            "/api/inventory",
            403,
            {
                sku: "TEST-001",
                product_name: "Test Product",
                quantity: 100,
                cost: 10.00,
                price: 20.00
            }
        );

        return getResult.success && createResult.success;
    }

    async testSalesEndpoints() {
        console.log('\n💰 Testing Sales Endpoints...');
        
        // Test get sales
        const getResult = await this.runTest(
            "Get Sales",
            "GET",
            "/api/sales",
            200
        );

        // Test create sales (should fail in demo mode)
        const createResult = await this.runTest(
            "Create Sales Record",
            "POST",
            "/api/sales",
            403,
            {
                sku: "TEST-001",
                product_name: "Test Product",
                date: "2025-01-15",
                quantity_sold: 5,
                revenue: 100.00
            }
        );

        return getResult.success && createResult.success;
    }

    async testUploadEndpoints() {
        console.log('\n📤 Testing Upload Endpoints...');
        
        // Test get uploads
        const getResult = await this.runTest(
            "Get Upload History",
            "GET",
            "/api/uploads",
            200
        );

        return getResult.success;
    }

    async testSettingsEndpoints() {
        console.log('\n⚙️ Testing Settings Endpoints...');
        
        // Test get settings
        const getResult = await this.runTest(
            "Get Settings",
            "GET",
            "/api/settings",
            200
        );

        // Test update settings (should fail in demo mode)
        const updateResult = await this.runTest(
            "Update Settings",
            "POST",
            "/api/settings",
            403,
            {
                low_stock_threshold: 15,
                currency: "EUR"
            }
        );

        return getResult.success && updateResult.success;
    }

    async runAllTests() {
        console.log('🚀 Starting FBASense API Tests...\n');
        console.log(`🌐 Testing against: ${this.baseUrl}`);

        // Run all test suites
        const healthOk = await this.testHealthCheck();
        const demoOk = await this.testDemoStatus();
        const authOk = await this.testAuthEndpoints();
        const inventoryOk = await this.testInventoryEndpoints();
        const salesOk = await this.testSalesEndpoints();
        const uploadsOk = await this.testUploadEndpoints();
        const settingsOk = await this.testSettingsEndpoints();

        // Print summary
        console.log('\n📊 Test Summary:');
        console.log(`Tests passed: ${this.testsPassed}/${this.testsRun}`);
        console.log(`Success rate: ${((this.testsPassed / this.testsRun) * 100).toFixed(1)}%`);

        // Print detailed results
        console.log('\n📋 Detailed Results:');
        this.results.forEach(result => {
            const icon = result.status === 'PASS' ? '✅' : '❌';
            console.log(`${icon} ${result.test}: ${result.details}`);
        });

        const allPassed = healthOk && demoOk && authOk && inventoryOk && salesOk && uploadsOk && settingsOk;
        
        if (allPassed) {
            console.log('\n🎉 All API tests passed! Backend is working correctly in demo mode.');
        } else {
            console.log('\n⚠️ Some tests failed. Check the details above.');
        }

        return {
            success: allPassed,
            totalTests: this.testsRun,
            passedTests: this.testsPassed,
            results: this.results
        };
    }
}

// Run tests if this file is executed directly
if (require.main === module) {
    const tester = new FBASenseAPITester();
    tester.runAllTests().then(result => {
        process.exit(result.success ? 0 : 1);
    }).catch(error => {
        console.error('Test execution failed:', error);
        process.exit(1);
    });
}

module.exports = FBASenseAPITester;