import { defineConfig, devices } from "@playwright/test"import { defineConfig, devices } from "@playwright/test"



export default defineConfig({export default defineConfig({

  testDir: "./tests/e2e",  testDir: "./tests/e2e",

  fullyParallel: true,  fullyParallel: true,

  forbidOnly: !!process.env.CI,  forbidOnly: !!process.env.CI,

  retries: process.env.CI ? 2 : 0,  retries: process.env.CI ? 2 : 0,

  workers: process.env.CI ? 1 : undefined,  workers: process.env.CI ? 1 : undefined,

  reporter: "html",  reporter: "html",

  use: {  use: {

    baseURL: "http://localhost:3000",    baseURL: "http://localhost:3000",

    trace: "on-first-retry",    trace: "on-first-retry",

  },  },



  projects: [  projects: [

    {    {

      name: "chromium",      name: "chromium",

      use: { ...devices["Desktop Chrome"] },      use: { ...devices["Desktop Chrome"] },

    },    },

  ],  ],



  webServer: {  webServer: {

    command: process.env.CI ? "pnpm start" : "pnpm dev",    command: process.env.CI ? "pnpm start" : "pnpm dev",

    url: "http://localhost:3000",    url: "http://localhost:3000",

    reuseExistingServer: !process.env.CI,    reuseExistingServer: !process.env.CI,

    timeout: 120000,    timeout: 120000,

  },  },

})})

