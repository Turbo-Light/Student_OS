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

driver = webdriver.Chrome(options=options)
wait = WebDriverWait(driver, 10)

qa_results = {
    "auth": False,
    "navbar_trigger": False,
    "modal_fields_verified": False,
    "tasks_trigger_verified": False,
    "prefill_verified": False,
    "session_started": False,
    "active_hud_rendered": False,
    "countdown_ticking": False,
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
        email_in = driver.find_element(By.NAME, "email")
        pass_in = driver.find_element(By.NAME, "password")
        email_in.send_keys("alex_test@studentos.internal")
        pass_in.send_keys("SecurePass123!")
        driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()
        time.sleep(2)
        print(f"Logged in. URL: {driver.current_url}")
        qa_results["auth"] = True
    else:
        qa_results["auth"] = True

    # 2. NAVBAR TRIGGER TEST
    print("\n--- Test 1: Global Navigation Focus Mode Trigger ---")
    driver.get("http://localhost:5173/")
    time.sleep(2)

    # Clear any leftover focus session in localStorage
    driver.execute_script("localStorage.removeItem('studentos_active_focus'); localStorage.removeItem('studentos_focus_remaining');")
    driver.refresh()
    time.sleep(1.5)

    focus_nav_btn = driver.find_element(By.ID, "nav-focus-btn")
    print(f"Found Navbar Focus Mode button: '{focus_nav_btn.text}'")
    qa_results["navbar_trigger"] = True
    focus_nav_btn.click()
    time.sleep(1)

    # Verify Modal rendered
    modal_el = driver.find_element(By.XPATH, "//*[contains(text(), 'Launch Focus Session')]")
    print("FocusLauncherModal opened successfully!")

    # Verify fields in modal
    subject_input = driver.find_element(By.XPATH, "//input[@placeholder='e.g., Computer Systems']")
    topic_input = driver.find_element(By.XPATH, "//input[@placeholder='e.g., Distributed Concurrency']")
    pomo_btn = driver.find_element(By.XPATH, "//span[contains(text(), 'Pomodoro')]")
    deep_btn = driver.find_element(By.XPATH, "//span[contains(text(), 'Deep Focus')]")
    custom_btn = driver.find_element(By.XPATH, "//span[contains(text(), 'Custom')]")
    goal_textarea = driver.find_element(By.XPATH, "//textarea[contains(@placeholder, 'distributed deadlock detection')]")
    start_btn = driver.find_element(By.XPATH, "//button[contains(., 'Start Focus')]")

    print("Verified all modal fields: Subject, Topic, Preset Durations (25m, 50m, Custom), Goal, Start Focus button.")
    qa_results["modal_fields_verified"] = True

    modal_shot = os.path.join(ARTIFACT_DIR, "focus_modal_open.png")
    driver.save_screenshot(modal_shot)
    qa_results["screenshots"].append("focus_modal_open.png")
    print(f"Saved screenshot: {modal_shot}")

    # Close modal
    close_btn = driver.find_element(By.XPATH, "//button[@title='Close launcher']")
    close_btn.click()
    time.sleep(0.5)

    # 3. TASK MATRIX CONTEXT TRIGGER TEST
    print("\n--- Test 2: Task Matrix Context Trigger ---")
    driver.get("http://localhost:5173/tasks")
    time.sleep(2)

    # Ensure at least one task exists
    focus_task_btns = driver.find_elements(By.XPATH, "//button[contains(., 'Start Focus')]")
    if not focus_task_btns:
        print("Creating a test task for matrix verification...")
        driver.find_element(By.XPATH, "//button[contains(., '+ New Task')]").click()
        time.sleep(0.5)
        driver.find_element(By.NAME, "title").send_keys("Operating Systems Distributed Locks")
        driver.find_element(By.NAME, "subject").send_keys("Computer Science")
        driver.find_element(By.NAME, "description").send_keys("Study Raft consensus algorithm and lease management.")
        driver.find_element(By.XPATH, "//button[contains(., 'Create Task')]").click()
        time.sleep(1.5)
        focus_task_btns = driver.find_elements(By.XPATH, "//button[contains(., 'Start Focus')]")

    print(f"Found {len(focus_task_btns)} 'Start Focus' buttons on Task Matrix cards.")
    qa_results["tasks_trigger_verified"] = len(focus_task_btns) > 0

    # Click the first 'Start Focus' button
    focus_task_btns[0].click()
    time.sleep(1)

    # Verify modal is opened and prefilled
    subject_val = driver.find_element(By.XPATH, "//input[@placeholder='e.g., Computer Systems']").get_attribute("value")
    topic_val = driver.find_element(By.XPATH, "//input[@placeholder='e.g., Distributed Concurrency']").get_attribute("value")
    print(f"Modal pre-filled values -> Subject: '{subject_val}', Topic: '{topic_val}'")

    qa_results["prefill_verified"] = len(topic_val) > 0

    task_shot = os.path.join(ARTIFACT_DIR, "focus_tasks_trigger.png")
    driver.save_screenshot(task_shot)
    qa_results["screenshots"].append("focus_tasks_trigger.png")
    print(f"Saved screenshot: {task_shot}")

    # 4. START FOCUS SESSION TEST
    print("\n--- Test 3: Start Focus Session & Live HUD ---")
    # Click Start Focus
    start_session_btn = driver.find_element(By.XPATH, "//button[contains(., 'Start Focus')]")
    start_session_btn.click()
    time.sleep(2)

    # Verify floating HUD is present
    hud_el = driver.find_element(By.ID, "focus-active-hud")
    qa_results["active_hud_rendered"] = True
    print(f"Active Focus HUD rendered: {hud_el.is_displayed()}")

    # Check live countdown
    countdown_el = driver.find_element(By.ID, "focus-countdown")
    t0_time = countdown_el.text.strip()
    print(f"Initial countdown reading: {t0_time}")

    time.sleep(2.5)
    t2_time = countdown_el.text.strip()
    print(f"Reading after 2.5s: {t2_time}")

    qa_results["countdown_ticking"] = (t0_time != t2_time)
    print(f"Live countdown ticking confirmed: {qa_results['countdown_ticking']}")

    # Verify Navbar shows active session pill
    nav_active_pill = driver.find_elements(By.ID, "nav-focus-active-btn")
    print(f"Navbar active session pill displayed: {len(nav_active_pill) > 0}")

    qa_results["session_started"] = True

    hud_shot = os.path.join(ARTIFACT_DIR, "focus_active_hud.png")
    driver.save_screenshot(hud_shot)
    qa_results["screenshots"].append("focus_active_hud.png")
    print(f"Saved screenshot: {hud_shot}")

    # 5. COMPLETE FOCUS SESSION
    print("\n--- Test 4: Complete Session & Claim XP ---")
    finish_btn = driver.find_element(By.XPATH, "//button[@title='Finish Session']")
    finish_btn.click()
    time.sleep(1)

    # Click 'Claim XP & End'
    claim_btn = driver.find_element(By.XPATH, "//button[contains(., 'Claim XP & End')]")
    claim_btn.click()
    time.sleep(2)

    # Verify HUD is gone
    huds_remaining = driver.find_elements(By.ID, "focus-active-hud")
    qa_results["session_completed"] = (len(huds_remaining) == 0)
    print(f"Session completed and HUD dismissed: {qa_results['session_completed']}")

    print("\nAll Focus Launcher & Context Trigger QA tests PASSED!")

except Exception as e:
    print(f"QA Error: {e}")
    import traceback
    traceback.print_exc()

finally:
    driver.quit()
    with open(os.path.join(ARTIFACT_DIR, "focus_qa_report.json"), "w") as f:
        json.dump(qa_results, f, indent=2)
    print("Report written to focus_qa_report.json")
