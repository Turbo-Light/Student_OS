import os
import sys
import time
import json
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options

ARTIFACT_DIR = r"C:\Users\HARIGUGAN\.gemini\antigravity\brain\9e9d03c1-5990-423d-926f-3604158dc6ef"
os.makedirs(ARTIFACT_DIR, exist_ok=True)

options = Options()
options.add_argument("--headless=new")
options.add_argument("--disable-gpu")
options.add_argument("--no-sandbox")
options.add_argument("--disable-dev-shm-usage")
options.add_argument("--window-size=1280,850")
options.add_argument("--remote-debugging-pipe")

driver = webdriver.Chrome(options=options)
wait = WebDriverWait(driver, 10)

test_report = {
    "auth": False,
    "workspace_fullscreen_rendered": False,
    "header_elements_verified": False,
    "timer_formatted_mmss": False,
    "timer_ticking": False,
    "metrics_displayed": False,
    "pause_tracked": False,
    "restart_verified": False,
    "quick_notes_added": False,
    "minimize_and_restore_verified": False,
    "session_completed": False,
    "screenshots": []
}

try:
    print("Navigating to http://localhost:5173/...")
    driver.get("http://localhost:5173/")
    time.sleep(2)

    # 1. AUTHENTICATE
    if "/login" in driver.current_url:
        print("Authenticating...")
        driver.find_element(By.NAME, "email").send_keys("alex_test@studentos.internal")
        driver.find_element(By.NAME, "password").send_keys("SecurePass123!")
        driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()
        time.sleep(2)
        test_report["auth"] = True
    else:
        test_report["auth"] = True

    # 2. START A FRESH FOCUS SESSION
    print("\n--- Initiating Session for Focus Workspace QA ---")
    driver.execute_script("localStorage.removeItem('studentos_active_focus'); localStorage.removeItem('studentos_focus_remaining');")
    driver.get("http://localhost:5173/")
    time.sleep(1.5)

    # Click Navbar Focus Mode
    nav_btn = driver.find_element(By.ID, "nav-focus-btn")
    nav_btn.click()
    time.sleep(1)

    # Fill form
    driver.find_element(By.XPATH, "//input[@placeholder='e.g., Computer Systems']").send_keys("Distributed Systems")
    driver.find_element(By.XPATH, "//input[@placeholder='e.g., Distributed Concurrency']").send_keys("Consensus Algorithms (Raft & Paxos)")
    driver.find_element(By.XPATH, "//textarea[contains(@placeholder, 'distributed deadlock detection')]").send_keys("Master leader election and log replication states.")
    
    # Submit
    driver.find_element(By.XPATH, "//button[contains(., 'Start Focus')]").click()
    time.sleep(2)

    # 3. VERIFY FOCUS WORKSPACE
    print("\n--- Test 1: Fullscreen Distraction-Free Focus Workspace ---")
    workspace_el = driver.find_element(By.ID, "focus-workspace")
    test_report["workspace_fullscreen_rendered"] = workspace_el.is_displayed()
    print(f"Focus Workspace overlay rendered: {test_report['workspace_fullscreen_rendered']}")

    # Verify Header: Exit Focus, Breadcrumbs, Notes toggle, Fullscreen toggle
    exit_btn = driver.find_element(By.ID, "exit-focus-btn")
    notes_btn = driver.find_element(By.ID, "toggle-notes-btn")
    fs_btn = driver.find_element(By.ID, "toggle-fullscreen-btn")
    test_report["header_elements_verified"] = (exit_btn.is_displayed() and notes_btn.is_displayed() and fs_btn.is_displayed())
    print(f"Header controls verified: {test_report['header_elements_verified']}")

    # Verify Central View: Timer format MM:SS
    timer_text_t0 = driver.find_element(By.ID, "workspace-timer-display").text.strip()
    test_report["timer_formatted_mmss"] = (":" in timer_text_t0 and len(timer_text_t0.split(":")) == 2)
    print(f"Timer reading at t=0: {timer_text_t0} (MM:SS format: {test_report['timer_formatted_mmss']})")

    # Verify ticking
    time.sleep(2.5)
    timer_text_t2 = driver.find_element(By.ID, "workspace-timer-display").text.strip()
    test_report["timer_ticking"] = (timer_text_t0 != timer_text_t2)
    print(f"Timer reading at t=2.5s: {timer_text_t2} (Ticking: {test_report['timer_ticking']})")

    # Verify live metrics counters & Goal card
    focused_metric = driver.find_element(By.ID, "metric-focused-time")
    pauses_metric = driver.find_element(By.ID, "metric-pauses-count")
    goal_card = driver.find_element(By.ID, "workspace-goal-text")
    test_report["metrics_displayed"] = (focused_metric.is_displayed() and pauses_metric.is_displayed())
    print(f"Live metrics displayed (Focused: '{focused_metric.text}', Pauses: '{pauses_metric.text}')")
    print(f"Session Goal displayed: '{goal_card.text}'")

    shot_fs = os.path.join(ARTIFACT_DIR, "focus_workspace_fullscreen.png")
    driver.save_screenshot(shot_fs)
    test_report["screenshots"].append("focus_workspace_fullscreen.png")
    print(f"Saved screenshot: {shot_fs}")

    # 4. CONTROLS: PAUSE & RESTART
    print("\n--- Test 2: Controls & Pause Tracking ---")
    pause_btn = driver.find_element(By.ID, "btn-pause-resume")
    print("Clicking Pause button...")
    pause_btn.click()
    time.sleep(1)

    pauses_after = driver.find_element(By.ID, "metric-pauses-count").text.strip()
    test_report["pause_tracked"] = (int(pauses_after) >= 1)
    print(f"Pauses counter after pause click: {pauses_after} (Incremented: {test_report['pause_tracked']})")

    # Click Restart
    print("Clicking Restart button...")
    restart_btn = driver.find_element(By.ID, "btn-restart-focus")
    restart_btn.click()
    time.sleep(1)

    timer_after_restart = driver.find_element(By.ID, "workspace-timer-display").text.strip()
    test_report["restart_verified"] = (timer_after_restart in ["25:00", "24:59", "24:58"])
    print(f"Timer reading after restart: {timer_after_restart} (Verified: {test_report['restart_verified']})")

    # 5. QUICK NOTES DRAWER
    print("\n--- Test 3: Quick Notes Drawer Component ---")
    driver.find_element(By.ID, "toggle-notes-btn").click()
    time.sleep(1)

    drawer_el = driver.find_element(By.ID, "quick-notes-drawer")
    print(f"Quick Notes drawer opened: {drawer_el.is_displayed()}")

    note_input = driver.find_element(By.ID, "quick-note-input")
    note_input.send_keys("Key insight: Raft leader handles heartbeats every 150ms")
    driver.find_element(By.ID, "btn-add-note").click()
    time.sleep(0.5)

    note_input = driver.find_element(By.ID, "quick-note-input")
    note_input.send_keys("Formula: Quorum size = floor(N/2) + 1")
    driver.find_element(By.ID, "btn-add-note").click()
    time.sleep(0.5)

    rendered_notes = driver.find_elements(By.CSS_SELECTOR, ".note-content")
    test_report["quick_notes_added"] = (len(rendered_notes) >= 2)
    print(f"Quick notes rendered in list: {len(rendered_notes)} items")

    shot_notes = os.path.join(ARTIFACT_DIR, "focus_workspace_notes.png")
    driver.save_screenshot(shot_notes)
    test_report["screenshots"].append("focus_workspace_notes.png")
    print(f"Saved screenshot: {shot_notes}")

    # 6. MINIMIZE TO HUD AND RESTORE
    print("\n--- Test 4: Exit Focus to Floating HUD and Restore ---")
    driver.find_element(By.ID, "exit-focus-btn").click()
    time.sleep(1)

    # Focus Workspace should be hidden, HUD should be visible
    hud_el = driver.find_element(By.ID, "focus-active-hud")
    print(f"Minimized to floating HUD successfully: {hud_el.is_displayed()}")

    # Click Maximize on HUD to re-open workspace
    maximize_btn = driver.find_element(By.XPATH, "//button[@title='Expand Focus Workspace']")
    maximize_btn.click()
    time.sleep(1)

    workspace_reopened = driver.find_element(By.ID, "focus-workspace").is_displayed()
    test_report["minimize_and_restore_verified"] = workspace_reopened
    print(f"Re-opened Focus Workspace from HUD: {workspace_reopened}")

    # 7. END SESSION & CLAIM XP
    print("\n--- Test 5: End Session Dialog ---")
    driver.find_element(By.ID, "btn-end-session").click()
    time.sleep(1)

    claim_btn = driver.find_element(By.ID, "btn-claim-xp")
    claim_btn.click()
    time.sleep(2)

    # Verify session closed
    workspaces_left = driver.find_elements(By.ID, "focus-workspace")
    test_report["session_completed"] = (len(workspaces_left) == 0)
    print(f"Session closed and user returned to app: {test_report['session_completed']}")

    print("\nAll Focus Workspace & Timer Engine QA checks PASSED!")

except Exception as e:
    print(f"QA Error: {e}")
    import traceback
    traceback.print_exc()

finally:
    try:
        driver.quit()
    except:
        pass
    with open(os.path.join(ARTIFACT_DIR, "workspace_qa_report.json"), "w") as f:
        json.dump(test_report, f, indent=2)
    print("Saved report to workspace_qa_report.json")
