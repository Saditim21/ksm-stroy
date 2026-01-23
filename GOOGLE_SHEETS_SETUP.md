# Google Sheets Setup for Apartment Management

This guide explains how to set up Google Sheets so your clients can update apartment availability themselves.

## Step 1: Create the Google Sheet

1. Go to [Google Sheets](https://sheets.google.com) and create a new spreadsheet
2. Name it something like "Golden Residence - Apartments"
3. Create two sheets (tabs at the bottom):
   - **Block A** - for Block A apartments
   - **Block B** - for Block B apartments

## Step 2: Set Up the Column Headers

In each sheet, add these column headers in Row 1:

| Етаж | Апартамент | Застроена | Идеални | Обща | Вид | Изложение | Статус |
|------|------------|-----------|---------|------|-----|-----------|--------|
| Floor | Apartment | Built | Ideal | Total | Type | Exposure | Status |

## Step 3: Add Apartment Data

Fill in the apartment data. Example:

| Етаж | Апартамент | Застроена | Идеални | Обща | Вид | Изложение | Статус |
|------|------------|-----------|---------|------|-----|-----------|--------|
| 1 | А 101 | 57.46 | 8.22 | 65.68 | 2-стаен | Юг | Свободен |
| 1 | А 102 | 97.74 | 14.00 | 111.74 | 3-стаен | Юг/Изток | Продадени |
| 1 | А 103 | 93.78 | 13.46 | 107.24 | 3-стаен | Изток | Свободен |

### Valid Status Values:
- **Свободен** - Available
- **Резервиран** - Reserved
- **Продадени** - Sold

## Step 4: Publish the Sheet

1. Go to **File > Share > Publish to web**
2. In the dropdown, select the specific sheet tab (e.g., "Block A")
3. Select **Comma-separated values (.csv)** as the format
4. Click **Publish**
5. Copy the URL that appears

**IMPORTANT:** Repeat this for each sheet tab (Block A and Block B)

Example URLs will look like:
```
https://docs.google.com/spreadsheets/d/e/2PACX-1vS.../pub?gid=0&single=true&output=csv
https://docs.google.com/spreadsheets/d/e/2PACX-1vS.../pub?gid=123456&single=true&output=csv
```

## Step 5: Configure the Website

1. Create a `.env` file in the project root (copy from `.env.example`)
2. Add your published sheet URLs:

```env
VITE_GOOGLE_SHEET_BLOCK_A=https://docs.google.com/spreadsheets/d/e/YOUR_ID/pub?gid=0&single=true&output=csv
VITE_GOOGLE_SHEET_BLOCK_B=https://docs.google.com/spreadsheets/d/e/YOUR_ID/pub?gid=123456&single=true&output=csv
```

3. Rebuild and deploy the website

## How Your Clients Use It

Once set up, your clients can:

1. Open the Google Sheet
2. Find the apartment they need to update
3. Change the **Статус** column to:
   - `Свободен` (Available)
   - `Резервиран` (Reserved)
   - `Продадени` (Sold)
4. Wait ~5 minutes for the website to update (data is cached)

**Note:** Changes appear on the website automatically - no deployment needed!

## Sharing Access with Clients

1. Click **Share** button in Google Sheets
2. Add your client's email
3. Give them **Editor** access
4. They can now edit the sheet directly

## Troubleshooting

### Changes not showing up?
- Data is cached for 5 minutes
- Make sure the sheet is published (step 4)
- Check that the column headers match exactly

### Getting errors?
- Verify the URLs in `.env` are correct
- Make sure the sheet is public (published to web)
- Check browser console for error messages

## Data Backup

The website has built-in fallback data. If Google Sheets is unavailable:
- The website will show the last known data
- If that fails, it shows the default apartment data from the code

This ensures the website never breaks even if Google Sheets has issues.
