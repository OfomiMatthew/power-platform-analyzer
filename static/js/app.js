// DOM Elements
const suiteSelect = document.getElementById("suite-select");
const suiteInfo = document.getElementById("suite-info");
const suiteDescription = document.getElementById("suite-description");
const codeInput = document.getElementById("code-input");
const charCount = document.getElementById("char-count");
const lineCount = document.getElementById("line-count");
const analyzeBtn = document.getElementById("analyze-btn");
const welcomeMessage = document.getElementById("welcome-message");
const loadingState = document.getElementById("loading-state");
const resultsContainer = document.getElementById("results-container");
const copyBtn = document.getElementById("copy-btn");
const verifyBtn = document.getElementById("verify-btn");
const themeToggle = document.getElementById("theme-toggle");
const themeLabel = document.getElementById("theme-label");
const themeIcon = document.getElementById("theme-icon");

// Store current suite for verification
let currentSuite = "";

// Suite descriptions
const suiteDescriptions = {
  power_apps:
    "Power Apps uses formulas similar to Excel. Paste your app formulas, control properties, or behavioral expressions.",
  power_bi:
    "Power BI uses DAX (Data Analysis Expressions) and M (Power Query). Paste your measures, calculated columns, or data transformation queries.",
  power_automate:
    "Power Automate uses expressions and dynamic content. Paste your flow expressions, conditions, or data operations.",
};

// Suite placeholders
const suitePlaceholders = {
  power_apps:
    'Example:\nIf(IsBlank(TextInput1.Text), \n    Notify("Please enter a value", NotificationType.Warning),\n    Set(UserName, TextInput1.Text)\n)',
  power_bi:
    "Example:\nTotal Sales = \nSUMX(\n    Sales,\n    Sales[Quantity] * Sales[Price]\n)",
  power_automate:
    "Example:\n@if(equals(triggerBody()?['Status'], 'Approved'), \n    'Send approval email', \n    'Send rejection email'\n)",
};

// Event Listeners
suiteSelect.addEventListener("change", handleSuiteChange);
codeInput.addEventListener("input", handleCodeInput);
analyzeBtn.addEventListener("click", analyzeCode);
copyBtn.addEventListener("click", copyCode);
verifyBtn.addEventListener("click", verifyCorrection);
themeToggle.addEventListener("click", toggleTheme);

// Initialize
initializeTheme();
updateButtonState();

/**
 * Handle suite selection change
 */
function handleSuiteChange() {
  const selectedSuite = suiteSelect.value;

  if (selectedSuite) {
    // Show suite info
    suiteInfo.classList.remove("hidden");
    suiteInfo.classList.add("fade-in");
    suiteDescription.textContent = suiteDescriptions[selectedSuite];

    // Update placeholder
    codeInput.placeholder = suitePlaceholders[selectedSuite];
  } else {
    // Hide suite info
    suiteInfo.classList.add("hidden");
    codeInput.placeholder = "Paste your Power Platform code here...";
  }

  updateButtonState();
}

/**
 * Handle code input changes
 */
function handleCodeInput() {
  const code = codeInput.value;
  const chars = code.length;
  const lines = code.split("\n").length;

  charCount.textContent = `${chars} character${chars !== 1 ? "s" : ""}`;
  lineCount.textContent = `${lines} line${lines !== 1 ? "s" : ""}`;

  updateButtonState();
}

/**
 * Update analyze button state
 */
function updateButtonState() {
  const hasCode = codeInput.value.trim().length > 0;
  const hasSuite = suiteSelect.value !== "";

  analyzeBtn.disabled = !(hasCode && hasSuite);
}

/**
 * Analyze code using AI
 */
async function analyzeCode() {
  const code = codeInput.value.trim();
  const suite = suiteSelect.value;

  if (!code || !suite) {
    return;
  }

  // Store current suite
  currentSuite = suite;

  // Hide verification section from previous analysis
  const verificationSection = document.getElementById("verification-section");
  if (verificationSection) {
    verificationSection.classList.add("hidden");
  }

  // Show loading state
  welcomeMessage.classList.add("hidden");
  resultsContainer.classList.add("hidden");
  loadingState.classList.remove("hidden");
  loadingState.classList.add("fade-in");

  // Disable analyze button
  analyzeBtn.disabled = true;

  try {
    const response = await fetch("/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ code, suite }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Analysis failed");
    }

    const result = await response.json();

    // Hide loading, show results
    loadingState.classList.add("hidden");
    displayResults(result);
  } catch (error) {
    console.error("Error:", error);
    loadingState.classList.add("hidden");
    alert(`Error: ${error.message}`);
    welcomeMessage.classList.remove("hidden");
  } finally {
    analyzeBtn.disabled = false;
    updateButtonState();
  }
}

/**
 * Display analysis results
 */
function displayResults(result) {
  // Show results container
  resultsContainer.classList.remove("hidden");
  resultsContainer.classList.add("fade-in");

  // Status Summary
  const statusSummary = document.getElementById("status-summary");
  statusSummary.innerHTML = "";

  const statusBadge = result.has_errors ? "error-badge" : "success-badge";
  const statusIcon = result.has_errors
    ? "fa-exclamation-circle"
    : "fa-check-circle";
  const statusText = result.has_errors ? "Issues Found" : "No Issues Found";

  statusSummary.innerHTML = `
        <div class="flex items-center justify-between">
            <span class="flex items-center space-x-2">
                <i class="fas ${statusIcon}"></i>
                <span class="font-medium">Status:</span>
            </span>
            <span class="px-3 py-1 rounded-full text-sm font-medium ${statusBadge}">${statusText}</span>
        </div>
        <div class="flex items-center justify-between mt-2">
            <span class="flex items-center space-x-2">
                <i class="fas fa-chart-line"></i>
                <span class="font-medium">Severity:</span>
            </span>
            <span class="px-3 py-1 rounded-full text-sm font-medium ${getSeverityBadge(
              result.severity
            )}">${result.severity.toUpperCase()}</span>
        </div>
    `;

  // Errors Section
  const errorsSection = document.getElementById("errors-section");
  const errorsList = document.getElementById("errors-list");

  if (result.errors && result.errors.length > 0) {
    errorsSection.classList.remove("hidden");
    errorsList.innerHTML = result.errors
      .map(
        (error) => `
            <li class="flex items-start space-x-2 text-red-700">
                <i class="fas fa-times-circle mt-1"></i>
                <span>${error}</span>
            </li>
        `
      )
      .join("");
  } else {
    errorsSection.classList.add("hidden");
  }

  // Corrected Code
  const correctedCode = document.getElementById("corrected-code");
  correctedCode.textContent =
    result.corrected_code || "No corrected code available.";

  // Changes Section
  const changesSection = document.getElementById("changes-section");
  const changesList = document.getElementById("changes-list");

  if (
    result.changes &&
    result.changes.length > 0 &&
    result.changes[0] !== "No changes needed."
  ) {
    changesSection.classList.remove("hidden");
    changesList.innerHTML = result.changes
      .map(
        (change) => `
            <li class="flex items-start space-x-2 text-blue-700">
                <i class="fas fa-arrow-right mt-1"></i>
                <span>${change}</span>
            </li>
        `
      )
      .join("");
  } else {
    changesSection.classList.add("hidden");
  }

  // Explanation
  const explanationText = document.getElementById("explanation-text");
  explanationText.textContent =
    result.explanation || "No explanation available.";

  // Best Practices Section
  const bestPracticesSection = document.getElementById(
    "best-practices-section"
  );
  const bestPracticesList = document.getElementById("best-practices-list");

  if (result.best_practices && result.best_practices.length > 0) {
    bestPracticesSection.classList.remove("hidden");
    bestPracticesList.innerHTML = result.best_practices
      .map(
        (practice) => `
            <li class="flex items-start space-x-2 text-purple-700">
                <i class="fas fa-star mt-1"></i>
                <span>${practice}</span>
            </li>
        `
      )
      .join("");
  } else {
    bestPracticesSection.classList.add("hidden");
  }

  // Scroll to results
  resultsContainer.scrollIntoView({ behavior: "smooth", block: "start" });
}

/**
 * Get severity badge class
 */
function getSeverityBadge(severity) {
  const badges = {
    low: "success-badge",
    medium: "warning-badge",
    high: "error-badge",
  };
  return badges[severity] || badges.low;
}

/**
 * Copy corrected code to clipboard
 */
async function copyCode() {
  const correctedCode = document.getElementById("corrected-code").textContent;

  try {
    await navigator.clipboard.writeText(correctedCode);

    // Update button text temporarily
    const originalHTML = copyBtn.innerHTML;
    copyBtn.innerHTML = '<i class="fas fa-check"></i><span>Copied!</span>';
    copyBtn.classList.add("bg-green-100");

    setTimeout(() => {
      copyBtn.innerHTML = originalHTML;
      copyBtn.classList.remove("bg-green-100");
    }, 2000);
  } catch (error) {
    console.error("Failed to copy:", error);
    alert("Failed to copy code to clipboard");
  }
}

/**
 * Verify the corrected code
 */
async function verifyCorrection() {
  const correctedCode = document.getElementById("corrected-code").textContent;

  if (!correctedCode || !currentSuite) {
    alert("No code to verify");
    return;
  }

  // Show loading state on button
  const originalHTML = verifyBtn.innerHTML;
  verifyBtn.innerHTML =
    '<div class="spinner inline-block" style="width: 16px; height: 16px; border-width: 2px;"></div><span>Verifying...</span>';
  verifyBtn.disabled = true;

  try {
    const response = await fetch("/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ code: correctedCode, suite: currentSuite }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Verification failed");
    }

    const result = await response.json();
    displayVerificationResult(result);
  } catch (error) {
    console.error("Error:", error);
    alert(`Verification error: ${error.message}`);
  } finally {
    verifyBtn.innerHTML = originalHTML;
    verifyBtn.disabled = false;
  }
}

/**
 * Display verification results
 */
function displayVerificationResult(result) {
  const verificationSection = document.getElementById("verification-section");
  const verificationContent = document.getElementById("verification-content");

  verificationSection.classList.remove("hidden");
  verificationSection.classList.add("fade-in");

  if (result.is_valid) {
    // Code is valid
    verificationContent.className =
      "rounded-lg p-4 border border-green-200 bg-green-50";
    verificationContent.innerHTML = `
            <div class="flex items-start space-x-3">
                <i class="fas fa-check-circle text-green-600 text-2xl"></i>
                <div>
                    <h4 class="font-semibold text-green-900 mb-2">✓ Verification Passed</h4>
                    <p class="text-green-800 mb-2">${result.message}</p>
                    ${
                      result.notes && result.notes.length > 0
                        ? `
                        <div class="mt-3">
                            <p class="font-medium text-green-900 text-sm mb-1">Additional Notes:</p>
                            <ul class="text-sm text-green-800 space-y-1">
                                ${result.notes
                                  .map(
                                    (note) =>
                                      `<li class="flex items-start space-x-2"><i class="fas fa-info-circle mt-0.5"></i><span>${note}</span></li>`
                                  )
                                  .join("")}
                            </ul>
                        </div>
                    `
                        : ""
                    }
                </div>
            </div>
        `;
  } else {
    // Code still has issues
    verificationContent.className =
      "rounded-lg p-4 border border-orange-200 bg-orange-50";
    verificationContent.innerHTML = `
            <div class="flex items-start space-x-3">
                <i class="fas fa-exclamation-triangle text-orange-600 text-2xl"></i>
                <div>
                    <h4 class="font-semibold text-orange-900 mb-2">⚠ Issues Still Detected</h4>
                    <p class="text-orange-800 mb-2">${result.message}</p>
                    ${
                      result.remaining_issues &&
                      result.remaining_issues.length > 0
                        ? `
                        <div class="mt-3">
                            <p class="font-medium text-orange-900 text-sm mb-1">Remaining Issues:</p>
                            <ul class="text-sm text-orange-800 space-y-1">
                                ${result.remaining_issues
                                  .map(
                                    (issue) =>
                                      `<li class="flex items-start space-x-2"><i class="fas fa-times-circle mt-0.5"></i><span>${issue}</span></li>`
                                  )
                                  .join("")}
                            </ul>
                        </div>
                    `
                        : ""
                    }
                    ${
                      result.suggestions && result.suggestions.length > 0
                        ? `
                        <div class="mt-3">
                            <p class="font-medium text-orange-900 text-sm mb-1">Suggestions:</p>
                            <ul class="text-sm text-orange-800 space-y-1">
                                ${result.suggestions
                                  .map(
                                    (suggestion) =>
                                      `<li class="flex items-start space-x-2"><i class="fas fa-lightbulb mt-0.5"></i><span>${suggestion}</span></li>`
                                  )
                                  .join("")}
                            </ul>
                        </div>
                    `
                        : ""
                    }
                </div>
            </div>
        `;
  }
}

/**
 * Initialize theme from localStorage
 */
function initializeTheme() {
  const savedTheme = localStorage.getItem("theme") || "light";
  if (savedTheme === "dark") {
    document.documentElement.classList.add("dark");
    updateThemeUI("dark");
  } else {
    document.documentElement.classList.remove("dark");
    updateThemeUI("light");
  }
}

/**
 * Toggle between light and dark theme
 */
function toggleTheme() {
  const isDark = document.documentElement.classList.contains("dark");

  if (isDark) {
    document.documentElement.classList.remove("dark");
    localStorage.setItem("theme", "light");
    updateThemeUI("light");
  } else {
    document.documentElement.classList.add("dark");
    localStorage.setItem("theme", "dark");
    updateThemeUI("dark");
  }
}

/**
 * Update theme UI elements
 */
function updateThemeUI(theme) {
  if (theme === "dark") {
    themeLabel.textContent = "Dark";
    themeIcon.className = "fas fa-moon text-blue-400";
  } else {
    themeLabel.textContent = "Light";
    themeIcon.className = "fas fa-sun text-yellow-500";
  }
}
