import { test, expect } from '@playwright/test';

// Test suite for LivePulse.AI Dashboard
test.describe('LivePulse.AI Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the dashboard
    await page.goto('http://localhost:3000');
    // Wait for the initial data to load
    await page.waitForSelector('text=直播运营控制中心');
  });

  test('should display dashboard header and stats', async ({ page }) => {
    // Check header
    await expect(page.locator('text=直播运营控制中心')).toBeVisible();
    
    // Check stats cards
    await expect(page.locator('text=总销售额')).toBeVisible();
    await expect(page.locator('text=总利润')).toBeVisible();
    await expect(page.locator('text=总观众数')).toBeVisible();
    await expect(page.locator('text=平均转化率')).toBeVisible();
  });

  test('should display live rooms section', async ({ page }) => {
    // Check live rooms section header
    await expect(page.locator('text=直播间状态')).toBeVisible();
    
    // Check if at least one live room card is present
    const liveRoomCards = await page.locator('.MuiCard-root').count();
    expect(liveRoomCards).toBeGreaterThan(0);
  });

  test('should display agent logs', async ({ page }) => {
    // Check agent logs section
    await expect(page.locator('text=AI Agent 行动日志')).toBeVisible();
    
    // Wait for logs to appear
    await page.waitForSelector('.MuiListItem-root');
    
    // Check if logs are being displayed
    const logItems = await page.locator('.MuiListItem-root').count();
    expect(logItems).toBeGreaterThan(0);
  });

  test('should update data in real-time', async ({ page }) => {
    // Get initial sales value
    const initialSales = await page.locator('text=总销售额').first().innerText();
    
    // Wait for 6 seconds (data updates every 5 seconds)
    await page.waitForTimeout(6000);
    
    // Get updated sales value
    const updatedSales = await page.locator('text=总销售额').first().innerText();
    
    // Values should be different due to real-time updates
    expect(initialSales).not.toEqual(updatedSales);
  });

  test('should toggle auto-refresh', async ({ page }) => {
    // Find and click the auto-refresh toggle button
    const refreshButton = page.locator('button[title*="自动刷新"]');
    await refreshButton.click();
    
    // Check if the button state changed
    await expect(refreshButton).not.toHaveClass(/Mui-selected/);
    
    // Click again to re-enable
    await refreshButton.click();
    await expect(refreshButton).toHaveClass(/primary/);
  });

  test('should display data stream visualization', async ({ page }) => {
    // Check if the canvas element is present
    await expect(page.locator('canvas')).toBeVisible();
    
    // Check the section header
    await expect(page.locator('text=实时数据流')).toBeVisible();
  });

  test('should handle room selection', async ({ page }) => {
    // Find and click the first live room card
    await page.locator('.MuiCard-root').first().click();
    
    // Check if room details are displayed
    await expect(page.locator('text=直播间详情')).toBeVisible();
  });
}); 