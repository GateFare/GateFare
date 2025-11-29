# Admin Guide: Project Setup, Modifications, and Deployment

This guide provides step-by-step instructions for setting up the project from scratch, modifying content (coupons, phone numbers), and redeploying the website.

---

## Part 0: Project Setup (For New Developers)

If you have received this project as a ZIP file, follow these steps to get it running on your computer.

### 1. Install Prerequisites
Before you begin, ensure you have the following software installed:

*   **Node.js**: Download and install the "LTS" version from [nodejs.org](https://nodejs.org/).
*   **Visual Studio Code (VS Code)**: This is the recommended code editor. Download it from [code.visualstudio.com](https://code.visualstudio.com/).

### 2. Unzip and Open the Project
1.  **Extract the ZIP file**: Unzip the project folder to a location on your computer (e.g., Desktop or Documents).
2.  **Open in VS Code**:
    *   Open Visual Studio Code.
    *   Go to **File** > **Open Folder...**
    *   Select the unzipped project folder.

### 3. Install Dependencies
1.  In VS Code, open the terminal by pressing `` Ctrl + ` `` (backtick) or going to **Terminal** > **New Terminal**.
2.  Type the following command and press Enter:
    ```bash
    npm install
    ```
    *   This will download all the necessary libraries. It might take a few minutes.

### 4. Run the Project Locally
To see the website running on your computer:
1.  In the terminal, type:
    ```bash
    npm run dev
    ```
2.  Open your web browser and go to `http://localhost:3000`.
3.  You should see the website running!

---

## Part 1: Modifying Coupons

To change the coupon codes and discount percentages, you need to edit **`components/booking/booking-wizard.tsx`**.

### Step 1: Update the Logic
1.  Open `components/booking/booking-wizard.tsx`.
2.  Search for the `applyCoupon` function (around line 90).
3.  Locate the logic block:
    ```javascript
    if (code === "DOM10" && isFlightDomestic()) {
        setDiscount(0.10) // This is 10%
        setCouponApplied(true)
    } else if (code === "INT20" && !isFlightDomestic()) {
        setDiscount(0.20) // This is 20%
        setCouponApplied(true)
    }
    ```
4.  **Change the Code:** Replace `"DOM10"` or `"INT20"` with your new code (e.g., `"SUMMER50"`).
5.  **Change the Percentage:** Update `0.10` (10%) or `0.20` (20%) to your desired decimal value (e.g., `0.50` for 50%).

### Step 2: Update the Display Text
1.  Scroll down to the "Available Coupons" section (around line 580).
2.  **For the first coupon (Domestic):**
    *   Find the text `DOM10` and change it to your new code.
    *   Find the text `10% OFF` and change it to your new percentage text.
    *   Find the button click handler: `setCouponCode("DOM10")` and change `"DOM10"` to your new code.
3.  **For the second coupon (International):**
    *   Find the text `INT20` and change it to your new code.
    *   Find the text `20% OFF` and change it to your new percentage text.
    *   Find the button click handler: `setCouponCode("INT20")` and change `"INT20"` to your new code.

---

## Part 2: Updating Phone Numbers

The phone number appears in multiple files. You should update all of them to ensure consistency.

**Search and Replace:**
Open each of the following files and search for the phone number (either `844-638-0111` or `555-123-4567`) and replace it with your new number.

1.  **`components/footer.tsx`** (Line ~111)
    *   Look for: `<span>+1-844-638-0111</span>`
    *   Replace with your new number.

2.  **`components/booking/booking-wizard.tsx`** (Line ~318)
    *   Look for: `call <span className="text-blue-600">+1-844-638-0111</span>`
    *   Replace with your new number.

3.  **`app/api/enquiry/route.ts`** (Line ~652)
    *   Look for: `<strong>+1-844-638-0111</strong>`
    *   Replace with your new number.

4.  **`components/navbar.tsx`** (Line ~87)
    *   Look for: `+1 (555) 123-4567`
    *   Replace with your new number. Also update the `href="tel:+15551234567"` link.

5.  **`app/contact/page.tsx`** (Line ~175 and ~239)
    *   Look for: `+1 (555) 123-4567`
    *   Replace with your new number.

---

## Part 3: Redeploying to Vercel

Once you have saved all your changes, follow these steps to make them live.

1.  **Open Terminal:**
    *   Navigate to the project folder in your terminal (Command Prompt or PowerShell).

2.  **Stage Changes:**
    Type the following command and press Enter:
    ```bash
    git add .
    ```

3.  **Commit Changes:**
    Type the following command and press Enter (you can change the message inside quotes):
    ```bash
    git commit -m "Update coupons and phone numbers"
    ```

4.  **Push to GitHub:**
    Type the following command and press Enter:
    ```bash
    git push origin main
    ```

5.  **Deploy to Vercel:**
    Type the following command and press Enter:
    ```bash
    npx -y vercel --prod
    ```
    *   If it asks "Inspect?", you can just wait or press Enter.
    *   Wait for it to finish. It will show a "Production" URL when done.

**Done!** Your changes are now live on the website.
