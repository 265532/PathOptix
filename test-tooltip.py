from playwright.sync_api import sync_playwright
import os

os.makedirs(r'c:\doc\project\PathOptix\docs\theme-verification', exist_ok=True)

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 1440, 'height': 900})
    page.goto('http://localhost:3001')
    page.wait_for_load_state('networkidle')
    page.wait_for_timeout(1000)

    login_btn = page.locator('button[type=submit]')
    if login_btn.is_visible():
        login_btn.click()
        page.wait_for_load_state('networkidle')
        page.wait_for_timeout(1000)

    toggle = page.locator('button[aria-label="收起侧边栏"]')
    if toggle.count() == 0:
        toggle = page.locator('button[aria-label="展开侧边栏"]')

    if toggle.count() > 0:
        toggle.first.click()
        page.wait_for_timeout(500)

        page.screenshot(path=r'c:\doc\project\PathOptix\docs\theme-verification\tooltip-collapsed-state.png')
        print('Collapsed screenshot taken')

        menu_buttons = page.locator('nav button')
        if menu_buttons.count() > 0:
            menu_buttons.nth(0).hover()
            page.wait_for_timeout(300)
            page.screenshot(path=r'c:\doc\project\PathOptix\docs\theme-verification\tooltip-hover-item1.png')
            print('Hover item 1 screenshot taken')

            menu_buttons.nth(1).hover()
            page.wait_for_timeout(300)
            page.screenshot(path=r'c:\doc\project\PathOptix\docs\theme-verification\tooltip-hover-item2.png')
            print('Hover item 2 screenshot taken')

            menu_buttons.nth(3).hover()
            page.wait_for_timeout(300)
            page.screenshot(path=r'c:\doc\project\PathOptix\docs\theme-verification\tooltip-hover-item4.png')
            print('Hover item 4 screenshot taken')

            last_idx = menu_buttons.count() - 1
            menu_buttons.nth(last_idx).hover()
            page.wait_for_timeout(300)
            page.screenshot(path=r'c:\doc\project\PathOptix\docs\theme-verification\tooltip-hover-settings.png')
            print('Hover settings screenshot taken')
    else:
        print('Toggle button not found!')

    browser.close()
    print('Done')
